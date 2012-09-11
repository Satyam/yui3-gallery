if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-flyweight-tree/gallery-flyweight-tree.js",
    code: []
};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].code=["YUI.add('gallery-flyweight-tree', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	DOT = '.',","	DEFAULT_POOL = '_default',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('flyweight-tree-node', name);","	},","	CNAME_NODE = cName(''),","	CNAME_CHILDREN = cName('children'),","	CNAME_COLLAPSED = cName('collapsed'),","	CNAME_EXPANDED = cName('expanded'),","	CNAME_NOCHILDREN = cName('no-children'),","	CNAME_FIRSTCHILD = cName('first-child'),","	CNAME_LASTCHILD = cName('last-child'),","	CNAME_LOADING = cName('loading'),","	YArray = Y.Array,","	FWMgr,","	FWNode;","","/**","* @module gallery-flyweight-tree","*","*/","","/**"," * Extension to handle its child nodes by using the flyweight pattern."," * @class Y.FlyweightTreeManager"," * @constructor"," */","FWMgr = function () {","	this._pool = {};","	this._initialValues = {};","};","","FWMgr.ATTRS = {","	/**","	 * Default object type of the child nodes if no explicit type is given in the configuration tree.","	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.  ","	 * ","	 * @attribute defaultType","	 * @type {String | Object}","	 * @default 'FlyweightTreeNode'","	 */","	defaultType: {","		value: 'FlyweightTreeNode'			","	},","	/**","	 * Function used to load the nodes dynamically.","	 * Function will run in the scope of the FlyweightTreeManager instance and will","	 * receive:","	 * ","	 * * node {Y.FlyweightTreeNode} reference to the parent of the children to be loaded.","	 * * callback {Function} function to call with the configuration info for the children.","	 * ","	 * The function shall fetch the nodes and create a configuration object ","	 * much like the one a whole tree might receive.  ","	 * It is not limited to just one level of nodes, it might contain children elements as well.","	 * When the data is processed, it should call the callback with the configuration object.","	 * The function is responsible of handling any errors.","	 * If the the callback is called with no arguments, the parent node will be marked as having no children.","	 * @attribute dynamicLoader","	 * @type {Function}","	 * @default null","	 */","	dynamicLoader: {","		validator: Lang.isFunction,","		value: null","	}","};","","","FWMgr.prototype = {","	/**","	 * Clone of the configuration tree.","	 * The FlyweightTreeNode instances will use the nodes in this tree as the storage for their state.","	 * @property _tree","	 * @type Object","	 * @private","	 */","	_tree: null,","	/**","	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.  ","	 * It contains a hash of arrays indexed by the node type. ","	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.","	 * @property _pool","	 * @type {Object}","	 * @private","	 */","	_pool: null,","	/**","	 * List of dom events to be listened for at the outer contained and fired again","	 * at the node once positioned over the source node.","	 * @property _domEvents","	 * @type Array of strings","	 * @protected","	 * @default null","	 */","	_domEvents: null,","	","	/**","	 * Method to load the configuration tree.","	 * This is not done in the constructor so as to allow the subclass ","	 * to process the tree definition anyway it wants, adding defaults and such","	 * and to name the tree whatever is suitable.","	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.","	 * It also sets initial values for some default properties such as `parent` references and `id` for all nodes.","	 * @method _loadConfig","	 * @param tree {Array} Configuration for the first level of nodes. ","	 * Contains objects with the following attributes:","	 * @param tree.label {String} Text or HTML markup to be shown in the node","	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.","	 * @param [tree.children] {Array} Further definitions for the children of this node","	 * @param [tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node.  ","	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.","	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node.","	 * @param [tree.template] {String} Template for this particular node. ","	 * @protected","	 */","	_loadConfig: function (tree) {","		var self = this;","		self._tree = {","			children: Y.clone(tree)","		};","		self._initNodes(this._tree);","		if (self._domEvents) {","			Y.Array.each(self._domEvents, function (event) {","				self.after(event, self._afterDomEvent, self);","			});","		}","	},","	/** Initializes the node configuration with default values and management info.","	 * @method _initNodes","	 * @param parent {Object} Parent of the nodes to be set","	 * @private","	 */","	_initNodes: function (parent) {","		var self = this;","		Y.Array.each(parent.children, function (child) {","			child._parent = parent;","			child.id = child.id || Y.guid();","			self._initNodes(child);","		});","	},","","	/** Generic event listener for DOM events listed in the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","	 *  It will locate the node that caused the event, slide a suitable instance on it and fire the","	 *  same event on that node.","	 *  @method _afterEvent","	 *  @param ev {EventFacade} Event facade as produced by the event","	 *  @private","	 */","	_afterDomEvent: function (ev) {","		var node = this._poolFetchFromEvent(ev);","		if (node) {","			node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});","			this._poolReturn(node);			","		}","	},","	/**","	 * Returns a string identifying the type of the object to handle the node","	 * or null if type was not a FlyweightNode instance.","	 * @method _getTypeString","	 * @param node {Object} Node in the tree configuration","	 * @return {String} type of node.","	 * @private","	 */","	_getTypeString: function (node) {","		var type = node.type || DEFAULT_POOL;","		if (!Lang.isString(type)) {","			if (Lang.isObject(type)) {","				type = type.NAME;","			} else {","				throw \"Node contains unknown type\";","			}","		}","		return type;","	},","	/**","	 * Pulls from the pool an instance of the type declared in the given node","	 * and slides it over that node.","	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink \"_createNode\"}}{{/crossLink}}","	 * If an instance is held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}), it will be returned instead.","	 * @method _poolFetch","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given node","	 * @protected","	 */","	_poolFetch: function(node) {","		var pool,","			fwNode = node._held,","			type = this._getTypeString(node);","			","		if (fwNode) {","			return fwNode;","		}","		pool = this._pool[type];","		if (pool === undefined) {","			pool = this._pool[type] = [];","		}","		if (pool.length) {","			fwNode = pool.pop();","			fwNode._slideTo(node);","			return fwNode;","		}","		return this._createNode(node);","	},","	/**","	 * Returns the FlyweightTreeNode instance to the pool.","	 * Instances held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}) are never returned.","	 * @method _poolReturn","	 * @param fwNode {Y.FlyweightTreeNode} Instance to return.","	 * @protected","	 */","	_poolReturn: function (fwNode) {","		if (fwNode._node._held) {","			return;","		}","		var pool,","			type = this._getTypeString(fwNode._node);","		pool = this._pool[type];","		if (pool) {","			pool.push(fwNode);","		}","		","	},","	/**","	 * Returns a new instance of the type given in node or the ","	 * {{#crossLink \"defaultType\"}}{{/crossLink}} if none specified","	 * and slides it on top of the node provided.","	 * @method _createNode","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode","	 * @protected","	 */","	_createNode: function (node) {","		var newNode,","			Type = node.type || this.get('defaultType');","		if (Lang.isString(Type)) {","			Type = Y[Type];","		}","		if (Type) {","			newNode = new Type();","			if (newNode instanceof Y.FlyweightTreeNode) {","				// I need to do this otherwise Attribute will initialize ","				// the real node with default values when activating a lazyAdd attribute.","				newNode._slideTo({});","				newNode.getAttrs();","				// That's it (see above)","				newNode._root =  this;","				newNode._slideTo(node);","				return newNode;","			}","		}","		return null;","	},","	/**","	 * Returns an instance of Flyweight node positioned over the root","	 * @method _getRootNode","	 * @return {Y.FlyweightTreeNode} ","	 * @protected","	 */","	_getRootNode: function () {","		return this._poolFetch(this._tree);","	},","	/**","	 * Returns a string with the markup for the whole tree. ","	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)","	 * @method _getHTML","	 * @return {String} HTML for this widget","	 * @protected","	 */","	_getHTML: function () {","		var s = '',","			root = this._getRootNode();","		root.forEachChild( function (fwNode, index, array) {","			s += fwNode._getHTML(index, array.length, 0);","		});","		this._poolReturn(root);","		return s;","	},","	/**","	 * Locates a node in the tree by the element that represents it.","	 * @method _findNodeByElement","	 * @param el {Y.Node} Any element belonging to the tree","	 * @return {Object} Node that produced the markup for that element or null if not found","	 * @protected","	 */","	_findNodeByElement: function(el) {","		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),","			found = null,","			scan = function (node) {","				if (node.id === id) {","					found = node;","					return true;","				}","				if (node.children) {","					return Y.Array.some(node.children, scan);","				}","				return false;","			};","		if (scan(this._tree)) {","			return found;","		}","		return null;","	},","	/**","	 * Returns a FlyweightTreeNode instance from the pool, positioned over the node whose markup generated some event.","	 * @method _poolFetchFromEvent","	 * @param ev {EventFacade}","	 * @return {Y.FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.","	 * @private","	 */","	_poolFetchFromEvent: function (ev) {","		var found = this._findNodeByElement(ev.domEvent.target);","		if (found) {","			return this._poolFetch(found);","		}","		return null;			","	},","	/**","	 * Traverses the whole configuration tree, calling a given function for each node.","	 * If the function returns true, the traversing will terminate.","	 * @method _forSomeCfgNode","	 * @param fn {Function} Function to call on each configuration node","	 *		@param fn.cfgNode {Object} node in the configuratino tree","	 *		@param fn.depth {Integer} depth of this node within the tee","	 *		@param fn.index {Integer} index of this node within the array of its siblings","	 * @param scope {Object} scope to run the function in, defaults to this.","	 * @return true if any of the function calls returned true (the traversal was terminated earlier)","	 * @protected","	 */","	_forSomeCfgNode: function(fn, scope) {","		scope = scope || this;","		var loop = function(cfgNode, depth) {","			return Y.Array.some(cfgNode.children || [], function(childNode, index) {","				fn.call(scope, childNode,depth, index);","				return loop(childNode,depth + 1);","			});","		};","		return loop(this._tree, 0);","	}","};","","Y.FlyweightTreeManager = FWMgr;","/**","* An implementation of the flyweight pattern.  ","* This object can be slid on top of a literal object containing the definition ","* of a tree and will take its state from that node it is slid upon.","* It relies for most of its functionality on the flyweight manager object,","* which contains most of the code.","* @module gallery-flyweight-tree","*/","","/**","* An implementation of the flyweight pattern.  This class should not be instantiated directly.","* Instances of this class can be requested from the flyweight manager class","* @class Y.FlyweightTreeNode","* @extends Y.Base","* @constructor  Do not instantiate directly.","*/","FWNode = Y.Base.create(","	'flyweight-tree-node',","	Y.Base,","	[],","	{","		/**","		 * Reference to the node in the configuration tree it has been slid over.","		 * @property _node","		 * @type {Object}","		 * @private","		 **/","		_node:null,","		/**","		 * Reference to the FlyweightTreeManager instance this node belongs to.","		 * It is set by the root and should be considered read-only.","		 * @property _root","		 * @type Y.FlyweightTreeManager","		 * @private","		 */","		_root: null,","		/**","		 * Returns a string with the markup for this node along that of its children","		 * produced from its attributes rendered","		 * via the first template string it finds in these locations:","		 *","		 * * It's own {{#crossLink \"template\"}}{{/crossLink}} configuration attribute","		 * * The static {{#crossLink \"FlyweightTreeNode/TEMPLATE\"}}{{/crossLink}} class property","		 *","		 * @method _getHTML","		 * @param index {Integer} index of this node within the array of siblings","		 * @param nSiblings {Integer} number of siblings including this node","		 * @param depth {Integer} number of levels to the root","		 * @return {String} markup generated by this node","		 * @protected","		 */","		_getHTML: function(index, nSiblings, depth) {","			// assumes that if you asked for the HTML it is because you are rendering it","			var self = this,","				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.","				getAttrs = function() {","					var o = {},","					i, l, attr,","","					attrs = Y.Object.keys(self._state.data);","","					for (i = 0, l = attrs.length; i < l; i+=1) {","						attr = attrs[i];","						o[attr] = self.get(attr);","					}","","					return o;","				},","				node = this._node,","				attrs = getAttrs(),","				s = '', ","				templ = node.template || this.constructor.TEMPLATE,","				childCount = node.children && node.children.length,","				nodeClasses = [CNAME_NODE];","","			node._rendered = true;","			if (childCount) {","				if (attrs.expanded) {","					node._childrenRendered = true;","					this.forEachChild( function (fwNode, index, array) {","						s += fwNode._getHTML(index, array.length, depth+1);","					});","					nodeClasses.push(CNAME_EXPANDED);","				} else {","					nodeClasses.push(CNAME_COLLAPSED);","				}","			} else {","				if (this._root.get('dynamicLoader') && !node.isLeaf) {","					nodeClasses.push(CNAME_COLLAPSED);","				} else {","					nodeClasses.push(CNAME_NOCHILDREN);","				}","			}","			if (index === 0) {","				nodeClasses.push(CNAME_FIRSTCHILD);","			} else if (index === nSiblings - 1) {","				nodeClasses.push(CNAME_LASTCHILD);","			}","			attrs.children = s;","			attrs.cname_node = nodeClasses.join(' ');","			attrs.cname_children = CNAME_CHILDREN;","","			return Lang.sub(templ, attrs);","","		},","		/**","		 * Method to slide this instance on top of another node in the configuration object","		 * @method _slideTo","		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.","		 * @private","		 */","		_slideTo: function (node) {","			this._node = node;","			this._stateProxy = node;","		},","		/**","		 * Executes the given function on each of the child nodes of this node.","		 * @method forEachChild","		 * @param fn {Function} Function to be executed on each node","		 *		@param fn.child {Y.FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode, ","		 *		positioned on top of the child node","		 *		@param fn.index {Integer} Index of this child within the array of children","		 *		@param fn.array {Array} array containing itself and its siblings","		 * @param scope {object} The falue of this for the function.  Defaults to the parent.","		**/","		forEachChild: function(fn, scope) {","			var root = this._root,","				children = this._node.children,","				child, ret;","			scope = scope || this;","			if (children && children.length) {","				YArray.each(children, function (node, index, array) {","					child = root._poolFetch(node);","					ret = fn.call(scope, child, index, array);","					root._poolReturn(child);","					return ret;","				});","			}","		},","		/**","		 * Getter for the expanded configuration attribute.","		 * It is meant to be overriden by the developer.","		 * The supplied version defaults to true if the expanded property ","		 * is not set in the underlying configuration tree.","		 * It can be overriden to default to false.","		 * @method _expandedGetter","		 * @return {Boolean} The expanded state of the node.","		 * @protected","		 */","		_expandedGetter: function () {","			return this._node.expanded !== false;","		},","		/**","		 * Setter for the expanded configuration attribute.","		 * It renders the child nodes if this branch has never been expanded.","		 * Then sets the className on the node to the static constants ","		 * CNAME_COLLAPSED or CNAME_EXPANDED from Y.FlyweightTreeManager","		 * @method _expandedSetter","		 * @param value {Boolean} new value for the expanded attribute","		 * @private","		 */","		_expandedSetter: function (value) {","			var self = this,","				node = self._node,","				root = self._root,","				el = Y.one('#' + node.id),","				dynLoader = root.get('dynamicLoader');","				","			node.expanded = value = !!value;","			if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {","				this._loadDynamic();","				return;","			}","			if (node.children && node.children.length) {","				if (value) {","					if (!node._childrenRendered) {","						self._renderChildren();","					}","					el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);","				} else {","					el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);","				}","			}","		},","		/**","		 * Triggers the dynamic loading of children for this node.","		 * @method _loadDynamic","		 * @private","		 */","		_loadDynamic: function () {","			var self = this,","				root = self._root;","			Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);","			root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));","			","		},","		/**","		 * Callback for the dynamicLoader method.","		 * @method _dynamicLoadReturn","		 * @param response {Array} array of child nodes ","		 */","		_dynamicLoadReturn: function (response) {","			var self = this,","				node = self._node,","				root = self._root;","","			if (response) {","","				node.children = response;","				root._initNodes(node);","				self._renderChildren();","			} else {","				node.isLeaf = true;","			}","			// isLeaf might have been set in the response, not just in the line above.","			Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));","		},","		/**","		 * Renders the children of this node.  ","		 * It the children had been rendered, they will be replaced.","		 * @method _renderChildren","		 * @private","		 */","		_renderChildren: function () {","			var s = '',","				node = this._node,","				depth = this.get('depth');","			node._childrenRendered = true;","			this.forEachChild(function (fwNode, index, array) {","				s += fwNode._getHTML(index, array.length, depth + 1);","			});","			Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);","		},","		/**","		 * Prevents this instance from being returned to the pool and reused.","		 * Remember to {{#crossLink \"release\"}}{{/crossLink}} this instance when no longer needed.","		 * @method hold","		 * @chainable","		 */","		hold: function () {","			return (this._node._held = this);","		},","		/**","		 * Allows this instance to be returned to the pool and reused.","		 * ","		 * __Important__: This instance should not be used after being released","		 * @method release","		 * @chainable","		 */","		release: function () {","			this._node._held = null;","			this._root._poolReturn(this);","			return this;","		},","		/**","		 * Returns the parent node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getParent","		 * @return Y.FlyweightTreeNode","		 */","		getParent: function() {","			var node = this._node._parent;","			return (node?this._root._poolFetch(node):null);","		},","		/**","		 * Returns the next sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getNextSibling","		 * @return Y.FlyweightTreeNode","		 */","		getNextSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) + 1;","			if (index === 0 || index > siblings.length) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		/**","		 * Returns the previous sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getPreviousSibling","		 * @return Y.FlyweightTreeNode","		 */","		getPreviousSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) - 1;","			if (index < 0) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		","		/**","		 * Sugar method to toggle the expanded state of the node.","		 * @method toggle","		 * @chainable","		 */","		toggle: function() {","			this.set('expanded', !this.get('expanded'));","			return this;","		}","	},","	{","		/**","		 * Template string to be used to render this node.","		 * It should be overriden by the subclass.","		 *    ","		 * It contains the HTML markup for this node plus placeholders,","		 * enclosed in curly braces, that have access to any of the ","		 * configuration attributes of this node plus the following","		 * additional placeholders:","		 * ","		 * * children: The markup for the children of this node will be placed here","		 * * cname_node: The className for the HTML element enclosing this node.","		 *   The template should always use this className to help it locate the DOM element for this node.","		 * * cname_children: The className for the HTML element enclosing the children of this node.","		 * The template should always use this className to help it locate the DOM element that contains the children of this node.","		 * ","		 * The template should also add the `id` attribute to the DOM Element representing this node. ","		 * @property TEMPLATE","		 * @type {String}","		 * @default '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>'","		 * @static","		 */","		TEMPLATE: '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>',","		/**","		 * CCS className constant to use as the class name for the DOM element representing the node.","		 * @property CNAME_NODE","		 * @type String","		 * @static","		 */","		CNAME_NODE: CNAME_NODE,","		/**","		 * CCS className constant to use as the class name for the DOM element that will containe the children of this node.","		 * @property CNAME_CHILDREN","		 * @type String","		 * @static","		 */","		CNAME_CHILDREN: CNAME_CHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when its state is not expanded.","		 * @property CNAME_COLLAPSED","		 * @type String","		 * @static","		 */","		CNAME_COLLAPSED: CNAME_COLLAPSED,","		/**","		 * CCS className constant added to the DOM element for this node when its state is expanded.","		 * @property CNAME_EXPANDED","		 * @type String","		 * @static","		 */","		CNAME_EXPANDED: CNAME_EXPANDED,","		/**","		 * CCS className constant added to the DOM element for this node when it has no children.","		 * @property CNAME_NOCHILDREN","		 * @type String","		 * @static","		 */","		CNAME_NOCHILDREN: CNAME_NOCHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when it is the first in the group.","		 * @property CNAME_FIRSTCHILD","		 * @type String","		 * @static","		 */","		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when it is the last in the group.","		 * @property CNAME_LASTCHILD","		 * @type String","		 * @static","		 */","		CNAME_LASTCHILD: CNAME_LASTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when dynamically loading its children.","		 * @property CNAME_LOADING","		 * @type String","		 * @static","		 */","		CNAME_LOADING: CNAME_LOADING,","		ATTRS: {","			/**","			 * Reference to the FlyweightTreeManager this node belongs to","			 * @attribute root","			 * @type {Y.FlyweightTreeManager}","			 * @readOnly","			 * ","			 */","","			root: {","				_bypassProxy: true,","				readOnly: true,","				getter: function() {","					return this._root;","				}","			},","","			/**","			 * Template to use on this particular instance.  ","			 * The renderer will default to the static TEMPLATE property of this class ","			 * (the preferred way) or the nodeTemplate configuration attribute of the root.","			 * See the TEMPLATE static property.","			 * @attribute template","			 * @type {String}","			 * @default undefined","			 */","			template: {","				validator: Lang.isString","			},","			/**","			 * Label for this node. Nodes usually have some textual content, this is the place for it.","			 * @attribute label","			 * @type {String}","			 * @default ''","			 */","			label: {","				validator: Lang.isString,","				value: ''","			},","			/**","			 * Id to assign to the DOM element that contains this node.  ","			 * If none was supplied, it will generate one","			 * @attribute id","			 * @type {Identifier}","			 * @default Y.guid()","			 * @readOnly","			 */","			id: {","				readOnly: true","			},","			/**","			 * Returns the depth of this node from the root.","			 * This is calculated on-the-fly.","			 * @attribute depth","			 * @type Integer","			 * @readOnly","			 */","			depth: {","				_bypassProxy: true,","				readOnly: true,","				getter: function () {","					var count = 0, ","						node = this._node;","					while (node._parent) {","						count += 1;","						node = node._parent;","					}","					return count-1;","				}","			},","			/**","			 * Expanded state of this node.","			 * @attribute expanded","			 * @type Boolean","			 * @default true","			 */","			expanded: {","				_bypassProxy: true,","				getter: '_expandedGetter',","				setter: '_expandedSetter'","			}","		}","	}",");","Y.FlyweightTreeNode = FWNode;","","","","}, '@VERSION@', {\"requires\": [\"base-base\", \"base-build\", \"classnamemanager\"], \"skinnable\": false});"];
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].lines = {"1":0,"3":0,"5":0,"10":0,"34":0,"35":0,"36":0,"39":0,"76":0,"124":0,"125":0,"128":0,"129":0,"130":0,"131":0,"141":0,"142":0,"143":0,"144":0,"145":0,"157":0,"158":0,"159":0,"160":0,"172":0,"173":0,"174":0,"175":0,"177":0,"180":0,"193":0,"197":0,"198":0,"200":0,"201":0,"202":0,"204":0,"205":0,"206":0,"207":0,"209":0,"219":0,"220":0,"222":0,"224":0,"225":0,"226":0,"240":0,"242":0,"243":0,"245":0,"246":0,"247":0,"250":0,"251":0,"253":0,"254":0,"255":0,"258":0,"267":0,"277":0,"279":0,"280":0,"282":0,"283":0,"293":0,"296":0,"297":0,"298":0,"300":0,"301":0,"303":0,"305":0,"306":0,"308":0,"318":0,"319":0,"320":0,"322":0,"337":0,"338":0,"339":0,"340":0,"341":0,"344":0,"348":0,"365":0,"402":0,"405":0,"410":0,"411":0,"412":0,"415":0,"424":0,"425":0,"426":0,"427":0,"428":0,"429":0,"431":0,"433":0,"436":0,"437":0,"439":0,"442":0,"443":0,"444":0,"445":0,"447":0,"448":0,"449":0,"451":0,"461":0,"462":0,"475":0,"478":0,"479":0,"480":0,"481":0,"482":0,"483":0,"484":0,"499":0,"511":0,"517":0,"518":0,"519":0,"520":0,"522":0,"523":0,"524":0,"525":0,"527":0,"529":0,"539":0,"541":0,"542":0,"551":0,"555":0,"557":0,"558":0,"559":0,"561":0,"564":0,"573":0,"576":0,"577":0,"578":0,"580":0,"589":0,"599":0,"600":0,"601":0,"611":0,"612":0,"622":0,"625":0,"626":0,"628":0,"638":0,"641":0,"642":0,"644":0,"653":0,"654":0,"749":0,"797":0,"799":0,"800":0,"801":0,"803":0,"820":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].functions = {"cName:9":0,"FWMgr:34":0,"(anonymous 2):130":0,"_loadConfig:123":0,"(anonymous 3):142":0,"_initNodes:140":0,"_afterDomEvent:156":0,"_getTypeString:171":0,"_poolFetch:192":0,"_poolReturn:218":0,"_createNode:239":0,"_getRootNode:266":0,"(anonymous 4):279":0,"_getHTML:276":0,"scan:295":0,"_findNodeByElement:292":0,"_poolFetchFromEvent:317":0,"(anonymous 5):339":0,"loop:338":0,"_forSomeCfgNode:336":0,"getAttrs:404":0,"(anonymous 6):428":0,"_getHTML:400":0,"_slideTo:460":0,"(anonymous 7):480":0,"forEachChild:474":0,"_expandedGetter:498":0,"_expandedSetter:510":0,"_loadDynamic:538":0,"_dynamicLoadReturn:550":0,"(anonymous 8):577":0,"_renderChildren:572":0,"hold:588":0,"release:598":0,"getParent:610":0,"getNextSibling:621":0,"getPreviousSibling:637":0,"toggle:652":0,"getter:748":0,"getter:796":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredLines = 172;
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredFunctions = 41;
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1);
YUI.add('gallery-flyweight-tree', function (Y, NAME) {

_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 3);
'use strict';
/*jslint white: true */
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 5);
var Lang = Y.Lang,
	DOT = '.',
	DEFAULT_POOL = '_default',
	getCName = Y.ClassNameManager.getClassName,
	cName = function (name) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "cName", 9);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 10);
return getCName('flyweight-tree-node', name);
	},
	CNAME_NODE = cName(''),
	CNAME_CHILDREN = cName('children'),
	CNAME_COLLAPSED = cName('collapsed'),
	CNAME_EXPANDED = cName('expanded'),
	CNAME_NOCHILDREN = cName('no-children'),
	CNAME_FIRSTCHILD = cName('first-child'),
	CNAME_LASTCHILD = cName('last-child'),
	CNAME_LOADING = cName('loading'),
	YArray = Y.Array,
	FWMgr,
	FWNode;

/**
* @module gallery-flyweight-tree
*
*/

/**
 * Extension to handle its child nodes by using the flyweight pattern.
 * @class Y.FlyweightTreeManager
 * @constructor
 */
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 34);
FWMgr = function () {
	_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "FWMgr", 34);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 35);
this._pool = {};
	_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 36);
this._initialValues = {};
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 39);
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


_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 76);
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
	 * @param tree {Array} Configuration for the first level of nodes. 
	 * Contains objects with the following attributes:
	 * @param tree.label {String} Text or HTML markup to be shown in the node
	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.
	 * @param [tree.children] {Array} Further definitions for the children of this node
	 * @param [tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node.  
	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.
	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node.
	 * @param [tree.template] {String} Template for this particular node. 
	 * @protected
	 */
	_loadConfig: function (tree) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadConfig", 123);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 124);
var self = this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 125);
self._tree = {
			children: Y.clone(tree)
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 128);
self._initNodes(this._tree);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 129);
if (self._domEvents) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 130);
Y.Array.each(self._domEvents, function (event) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 2)", 130);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 131);
self.after(event, self._afterDomEvent, self);
			});
		}
	},
	/** Initializes the node configuration with default values and management info.
	 * @method _initNodes
	 * @param parent {Object} Parent of the nodes to be set
	 * @private
	 */
	_initNodes: function (parent) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_initNodes", 140);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 141);
var self = this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 142);
Y.Array.each(parent.children, function (child) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 3)", 142);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 143);
child._parent = parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 144);
child.id = child.id || Y.guid();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 145);
self._initNodes(child);
		});
	},

	/** Generic event listener for DOM events listed in the {{#crossLink "_domEvents"}}{{/crossLink}} array.
	 *  It will locate the node that caused the event, slide a suitable instance on it and fire the
	 *  same event on that node.
	 *  @method _afterEvent
	 *  @param ev {EventFacade} Event facade as produced by the event
	 *  @private
	 */
	_afterDomEvent: function (ev) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_afterDomEvent", 156);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 157);
var node = this._poolFetchFromEvent(ev);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 158);
if (node) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 159);
node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 160);
this._poolReturn(node);			
		}
	},
	/**
	 * Returns a string identifying the type of the object to handle the node
	 * or null if type was not a FlyweightNode instance.
	 * @method _getTypeString
	 * @param node {Object} Node in the tree configuration
	 * @return {String} type of node.
	 * @private
	 */
	_getTypeString: function (node) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getTypeString", 171);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 172);
var type = node.type || DEFAULT_POOL;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 173);
if (!Lang.isString(type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 174);
if (Lang.isObject(type)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 175);
type = type.NAME;
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 177);
throw "Node contains unknown type";
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 180);
return type;
	},
	/**
	 * Pulls from the pool an instance of the type declared in the given node
	 * and slides it over that node.
	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink "_createNode"}}{{/crossLink}}
	 * If an instance is held (see: {{#crossLink "Y.FlyweightTreeNode/hold"}}{{/crossLink}}), it will be returned instead.
	 * @method _poolFetch
	 * @param node {Object} reference to a node within the configuration tree
	 * @return {Y.FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given node
	 * @protected
	 */
	_poolFetch: function(node) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetch", 192);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 193);
var pool,
			fwNode = node._held,
			type = this._getTypeString(node);
			
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 197);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 198);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 200);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 201);
if (pool === undefined) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 202);
pool = this._pool[type] = [];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 204);
if (pool.length) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 205);
fwNode = pool.pop();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 206);
fwNode._slideTo(node);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 207);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 209);
return this._createNode(node);
	},
	/**
	 * Returns the FlyweightTreeNode instance to the pool.
	 * Instances held (see: {{#crossLink "Y.FlyweightTreeNode/hold"}}{{/crossLink}}) are never returned.
	 * @method _poolReturn
	 * @param fwNode {Y.FlyweightTreeNode} Instance to return.
	 * @protected
	 */
	_poolReturn: function (fwNode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolReturn", 218);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 219);
if (fwNode._node._held) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 220);
return;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 222);
var pool,
			type = this._getTypeString(fwNode._node);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 224);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 225);
if (pool) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 226);
pool.push(fwNode);
		}
		
	},
	/**
	 * Returns a new instance of the type given in node or the 
	 * {{#crossLink "defaultType"}}{{/crossLink}} if none specified
	 * and slides it on top of the node provided.
	 * @method _createNode
	 * @param node {Object} reference to a node within the configuration tree
	 * @return {Y.FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode
	 * @protected
	 */
	_createNode: function (node) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_createNode", 239);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 240);
var newNode,
			Type = node.type || this.get('defaultType');
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 242);
if (Lang.isString(Type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 243);
Type = Y[Type];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 245);
if (Type) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 246);
newNode = new Type();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 247);
if (newNode instanceof Y.FlyweightTreeNode) {
				// I need to do this otherwise Attribute will initialize 
				// the real node with default values when activating a lazyAdd attribute.
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 250);
newNode._slideTo({});
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 251);
newNode.getAttrs();
				// That's it (see above)
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 253);
newNode._root =  this;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 254);
newNode._slideTo(node);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 255);
return newNode;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 258);
return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method _getRootNode
	 * @return {Y.FlyweightTreeNode} 
	 * @protected
	 */
	_getRootNode: function () {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getRootNode", 266);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 267);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 276);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 277);
var s = '',
			root = this._getRootNode();
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 279);
root.forEachChild( function (fwNode, index, array) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 4)", 279);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 280);
s += fwNode._getHTML(index, array.length, 0);
		});
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 282);
this._poolReturn(root);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 283);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_findNodeByElement", 292);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 293);
var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (node) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "scan", 295);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 296);
if (node.id === id) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 297);
found = node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 298);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 300);
if (node.children) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 301);
return Y.Array.some(node.children, scan);
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 303);
return false;
			};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 305);
if (scan(this._tree)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 306);
return found;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 308);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetchFromEvent", 317);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 318);
var found = this._findNodeByElement(ev.domEvent.target);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 319);
if (found) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 320);
return this._poolFetch(found);
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 322);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_forSomeCfgNode", 336);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 337);
scope = scope || this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 338);
var loop = function(cfgNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "loop", 338);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 339);
return Y.Array.some(cfgNode.children || [], function(childNode, index) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 5)", 339);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 340);
fn.call(scope, childNode,depth, index);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 341);
return loop(childNode,depth + 1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 344);
return loop(this._tree, 0);
	}
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 348);
Y.FlyweightTreeManager = FWMgr;
/**
* An implementation of the flyweight pattern.  
* This object can be slid on top of a literal object containing the definition 
* of a tree and will take its state from that node it is slid upon.
* It relies for most of its functionality on the flyweight manager object,
* which contains most of the code.
* @module gallery-flyweight-tree
*/

/**
* An implementation of the flyweight pattern.  This class should not be instantiated directly.
* Instances of this class can be requested from the flyweight manager class
* @class Y.FlyweightTreeNode
* @extends Y.Base
* @constructor  Do not instantiate directly.
*/
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 365);
FWNode = Y.Base.create(
	'flyweight-tree-node',
	Y.Base,
	[],
	{
		/**
		 * Reference to the node in the configuration tree it has been slid over.
		 * @property _node
		 * @type {Object}
		 * @private
		 **/
		_node:null,
		/**
		 * Reference to the FlyweightTreeManager instance this node belongs to.
		 * It is set by the root and should be considered read-only.
		 * @property _root
		 * @type Y.FlyweightTreeManager
		 * @private
		 */
		_root: null,
		/**
		 * Returns a string with the markup for this node along that of its children
		 * produced from its attributes rendered
		 * via the first template string it finds in these locations:
		 *
		 * * It's own {{#crossLink "template"}}{{/crossLink}} configuration attribute
		 * * The static {{#crossLink "FlyweightTreeNode/TEMPLATE"}}{{/crossLink}} class property
		 *
		 * @method _getHTML
		 * @param index {Integer} index of this node within the array of siblings
		 * @param nSiblings {Integer} number of siblings including this node
		 * @param depth {Integer} number of levels to the root
		 * @return {String} markup generated by this node
		 * @protected
		 */
		_getHTML: function(index, nSiblings, depth) {
			// assumes that if you asked for the HTML it is because you are rendering it
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 400);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 402);
var self = this,
				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.
				getAttrs = function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getAttrs", 404);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 405);
var o = {},
					i, l, attr,

					attrs = Y.Object.keys(self._state.data);

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 410);
for (i = 0, l = attrs.length; i < l; i+=1) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 411);
attr = attrs[i];
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 412);
o[attr] = self.get(attr);
					}

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 415);
return o;
				},
				node = this._node,
				attrs = getAttrs(),
				s = '', 
				templ = node.template || this.constructor.TEMPLATE,
				childCount = node.children && node.children.length,
				nodeClasses = [CNAME_NODE];

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 424);
node._rendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 425);
if (childCount) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 426);
if (attrs.expanded) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 427);
node._childrenRendered = true;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 428);
this.forEachChild( function (fwNode, index, array) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 6)", 428);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 429);
s += fwNode._getHTML(index, array.length, depth+1);
					});
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 431);
nodeClasses.push(CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 433);
nodeClasses.push(CNAME_COLLAPSED);
				}
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 436);
if (this._root.get('dynamicLoader') && !node.isLeaf) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 437);
nodeClasses.push(CNAME_COLLAPSED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 439);
nodeClasses.push(CNAME_NOCHILDREN);
				}
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 442);
if (index === 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 443);
nodeClasses.push(CNAME_FIRSTCHILD);
			} else {_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 444);
if (index === nSiblings - 1) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 445);
nodeClasses.push(CNAME_LASTCHILD);
			}}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 447);
attrs.children = s;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 448);
attrs.cname_node = nodeClasses.join(' ');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 449);
attrs.cname_children = CNAME_CHILDREN;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 451);
return Lang.sub(templ, attrs);

		},
		/**
		 * Method to slide this instance on top of another node in the configuration object
		 * @method _slideTo
		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.
		 * @private
		 */
		_slideTo: function (node) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_slideTo", 460);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 461);
this._node = node;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 462);
this._stateProxy = node;
		},
		/**
		 * Executes the given function on each of the child nodes of this node.
		 * @method forEachChild
		 * @param fn {Function} Function to be executed on each node
		 *		@param fn.child {Y.FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode, 
		 *		positioned on top of the child node
		 *		@param fn.index {Integer} Index of this child within the array of children
		 *		@param fn.array {Array} array containing itself and its siblings
		 * @param scope {object} The falue of this for the function.  Defaults to the parent.
		**/
		forEachChild: function(fn, scope) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forEachChild", 474);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 475);
var root = this._root,
				children = this._node.children,
				child, ret;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 478);
scope = scope || this;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 479);
if (children && children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 480);
YArray.each(children, function (node, index, array) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 7)", 480);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 481);
child = root._poolFetch(node);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 482);
ret = fn.call(scope, child, index, array);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 483);
root._poolReturn(child);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 484);
return ret;
				});
			}
		},
		/**
		 * Getter for the expanded configuration attribute.
		 * It is meant to be overriden by the developer.
		 * The supplied version defaults to true if the expanded property 
		 * is not set in the underlying configuration tree.
		 * It can be overriden to default to false.
		 * @method _expandedGetter
		 * @return {Boolean} The expanded state of the node.
		 * @protected
		 */
		_expandedGetter: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedGetter", 498);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 499);
return this._node.expanded !== false;
		},
		/**
		 * Setter for the expanded configuration attribute.
		 * It renders the child nodes if this branch has never been expanded.
		 * Then sets the className on the node to the static constants 
		 * CNAME_COLLAPSED or CNAME_EXPANDED from Y.FlyweightTreeManager
		 * @method _expandedSetter
		 * @param value {Boolean} new value for the expanded attribute
		 * @private
		 */
		_expandedSetter: function (value) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedSetter", 510);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 511);
var self = this,
				node = self._node,
				root = self._root,
				el = Y.one('#' + node.id),
				dynLoader = root.get('dynamicLoader');
				
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 517);
node.expanded = value = !!value;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 518);
if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 519);
this._loadDynamic();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 520);
return;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 522);
if (node.children && node.children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 523);
if (value) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 524);
if (!node._childrenRendered) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 525);
self._renderChildren();
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 527);
el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 529);
el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);
				}
			}
		},
		/**
		 * Triggers the dynamic loading of children for this node.
		 * @method _loadDynamic
		 * @private
		 */
		_loadDynamic: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadDynamic", 538);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 539);
var self = this,
				root = self._root;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 541);
Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 542);
root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));
			
		},
		/**
		 * Callback for the dynamicLoader method.
		 * @method _dynamicLoadReturn
		 * @param response {Array} array of child nodes 
		 */
		_dynamicLoadReturn: function (response) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoadReturn", 550);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 551);
var self = this,
				node = self._node,
				root = self._root;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 555);
if (response) {

				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 557);
node.children = response;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 558);
root._initNodes(node);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 559);
self._renderChildren();
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 561);
node.isLeaf = true;
			}
			// isLeaf might have been set in the response, not just in the line above.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 564);
Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));
		},
		/**
		 * Renders the children of this node.  
		 * It the children had been rendered, they will be replaced.
		 * @method _renderChildren
		 * @private
		 */
		_renderChildren: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_renderChildren", 572);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 573);
var s = '',
				node = this._node,
				depth = this.get('depth');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 576);
node._childrenRendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 577);
this.forEachChild(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 8)", 577);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 578);
s += fwNode._getHTML(index, array.length, depth + 1);
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 580);
Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);
		},
		/**
		 * Prevents this instance from being returned to the pool and reused.
		 * Remember to {{#crossLink "release"}}{{/crossLink}} this instance when no longer needed.
		 * @method hold
		 * @chainable
		 */
		hold: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "hold", 588);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 589);
return (this._node._held = this);
		},
		/**
		 * Allows this instance to be returned to the pool and reused.
		 * 
		 * __Important__: This instance should not be used after being released
		 * @method release
		 * @chainable
		 */
		release: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "release", 598);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 599);
this._node._held = null;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 600);
this._root._poolReturn(this);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 601);
return this;
		},
		/**
		 * Returns the parent node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.  
		 * Remember to release the copy to the pool when done.
		 * @method getParent
		 * @return Y.FlyweightTreeNode
		 */
		getParent: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getParent", 610);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 611);
var node = this._node._parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 612);
return (node?this._root._poolFetch(node):null);
		},
		/**
		 * Returns the next sibling node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.  
		 * Remember to release the copy to the pool when done.
		 * @method getNextSibling
		 * @return Y.FlyweightTreeNode
		 */
		getNextSibling: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getNextSibling", 621);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 622);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) + 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 625);
if (index === 0 || index > siblings.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 626);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 628);
return this._root._poolFetch(siblings[index]);
		},
		/**
		 * Returns the previous sibling node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.  
		 * Remember to release the copy to the pool when done.
		 * @method getPreviousSibling
		 * @return Y.FlyweightTreeNode
		 */
		getPreviousSibling: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getPreviousSibling", 637);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 638);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) - 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 641);
if (index < 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 642);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 644);
return this._root._poolFetch(siblings[index]);
		},
		
		/**
		 * Sugar method to toggle the expanded state of the node.
		 * @method toggle
		 * @chainable
		 */
		toggle: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "toggle", 652);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 653);
this.set('expanded', !this.get('expanded'));
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 654);
return this;
		}
	},
	{
		/**
		 * Template string to be used to render this node.
		 * It should be overriden by the subclass.
		 *    
		 * It contains the HTML markup for this node plus placeholders,
		 * enclosed in curly braces, that have access to any of the 
		 * configuration attributes of this node plus the following
		 * additional placeholders:
		 * 
		 * * children: The markup for the children of this node will be placed here
		 * * cname_node: The className for the HTML element enclosing this node.
		 *   The template should always use this className to help it locate the DOM element for this node.
		 * * cname_children: The className for the HTML element enclosing the children of this node.
		 * The template should always use this className to help it locate the DOM element that contains the children of this node.
		 * 
		 * The template should also add the `id` attribute to the DOM Element representing this node. 
		 * @property TEMPLATE
		 * @type {String}
		 * @default '<div id="{id}" class="{cname_node}"><div class="content">{label}</div><div class="{cname_children}">{children}</div></div>'
		 * @static
		 */
		TEMPLATE: '<div id="{id}" class="{cname_node}"><div class="content">{label}</div><div class="{cname_children}">{children}</div></div>',
		/**
		 * CCS className constant to use as the class name for the DOM element representing the node.
		 * @property CNAME_NODE
		 * @type String
		 * @static
		 */
		CNAME_NODE: CNAME_NODE,
		/**
		 * CCS className constant to use as the class name for the DOM element that will containe the children of this node.
		 * @property CNAME_CHILDREN
		 * @type String
		 * @static
		 */
		CNAME_CHILDREN: CNAME_CHILDREN,
		/**
		 * CCS className constant added to the DOM element for this node when its state is not expanded.
		 * @property CNAME_COLLAPSED
		 * @type String
		 * @static
		 */
		CNAME_COLLAPSED: CNAME_COLLAPSED,
		/**
		 * CCS className constant added to the DOM element for this node when its state is expanded.
		 * @property CNAME_EXPANDED
		 * @type String
		 * @static
		 */
		CNAME_EXPANDED: CNAME_EXPANDED,
		/**
		 * CCS className constant added to the DOM element for this node when it has no children.
		 * @property CNAME_NOCHILDREN
		 * @type String
		 * @static
		 */
		CNAME_NOCHILDREN: CNAME_NOCHILDREN,
		/**
		 * CCS className constant added to the DOM element for this node when it is the first in the group.
		 * @property CNAME_FIRSTCHILD
		 * @type String
		 * @static
		 */
		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,
		/**
		 * CCS className constant added to the DOM element for this node when it is the last in the group.
		 * @property CNAME_LASTCHILD
		 * @type String
		 * @static
		 */
		CNAME_LASTCHILD: CNAME_LASTCHILD,
		/**
		 * CCS className constant added to the DOM element for this node when dynamically loading its children.
		 * @property CNAME_LOADING
		 * @type String
		 * @static
		 */
		CNAME_LOADING: CNAME_LOADING,
		ATTRS: {
			/**
			 * Reference to the FlyweightTreeManager this node belongs to
			 * @attribute root
			 * @type {Y.FlyweightTreeManager}
			 * @readOnly
			 * 
			 */

			root: {
				_bypassProxy: true,
				readOnly: true,
				getter: function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 748);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 749);
return this._root;
				}
			},

			/**
			 * Template to use on this particular instance.  
			 * The renderer will default to the static TEMPLATE property of this class 
			 * (the preferred way) or the nodeTemplate configuration attribute of the root.
			 * See the TEMPLATE static property.
			 * @attribute template
			 * @type {String}
			 * @default undefined
			 */
			template: {
				validator: Lang.isString
			},
			/**
			 * Label for this node. Nodes usually have some textual content, this is the place for it.
			 * @attribute label
			 * @type {String}
			 * @default ''
			 */
			label: {
				validator: Lang.isString,
				value: ''
			},
			/**
			 * Id to assign to the DOM element that contains this node.  
			 * If none was supplied, it will generate one
			 * @attribute id
			 * @type {Identifier}
			 * @default Y.guid()
			 * @readOnly
			 */
			id: {
				readOnly: true
			},
			/**
			 * Returns the depth of this node from the root.
			 * This is calculated on-the-fly.
			 * @attribute depth
			 * @type Integer
			 * @readOnly
			 */
			depth: {
				_bypassProxy: true,
				readOnly: true,
				getter: function () {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 796);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 797);
var count = 0, 
						node = this._node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 799);
while (node._parent) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 800);
count += 1;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 801);
node = node._parent;
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 803);
return count-1;
				}
			},
			/**
			 * Expanded state of this node.
			 * @attribute expanded
			 * @type Boolean
			 * @default true
			 */
			expanded: {
				_bypassProxy: true,
				getter: '_expandedGetter',
				setter: '_expandedSetter'
			}
		}
	}
);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 820);
Y.FlyweightTreeNode = FWNode;



}, '@VERSION@', {"requires": ["base-base", "base-build", "classnamemanager"], "skinnable": false});
