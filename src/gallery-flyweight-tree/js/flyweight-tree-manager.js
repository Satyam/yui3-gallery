/**
* @module gallery-flyweight-tree
* @submodule flyweight-tree-manager
*
*/

/**
 * Extension to handle its child nodes by using the flyweight pattern.
 * @class FlyweightTreeManager
 * @constructor
 */
FWMgr = function () {
	this._pool = {
		_default: []
	};
};

FWMgr.ATTRS = {
	/**
	 * Default object type of the child nodes if no explicit type is given in the configuration tree.
	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.  
	 * 
	 * @attribute defaultType
	 * @type {String | Object}
	 * @default 'FlyweightTreeNode'
	 */
	defaultType: {
		value: 'FlyweightTreeNode'			
	},
	/**
	 * Function used to load the nodes dynamically.
	 * Function will run in the scope of the FlyweightTreeManager instance and will
	 * receive:
	 * 
	 * * node {Y.FlyweightTreeNode} reference to the parent of the children to be loaded.
	 * * callback {Function} function to call with the configuration info for the children.
	 * 
	 * The function shall fetch the nodes and create a configuration object 
	 * much like the one a whole tree might receive.  
	 * It is not limited to just one level of nodes, it might contain children elements as well.
	 * When the data is processed, it should call the callback with the configuration object.
	 * The function is responsible of handling any errors.
	 * If the the callback is called with no arguments, the parent node will be marked as having no children.
	 * @attribute dynamicLoader
	 * @type {Function}
	 * @default null
	 */
	dynamicLoader: {
		validator: Lang.isFunction,
		value: null
	}
};


FWMgr.prototype = {
	/**
	 * Clone of the configuration tree.
	 * The FlyweightTreeNode instances will use the nodes in this tree as the storage for their state.
	 * @property _tree
	 * @type Object
	 * @private
	 */
	_tree: null,
	/**
	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.  
	 * It contains a hash of arrays indexed by the node type. 
	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.
	 * @property _pool
	 * @type {Object}
	 * @private
	 */
	_pool: null,
	/**
	 * List of dom events to be listened for at the outer contained and fired again
	 * at the node once positioned over the source node.
	 * @property _domEvents
	 * @type Array of strings
	 * @protected
	 * @default null
	 */
	_domEvents: null,
	
	/**
	 * Method to load the configuration tree.
	 * This is not done in the constructor so as to allow the subclass 
	 * to process the tree definition anyway it wants, adding defaults and such
	 * and to name the tree whatever is suitable.
	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.
	 * It also sets initial values for some default properties such as `parent` references and `id` for all nodes.
	 * @method _loadConfig
	 * @param tree {Object} configuration tree
	 * @protected
	 */
	_loadConfig: function (tree) {
		this._tree = {
			children: Y.clone(tree)
		};
		var initNodes = function (parent) {
			Y.Array.each(parent.children, function (child) {
				child._parent = parent;
				child.id = child.id || Y.guid();
				initNodes(child);
			});
		};
		initNodes(this._tree);
		if (this._domEvents) {
			Y.Array.each(this._domEvents, function (event) {
				this.after(event, this._afterDomEvent, this);
			}, this);
		}
	},
	/** Generic event listener for DOM events listed in the {{#crossLink "_domEvents"}}{{/crossLink}} array.
	 *  It will locate the node that caused the event, slide a suitable instance on it and fire the
	 *  same event on that node.
	 *  @method _afterEvent
	 *  @param ev {EventFacade} Event facade as produced by the event
	 *  @private
	 */
	_afterDomEvent: function (ev) {
		var node = this._poolFetchFromEvent(ev);
		if (node) {
			node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
			this._poolReturn(node);			
		}
	},
	/**
	 * Pulls from the pool an instance of the type declared in the given node
	 * and slides it over that node.
	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink "_getNode"}}{{/crossLink}}
	 * If an instance is held (see: {{#crossLink "Y.FlyweightTreeNode/hold"}}{{/crossLink}}), it will be returned instead.
	 * @method _poolFetch
	 * @param node {Object} reference to a node within the configuration tree
	 * @return {Y.FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given node
	 * @protected
	 */
	_poolFetch: function(node) {
		var pool,
			fwNode = node._held,
			type = node.type || DEFAULT_POOL;
			
		if (fwNode) {
			return fwNode;
		}
		if (Lang.isObject(type)) {
			// If the type of object cannot be identified, return a default type.
			type = type.NAME || DEFAULT_POOL;
		}
		pool = this._pool[type] || [];
		if (pool === undefined) {
			pool = this._pool[type] = [];
		}
		if (pool.length) {
			fwNode = pool.pop();
			fwNode._slideTo(node);
			return fwNode;
		}
		return this._getNode(node);
	},
	/**
	 * Returns the FlyweightTreeNode instance to the pool.
	 * Instances held (see: {{#crossLink "Y.FlyweightTreeNode/hold"}}{{/crossLink}}) are never returned.
	 * @method _poolReturn
	 * @param fwNode {Y.FlyweightTreeNode} Instance to return.
	 * @protected
	 */
	_poolReturn: function (fwNode) {
		if (fwNode._node._held) {
			return;
		}
		var pool,
			type = fwNode._node.type || DEFAULT_POOL;
		if (Lang.isObject(type)) {
			type = type.NAME;
			if (!type) {
				// Don't know where to put it, drop it.
				return;
			}
		}
		pool = this._pool[type];
		if (pool) {
			pool.push(fwNode);
		}
		
	},
	/**
	 * Returns a new instance of the type given in node or the 
	 * {{#crossLink "defaultType"}}{{/crossLink}} if none specified
	 * and slides it on top of the node provided.
	 * @method _getNode
	 * @param node {Object} reference to a node within the configuration tree
	 * @return {Y.FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode
	 * @protected
	 */
	_getNode: function (node) {
		var newNode,
			Type = node.type || this.get('defaultType');
		if (Lang.isString(Type)) {
			Type = Y[Type];
		}
		if (Type) {
			newNode = new Type();
			if (newNode instanceof Y.FlyweightTreeNode) {
				newNode._root =  this;
				newNode._slideTo(node);
				return newNode;
			}
		}
		return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method _getRootNode
	 * @return {Y.FlyweightTreeNode} 
	 * @protected
	 */
	_getRootNode: function () {
		return this._poolFetch(this._tree);
	},
	/**
	 * Returns a string with the markup for the whole tree. 
	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)
	 * @method _getHTML
	 * @return {String} HTML for this widget
	 * @protected
	 */
	_getHTML: function () {
		var s = '',
			root = this._getRootNode();
		root.forEachChild( function (fwNode, index, array) {
			s += fwNode._getHTML(index, array.length, 0);
		});
		this._poolReturn(root);
		return s;
	},
	/**
	 * Locates a node in the tree by the element that represents it.
	 * @method _findNodeByElement
	 * @param el {Y.Node} Any element belonging to the tree
	 * @return {Object} Node that produced the markup for that element or null if not found
	 * @protected
	 */
	_findNodeByElement: function(el) {
		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (node) {
				if (node.id === id) {
					found = node;
					return true;
				}
				if (node.children) {
					return Y.Array.some(node.children, scan);
				}
				return false;
			};
		if (scan(this._tree)) {
			return found;
		}
		return null;
	},
	/**
	 * Returns a FlyweightTreeNode instance from the pool, positioned over the node whose markup generated some event.
	 * @method _poolFetchFromEvent
	 * @param ev {EventFacade}
	 * @return {Y.FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.
	 * @private
	 */
	_poolFetchFromEvent: function (ev) {
		var found = this._findNodeByElement(ev.domEvent.target);
		if (found) {
			return this._poolFetch(found);
		}
		return null;			
	},
	/**
	 * Traverses the whole configuration tree, calling a given function for each node.
	 * If the function returns true, the traversing will terminate.
	 * @method _forSomeCfgNode
	 * @param fn {Function} Function to call on each configuration node
	 *		@param fn.cfgNode {Object} node in the configuratino tree
	 *		@param fn.depth {Integer} depth of this node within the tee
	 *		@param fn.index {Integer} index of this node within the array of its siblings
	 * @param scope {Object} scope to run the function in, defaults to this.
	 * @return true if any of the function calls returned true (the traversal was terminated earlier)
	 * @protected
	 */
	_forSomeCfgNode: function(fn, scope) {
		scope = scope || this;
		var loop = function(cfgNode, depth) {
			return Y.Array.some(cfgNode.children || [], function(childNode, index) {
				fn.call(scope, childNode,depth, index);
				return loop(childNode,depth + 1);
			});
		};
		return loop(this._tree, 0);
	}
};

Y.FlyweightTreeManager = FWMgr;