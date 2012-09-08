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
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].code=["YUI.add('gallery-flyweight-tree', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	DOT = '.',","	DEFAULT_POOL = '_default',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('flyweight-tree-node', name);","	},","	CNAME_NODE = cName(''),","	CNAME_CHILDREN = cName('children'),","	CNAME_COLLAPSED = cName('collapsed'),","	CNAME_EXPANDED = cName('expanded'),","	CNAME_NOCHILDREN = cName('no-children'),","	CNAME_FIRSTCHILD = cName('first-child'),","	CNAME_LASTCHILD = cName('last-child'),","	CNAME_LOADING = cName('loading'),","	YArray = Y.Array,","	FWMgr,","	FWNode;","","/**","* @module gallery-flyweight-tree","* @submodule flyweight-tree-manager","*","*/","","/**"," * Extension to handle its child nodes by using the flyweight pattern."," * @class FlyweightTreeManager"," * @constructor"," */","FWMgr = function () {","	this._pool = {","		_default: []","	};","};","","FWMgr.ATTRS = {","	/**","	 * Default object type of the child nodes if no explicit type is given in the configuration tree.","	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.  ","	 * ","	 * @attribute defaultType","	 * @type {String | Object}","	 * @default 'FlyweightTreeNode'","	 */","	defaultType: {","		value: 'FlyweightTreeNode'			","	},","	/**","	 * Function used to load the nodes dynamically.","	 * Function will run in the scope of the FlyweightTreeManager instance and will","	 * receive:","	 * ","	 * * node {Y.FlyweightTreeNode} reference to the parent of the children to be loaded.","	 * * callback {Function} function to call with the configuration info for the children.","	 * ","	 * The function shall fetch the nodes and create a configuration object ","	 * much like the one a whole tree might receive.  ","	 * It is not limited to just one level of nodes, it might contain children elements as well.","	 * When the data is processed, it should call the callback with the configuration object.","	 * The function is responsible of handling any errors.","	 * If the the callback is called with no arguments, the parent node will be marked as having no children.","	 * @attribute dynamicLoader","	 * @type {Function}","	 * @default null","	 */","	dynamicLoader: {","		validator: Lang.isFunction,","		value: null","	}","};","","","FWMgr.prototype = {","	/**","	 * Clone of the configuration tree.","	 * The FlyweightTreeNode instances will use the nodes in this tree as the storage for their state.","	 * @property _tree","	 * @type Object","	 * @private","	 */","	_tree: null,","	/**","	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.  ","	 * It contains a hash of arrays indexed by the node type. ","	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.","	 * @property _pool","	 * @type {Object}","	 * @private","	 */","	_pool: null,","	/**","	 * List of dom events to be listened for at the outer contained and fired again","	 * at the node once positioned over the source node.","	 * @property _domEvents","	 * @type Array of strings","	 * @protected","	 * @default null","	 */","	_domEvents: null,","	","	/**","	 * Method to load the configuration tree.","	 * This is not done in the constructor so as to allow the subclass ","	 * to process the tree definition anyway it wants, adding defaults and such","	 * and to name the tree whatever is suitable.","	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.","	 * It also sets initial values for some default properties such as `parent` references and `id` for all nodes.","	 * @method _loadConfig","	 * @param tree {Object} configuration tree","	 * @protected","	 */","	_loadConfig: function (tree) {","		this._tree = {","			children: Y.clone(tree)","		};","		var initNodes = function (parent) {","			Y.Array.each(parent.children, function (child) {","				child._parent = parent;","				child.id = child.id || Y.guid();","				initNodes(child);","			});","		};","		initNodes(this._tree);","		if (this._domEvents) {","			Y.Array.each(this._domEvents, function (event) {","				this.after(event, this._afterDomEvent, this);","			}, this);","		}","	},","	/** Generic event listener for DOM events listed in the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","	 *  It will locate the node that caused the event, slide a suitable instance on it and fire the","	 *  same event on that node.","	 *  @method _afterEvent","	 *  @param ev {EventFacade} Event facade as produced by the event","	 *  @private","	 */","	_afterDomEvent: function (ev) {","		var node = this._poolFetchFromEvent(ev);","		if (node) {","			node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});","			this._poolReturn(node);			","		}","	},","	/**","	 * Pulls from the pool an instance of the type declared in the given node","	 * and slides it over that node.","	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink \"_getNode\"}}{{/crossLink}}","	 * If an instance is held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}), it will be returned instead.","	 * @method _poolFetch","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given node","	 * @protected","	 */","	_poolFetch: function(node) {","		var pool,","			fwNode = node._held,","			type = node.type || DEFAULT_POOL;","			","		if (fwNode) {","			return fwNode;","		}","		if (Lang.isObject(type)) {","			// If the type of object cannot be identified, return a default type.","			type = type.NAME || DEFAULT_POOL;","		}","		pool = this._pool[type] || [];","		if (pool === undefined) {","			pool = this._pool[type] = [];","		}","		if (pool.length) {","			fwNode = pool.pop();","			fwNode._slideTo(node);","			return fwNode;","		}","		return this._getNode(node);","	},","	/**","	 * Returns the FlyweightTreeNode instance to the pool.","	 * Instances held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}) are never returned.","	 * @method _poolReturn","	 * @param fwNode {Y.FlyweightTreeNode} Instance to return.","	 * @protected","	 */","	_poolReturn: function (fwNode) {","		if (fwNode._node._held) {","			return;","		}","		var pool,","			type = fwNode._node.type || DEFAULT_POOL;","		if (Lang.isObject(type)) {","			type = type.NAME;","			if (!type) {","				// Don't know where to put it, drop it.","				return;","			}","		}","		pool = this._pool[type];","		if (pool) {","			pool.push(fwNode);","		}","		","	},","	/**","	 * Returns a new instance of the type given in node or the ","	 * {{#crossLink \"defaultType\"}}{{/crossLink}} if none specified","	 * and slides it on top of the node provided.","	 * @method _getNode","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode","	 * @protected","	 */","	_getNode: function (node) {","		var newNode,","			Type = node.type || this.get('defaultType');","		if (Lang.isString(Type)) {","			Type = Y[Type];","		}","		if (Type) {","			newNode = new Type();","			if (newNode instanceof Y.FlyweightTreeNode) {","				newNode._root =  this;","				newNode._slideTo(node);","				return newNode;","			}","		}","		return null;","	},","	/**","	 * Returns an instance of Flyweight node positioned over the root","	 * @method _getRootNode","	 * @return {Y.FlyweightTreeNode} ","	 * @protected","	 */","	_getRootNode: function () {","		return this._poolFetch(this._tree);","	},","	/**","	 * Returns a string with the markup for the whole tree. ","	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)","	 * @method _getHTML","	 * @return {String} HTML for this widget","	 * @protected","	 */","	_getHTML: function () {","		var s = '',","			root = this._getRootNode();","		root.forEachChild( function (fwNode, index, array) {","			s += fwNode._getHTML(index, array.length, 0);","		});","		this._poolReturn(root);","		return s;","	},","	/**","	 * Locates a node in the tree by the element that represents it.","	 * @method _findNodeByElement","	 * @param el {Y.Node} Any element belonging to the tree","	 * @return {Object} Node that produced the markup for that element or null if not found","	 * @protected","	 */","	_findNodeByElement: function(el) {","		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),","			found = null,","			scan = function (node) {","				if (node.id === id) {","					found = node;","					return true;","				}","				if (node.children) {","					return Y.Array.some(node.children, scan);","				}","				return false;","			};","		if (scan(this._tree)) {","			return found;","		}","		return null;","	},","	/**","	 * Returns a FlyweightTreeNode instance from the pool, positioned over the node whose markup generated some event.","	 * @method _poolFetchFromEvent","	 * @param ev {EventFacade}","	 * @return {Y.FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.","	 * @private","	 */","	_poolFetchFromEvent: function (ev) {","		var found = this._findNodeByElement(ev.domEvent.target);","		if (found) {","			return this._poolFetch(found);","		}","		return null;			","	},","	/**","	 * Traverses the whole configuration tree, calling a given function for each node.","	 * If the function returns true, the traversing will terminate.","	 * @method _forSomeCfgNode","	 * @param fn {Function} Function to call on each configuration node","	 *		@param fn.cfgNode {Object} node in the configuratino tree","	 *		@param fn.depth {Integer} depth of this node within the tee","	 *		@param fn.index {Integer} index of this node within the array of its siblings","	 * @param scope {Object} scope to run the function in, defaults to this.","	 * @return true if any of the function calls returned true (the traversal was terminated earlier)","	 * @protected","	 */","	_forSomeCfgNode: function(fn, scope) {","		scope = scope || this;","		var loop = function(cfgNode, depth) {","			return Y.Array.some(cfgNode.children || [], function(childNode, index) {","				fn.call(scope, childNode,depth, index);","				return loop(childNode,depth + 1);","			});","		};","		return loop(this._tree, 0);","	}","};","","Y.FlyweightTreeManager = FWMgr;","/**","* An implementation of the flyweight pattern.  ","* This object can be slid on top of a literal object containing the definition ","* of a tree and will take its state from that node it is slid upon.","* It relies for most of its functionality on the flyweight manager object,","* which contains most of the code.","* @module gallery-flyweight-tree","* @submodule flyweight-tree-tnode","* @main flyweightmanager","*/","","/**","* An implementation of the flyweight pattern.  This class should not be instantiated directly.","* Instances of this class can be requested from the flyweight manager class","* @class FlyweightTreeNode","* @extends Y.Base","* @constructor  Do instantiate directly.","*/","FWNode = Y.Base.create(","	'flyweight-tree-node',","	Y.Base,","	[],","	{","		/**","		 * Reference to the node in the configuration tree it has been slid over.","		 * @property _node","		 * @type {Object}","		 * @private","		 **/","		_node:null,","		/**","		 * Reference to the FlyweightTreeManager instance this node belongs to.","		 * It is set by the root and should be considered read-only.","		 * @property _root","		 * @type Y.FlyweightTreeManager","		 * @private","		 */","		_root: null,","		/**","		 * Returns a string with the markup for this node along that of its children","		 * produced from its attributes rendered","		 * via the first template string it finds in these locations:","		 *","		 * * It's own {{#crossLink \"template\"}}{{/crossLink}} configuration attribute","		 * * The static {{#crossLink \"FlyweightTreeNode/TEMPLATE\"}}{{/crossLink}} class property","		 *","		 * @method _getHTML","		 * @param index {Integer} index of this node within the array of siblings","		 * @param nSiblings {Integer} number of siblings including this node","		 * @param depth {Integer} number of levels to the root","		 * @return {String} markup generated by this node","		 * @protected","		 */","		_getHTML: function(index, nSiblings, depth) {","			// assumes that if you asked for the HTML it is because you are rendering it","			var self = this,","				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.","				getAttrs = function() {","					var o = {},","					i, l, attr,","","					attrs = Y.Object.keys(self._state.data);","","					for (i = 0, l = attrs.length; i < l; i+=1) {","						attr = attrs[i];","						o[attr] = self.get(attr);","					}","","					return o;","				},","				node = this._node,","				attrs = getAttrs(),","				s = '', ","				templ = node.template || this.constructor.TEMPLATE,","				childCount = node.children && node.children.length,","				nodeClasses = [CNAME_NODE];","","			node._rendered = true;","			if (childCount) {","				if (attrs.expanded) {","					node._childrenRendered = true;","					this.forEachChild( function (fwNode, index, array) {","						s += fwNode._getHTML(index, array.length, depth+1);","					});","					nodeClasses.push(CNAME_EXPANDED);","				} else {","					nodeClasses.push(CNAME_COLLAPSED);","				}","			} else {","				if (this._root.get('dynamicLoader') && !node.isLeaf) {","					nodeClasses.push(CNAME_COLLAPSED);","				} else {","					nodeClasses.push(CNAME_NOCHILDREN);","				}","			}","			if (index === 0) {","				nodeClasses.push(CNAME_FIRSTCHILD);","			} else if (index === nSiblings - 1) {","				nodeClasses.push(CNAME_LASTCHILD);","			}","			attrs.children = s;","			attrs.cname_node = nodeClasses.join(' ');","			attrs.cname_children = CNAME_CHILDREN;","","			return Lang.sub(templ, attrs);","","		},","		/**","		 * Method to slide this instance on top of another node in the configuration object","		 * @method _slideTo","		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.","		 * @private","		 */","		_slideTo: function (node) {","			this._node = node;","		},","		/**","		 * Executes the given function on each of the child nodes of this node.","		 * @method forEachChild","		 * @param fn {Function} Function to be executed on each node","		 *		@param fn.child {Y.FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode, ","		 *		positioned on top of the child node","		 *		@param fn.index {Integer} Index of this child within the array of children","		 *		@param fn.array {Array} array containing itself and its siblings","		 * @param scope {object} The falue of this for the function.  Defaults to the parent.","		**/","		forEachChild: function(fn, scope) {","			var root = this._root,","				children = this._node.children,","				child, ret;","			scope = scope || this;","			if (children && children.length) {","				YArray.each(children, function (node, index, array) {","					child = root._poolFetch(node);","					ret = fn.call(scope, child, index, array);","					root._poolReturn(child);","					return ret;","				});","			}","		},","		/**","		 * Getter for the expanded configuration attribute.","		 * It is meant to be overriden by the developer.","		 * The supplied version defaults to true if the expanded property ","		 * is not set in the underlying configuration tree.","		 * It can be overriden to default to false.","		 * @method _expandedGetter","		 * @return {Boolean} The expanded state of the node.","		 * @protected","		 */","		_expandedGetter: function () {","			return this._node.expanded !== false;","		},","		/**","		 * Setter for the expanded configuration attribute.","		 * It renders the child nodes if this branch has never been expanded.","		 * Then sets the className on the node to the static constants ","		 * CNAME\\_COLLAPSED or CNAME\\_EXPANDED from Y.FlyweightTreeManager","		 * @method _expandedSetter","		 * @param value {Boolean} new value for the expanded attribute","		 * @private","		 */","		_expandedSetter: function (value) {","			var self = this,","				node = self._node,","				root = self._root,","				el = Y.one('#' + node.id),","				dynLoader = root.get('dynamicLoader');","				","			node.expanded = value = !!value;","			if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {","				this._loadDynamic();","				return;","			}","			if (node.children && node.children.length) {","				if (value) {","					if (!node._childrenRendered) {","						self._renderChildren();","					}","					el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);","				} else {","					el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);","				}","			}","		},","		/**","		 * Triggers the dynamic loading of children for this node.","		 * @method _loadDynamic","		 * @private","		 */","		_loadDynamic: function () {","			var self = this,","				root = self._root;","			Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);","			root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));","			","		},","		/**","		 * Callback for the dynamicLoader method.","		 * @method _dynamicLoadReturn","		 * @param response {Array} array of child nodes ","		 */","		_dynamicLoadReturn: function (response) {","			var self = this,","				node = self._node,","				root = self._root,","				initNodes = function (children) {","					YArray.each(children, function (child) {","						child._parent = node;","						child._root = root;","						child.id = child.id || Y.guid();","						initNodes(child.children || []);","					});","				};","","			if (response) {","				initNodes(response);","","				node.children = response;","				self._renderChildren();","			} else {","				node.isLeaf = true;","			}","			// isLeaf might have been set in the response, not just in the line above.","			Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));","		},","		/**","		 * Renders the children of this node.  ","		 * It the children had been rendered, they will be replaced.","		 * @method _renderChildren","		 * @private","		 */","		_renderChildren: function () {","			var s = '',","				node = this._node,","				depth = this.get('depth');","			node._childrenRendered = true;","			this.forEachChild(function (fwNode, index, array) {","				s += fwNode._getHTML(index, array.length, depth + 1);","			});","			Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);","		},","		/**","		 * Generic setter for values stored in the underlying node.","		 * @method _genericSetter","		 * @param value {Any} Value to be set.","		 * @param name {String} Name of the attribute to be set.","		 * @protected","		 */","		_genericSetter: function (value, name) {","			if (this._state.data[name].initializing) {","				// This is to let the initial value pass through","				return value;","			}","			this._node[name] = value;","			// this is to prevent the initial value to be changed.","			return  Y.Attribute.INVALID_VALUE;","		},","		/**","		 * Generic getter for values stored in the underlying node.","		 * @method _genericGetter","		 * @param value {Any} Value stored by Attribute (not used).","		 * @param name {String} Name of the attribute to be read.","		 * @return {Any} Value read.","		 * @protected","		 */","		_genericGetter: function (value, name) {","			// since value is never actually set, ","			// value will always keep the default (initial) value.","			return this._node[name] || value;","		},","		/**","		 * Prevents this instance from being returned to the pool and reused.","		 * Remember to {{#crossLink \"release\"}}{{/crossLink}} this instance when no longer needed.","		 * @method hold","		 * @chainable","		 */","		hold: function () {","			return (this._node._held = this);","		},","		/**","		 * Allows this instance to be returned to the pool and reused.","		 * ","		 * __Important__: This instance should not be used after being released","		 * @method release","		 * @chainable","		 */","		release: function () {","			this._node._held = null;","			this._root._poolReturn(this);","			return this;","		},","		/**","		 * Returns the parent node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getParent","		 * @return Y.FlyweightTreeNode","		 */","		getParent: function() {","			var node = this._node._parent;","			return (node?this._root._poolFetch(node):null);","		},","		/**","		 * Returns the next sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getNextSibling","		 * @return Y.FlyweightTreeNode","		 */","		getNextSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) + 1;","			if (index === 0 || index > siblings.length) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		/**","		 * Returns the previous sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getPreviousSibling","		 * @return Y.FlyweightTreeNode","		 */","		getPreviousSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) - 1;","			if (index < 0) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		","		/**","		 * Sugar method to toggle the expanded state of the node.","		 * @method toggle","		 * @chainable","		 */","		toggle: function() {","			this.set('expanded', !this.get('expanded'));","			return this;","		}","	},","	{","		/**","		 * Template string to be used to render this node.","		 * It should be overriden by the subclass.","		 *    ","		 * It contains the HTML markup for this node plus placeholders,","		 * enclosed in curly braces, that have access to any of the ","		 * configuration attributes of this node plus the following","		 * additional placeholders:","		 * ","		 * * children: The markup for the children of this node will be placed here","		 * * cname_node: The className for the HTML element enclosing this node.","		 *   The template should always use this className to help it locate the DOM element for this node.","		 * * cname_children: The className for the HTML element enclosing the children of this node.","		 * The template should always use this className to help it locate the DOM element that contains the children of this node.","		 * ","		 * The template should also add the `id` attribute to the DOM Element representing this node. ","		 * @property TEMPLATE","		 * @type {String}","		 * @default '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>'","		 * @static","		 */","		TEMPLATE: '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>',","		/**","		 * CCS className constant to use as the class name for the DOM element representing the node.","		 * @property CNAME\\_NODE","		 * @type String","		 * @static","		 */","		CNAME_NODE: CNAME_NODE,","		/**","		 * CCS className constant to use as the class name for the DOM element that will containe the children of this node.","		 * @property CNAME\\_CHILDREN","		 * @type String","		 * @static","		 */","		CNAME_CHILDREN: CNAME_CHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when its state is not expanded.","		 * @property CNAME\\_COLLAPSED","		 * @type String","		 * @static","		 */","		CNAME_COLLAPSED: CNAME_COLLAPSED,","		/**","		 * CCS className constant added to the DOM element for this node when its state is expanded.","		 * @property CNAME\\_EXPANDED","		 * @type String","		 * @static","		 */","		CNAME_EXPANDED: CNAME_EXPANDED,","		/**","		 * CCS className constant added to the DOM element for this node when it has no children.","		 * @property CNAME\\_NOCHILDREN","		 * @type String","		 * @static","		 */","		CNAME_NOCHILDREN: CNAME_NOCHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when it is the first in the group.","		 * @property CNAME\\_FIRSTCHILD","		 * @type String","		 * @static","		 */","		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when it is the last in the group.","		 * @property CNAME\\_LASTCHILD","		 * @type String","		 * @static","		 */","		CNAME_LASTCHILD: CNAME_LASTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when dynamically loading its children.","		 * @property CNAME\\_LOADING","		 * @type String","		 * @static","		 */","		CNAME_LOADING: CNAME_LOADING,","		ATTRS: {","			/**","			 * Reference to the FlyweightTreeManager this node belongs to","			 * @attribute root","			 * @type {Y.FlyweightTreeManager}","			 * @readOnly","			 * ","			 */","","			root: {","				readOnly: true,","				getter: function() {","					return this._root;","				}","			},","","			/**","			 * Template to use on this particular instance.  ","			 * The renderer will default to the static TEMPLATE property of this class ","			 * (the preferred way) or the nodeTemplate configuration attribute of the root.","			 * See the TEMPLATE static property.","			 * @attribute template","			 * @type {String}","			 * @default undefined","			 */","			template: {","				validator: Lang.isString,","				getter: '_genericGetter',","				setter: '_genericSetter'","			},","			/**","			 * Label for this node. Nodes usually have some textual content, this is the place for it.","			 * @attribute label","			 * @type {String}","			 * @default ''","			 */","			label: {","				validator: Lang.isString,","				getter: '_genericGetter',","				setter: '_genericSetter',","				value: ''","			},","			/**","			 * Id to assign to the DOM element that contains this node.  ","			 * If none was supplied, it will generate one","			 * @attribute id","			 * @type {Identifier}","			 * @default Y.guid()","			 * @readOnly","			 */","			id: {","				getter: '_genericGetter',","				readOnly: true","			},","			/**","			 * Returns the depth of this node from the root.","			 * This is calculated on-the-fly.","			 * @attribute depth","			 * @type Integer","			 * @readOnly","			 */","			depth: {","				readOnly: true,","				getter: function () {","					var count = 0, ","						node = this._node;","					while (node._parent) {","						count += 1;","						node = node._parent;","					}","					return count-1;","				}","			},","			/**","			 * Expanded state of this node.","			 * @attribute expanded","			 * @type Boolean","			 * @default true","			 */","			expanded: {","				getter: '_expandedGetter',","				setter: '_expandedSetter'","			}","		}","	}",");","Y.FlyweightTreeNode = FWNode;","","","","}, '@VERSION@', {\"requires\": [\"base-base\", \"base-build\", \"classnamemanager\"], \"skinnable\": false});"];
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].lines = {"1":0,"3":0,"5":0,"10":0,"35":0,"36":0,"41":0,"78":0,"118":0,"121":0,"122":0,"123":0,"124":0,"125":0,"128":0,"129":0,"130":0,"131":0,"143":0,"144":0,"145":0,"146":0,"160":0,"164":0,"165":0,"167":0,"169":0,"171":0,"172":0,"173":0,"175":0,"176":0,"177":0,"178":0,"180":0,"190":0,"191":0,"193":0,"195":0,"196":0,"197":0,"199":0,"202":0,"203":0,"204":0,"218":0,"220":0,"221":0,"223":0,"224":0,"225":0,"226":0,"227":0,"228":0,"231":0,"240":0,"250":0,"252":0,"253":0,"255":0,"256":0,"266":0,"269":0,"270":0,"271":0,"273":0,"274":0,"276":0,"278":0,"279":0,"281":0,"291":0,"292":0,"293":0,"295":0,"310":0,"311":0,"312":0,"313":0,"314":0,"317":0,"321":0,"340":0,"377":0,"380":0,"385":0,"386":0,"387":0,"390":0,"399":0,"400":0,"401":0,"402":0,"403":0,"404":0,"406":0,"408":0,"411":0,"412":0,"414":0,"417":0,"418":0,"419":0,"420":0,"422":0,"423":0,"424":0,"426":0,"436":0,"449":0,"452":0,"453":0,"454":0,"455":0,"456":0,"457":0,"458":0,"473":0,"485":0,"491":0,"492":0,"493":0,"494":0,"496":0,"497":0,"498":0,"499":0,"501":0,"503":0,"513":0,"515":0,"516":0,"525":0,"529":0,"530":0,"531":0,"532":0,"533":0,"537":0,"538":0,"540":0,"541":0,"543":0,"546":0,"555":0,"558":0,"559":0,"560":0,"562":0,"572":0,"574":0,"576":0,"578":0,"591":0,"600":0,"610":0,"611":0,"612":0,"622":0,"623":0,"633":0,"636":0,"637":0,"639":0,"649":0,"652":0,"653":0,"655":0,"664":0,"665":0,"759":0,"811":0,"813":0,"814":0,"815":0,"817":0,"833":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].functions = {"cName:9":0,"FWMgr:35":0,"(anonymous 2):122":0,"initNodes:121":0,"(anonymous 3):130":0,"_loadConfig:117":0,"_afterDomEvent:142":0,"_poolFetch:159":0,"_poolReturn:189":0,"_getNode:217":0,"_getRootNode:239":0,"(anonymous 4):252":0,"_getHTML:249":0,"scan:268":0,"_findNodeByElement:265":0,"_poolFetchFromEvent:290":0,"(anonymous 5):312":0,"loop:311":0,"_forSomeCfgNode:309":0,"getAttrs:379":0,"(anonymous 6):403":0,"_getHTML:375":0,"_slideTo:435":0,"(anonymous 7):454":0,"forEachChild:448":0,"_expandedGetter:472":0,"_expandedSetter:484":0,"_loadDynamic:512":0,"(anonymous 8):529":0,"initNodes:528":0,"_dynamicLoadReturn:524":0,"(anonymous 9):559":0,"_renderChildren:554":0,"_genericSetter:571":0,"_genericGetter:588":0,"hold:599":0,"release:609":0,"getParent:621":0,"getNextSibling:632":0,"getPreviousSibling:648":0,"toggle:663":0,"getter:758":0,"getter:810":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredLines = 177;
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredFunctions = 44;
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
* @submodule flyweight-tree-manager
*
*/

/**
 * Extension to handle its child nodes by using the flyweight pattern.
 * @class FlyweightTreeManager
 * @constructor
 */
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 35);
FWMgr = function () {
	_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "FWMgr", 35);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 36);
this._pool = {
		_default: []
	};
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 41);
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


_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 78);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadConfig", 117);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 118);
this._tree = {
			children: Y.clone(tree)
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 121);
var initNodes = function (parent) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "initNodes", 121);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 122);
Y.Array.each(parent.children, function (child) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 2)", 122);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 123);
child._parent = parent;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 124);
child.id = child.id || Y.guid();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 125);
initNodes(child);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 128);
initNodes(this._tree);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 129);
if (this._domEvents) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 130);
Y.Array.each(this._domEvents, function (event) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 3)", 130);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 131);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_afterDomEvent", 142);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 143);
var node = this._poolFetchFromEvent(ev);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 144);
if (node) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 145);
node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 146);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetch", 159);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 160);
var pool,
			fwNode = node._held,
			type = node.type || DEFAULT_POOL;
			
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 164);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 165);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 167);
if (Lang.isObject(type)) {
			// If the type of object cannot be identified, return a default type.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 169);
type = type.NAME || DEFAULT_POOL;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 171);
pool = this._pool[type] || [];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 172);
if (pool === undefined) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 173);
pool = this._pool[type] = [];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 175);
if (pool.length) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 176);
fwNode = pool.pop();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 177);
fwNode._slideTo(node);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 178);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 180);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolReturn", 189);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 190);
if (fwNode._node._held) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 191);
return;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 193);
var pool,
			type = fwNode._node.type || DEFAULT_POOL;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 195);
if (Lang.isObject(type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 196);
type = type.NAME;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 197);
if (!type) {
				// Don't know where to put it, drop it.
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 199);
return;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 202);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 203);
if (pool) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 204);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getNode", 217);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 218);
var newNode,
			Type = node.type || this.get('defaultType');
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 220);
if (Lang.isString(Type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 221);
Type = Y[Type];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 223);
if (Type) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 224);
newNode = new Type();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 225);
if (newNode instanceof Y.FlyweightTreeNode) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 226);
newNode._root =  this;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 227);
newNode._slideTo(node);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 228);
return newNode;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 231);
return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method _getRootNode
	 * @return {Y.FlyweightTreeNode} 
	 * @protected
	 */
	_getRootNode: function () {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getRootNode", 239);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 240);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 249);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 250);
var s = '',
			root = this._getRootNode();
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 252);
root.forEachChild( function (fwNode, index, array) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 4)", 252);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 253);
s += fwNode._getHTML(index, array.length, 0);
		});
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 255);
this._poolReturn(root);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 256);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_findNodeByElement", 265);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 266);
var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (node) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "scan", 268);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 269);
if (node.id === id) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 270);
found = node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 271);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 273);
if (node.children) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 274);
return Y.Array.some(node.children, scan);
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 276);
return false;
			};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 278);
if (scan(this._tree)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 279);
return found;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 281);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetchFromEvent", 290);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 291);
var found = this._findNodeByElement(ev.domEvent.target);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 292);
if (found) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 293);
return this._poolFetch(found);
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 295);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_forSomeCfgNode", 309);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 310);
scope = scope || this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 311);
var loop = function(cfgNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "loop", 311);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 312);
return Y.Array.some(cfgNode.children || [], function(childNode, index) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 5)", 312);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 313);
fn.call(scope, childNode,depth, index);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 314);
return loop(childNode,depth + 1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 317);
return loop(this._tree, 0);
	}
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 321);
Y.FlyweightTreeManager = FWMgr;
/**
* An implementation of the flyweight pattern.  
* This object can be slid on top of a literal object containing the definition 
* of a tree and will take its state from that node it is slid upon.
* It relies for most of its functionality on the flyweight manager object,
* which contains most of the code.
* @module gallery-flyweight-tree
* @submodule flyweight-tree-tnode
* @main flyweightmanager
*/

/**
* An implementation of the flyweight pattern.  This class should not be instantiated directly.
* Instances of this class can be requested from the flyweight manager class
* @class FlyweightTreeNode
* @extends Y.Base
* @constructor  Do instantiate directly.
*/
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 340);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 375);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 377);
var self = this,
				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.
				getAttrs = function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getAttrs", 379);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 380);
var o = {},
					i, l, attr,

					attrs = Y.Object.keys(self._state.data);

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 385);
for (i = 0, l = attrs.length; i < l; i+=1) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 386);
attr = attrs[i];
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 387);
o[attr] = self.get(attr);
					}

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 390);
return o;
				},
				node = this._node,
				attrs = getAttrs(),
				s = '', 
				templ = node.template || this.constructor.TEMPLATE,
				childCount = node.children && node.children.length,
				nodeClasses = [CNAME_NODE];

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 399);
node._rendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 400);
if (childCount) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 401);
if (attrs.expanded) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 402);
node._childrenRendered = true;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 403);
this.forEachChild( function (fwNode, index, array) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 6)", 403);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 404);
s += fwNode._getHTML(index, array.length, depth+1);
					});
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 406);
nodeClasses.push(CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 408);
nodeClasses.push(CNAME_COLLAPSED);
				}
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 411);
if (this._root.get('dynamicLoader') && !node.isLeaf) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 412);
nodeClasses.push(CNAME_COLLAPSED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 414);
nodeClasses.push(CNAME_NOCHILDREN);
				}
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 417);
if (index === 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 418);
nodeClasses.push(CNAME_FIRSTCHILD);
			} else {_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 419);
if (index === nSiblings - 1) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 420);
nodeClasses.push(CNAME_LASTCHILD);
			}}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 422);
attrs.children = s;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 423);
attrs.cname_node = nodeClasses.join(' ');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 424);
attrs.cname_children = CNAME_CHILDREN;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 426);
return Lang.sub(templ, attrs);

		},
		/**
		 * Method to slide this instance on top of another node in the configuration object
		 * @method _slideTo
		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.
		 * @private
		 */
		_slideTo: function (node) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_slideTo", 435);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 436);
this._node = node;
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forEachChild", 448);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 449);
var root = this._root,
				children = this._node.children,
				child, ret;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 452);
scope = scope || this;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 453);
if (children && children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 454);
YArray.each(children, function (node, index, array) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 7)", 454);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 455);
child = root._poolFetch(node);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 456);
ret = fn.call(scope, child, index, array);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 457);
root._poolReturn(child);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 458);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedGetter", 472);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 473);
return this._node.expanded !== false;
		},
		/**
		 * Setter for the expanded configuration attribute.
		 * It renders the child nodes if this branch has never been expanded.
		 * Then sets the className on the node to the static constants 
		 * CNAME\_COLLAPSED or CNAME\_EXPANDED from Y.FlyweightTreeManager
		 * @method _expandedSetter
		 * @param value {Boolean} new value for the expanded attribute
		 * @private
		 */
		_expandedSetter: function (value) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedSetter", 484);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 485);
var self = this,
				node = self._node,
				root = self._root,
				el = Y.one('#' + node.id),
				dynLoader = root.get('dynamicLoader');
				
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 491);
node.expanded = value = !!value;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 492);
if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 493);
this._loadDynamic();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 494);
return;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 496);
if (node.children && node.children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 497);
if (value) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 498);
if (!node._childrenRendered) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 499);
self._renderChildren();
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 501);
el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 503);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadDynamic", 512);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 513);
var self = this,
				root = self._root;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 515);
Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 516);
root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));
			
		},
		/**
		 * Callback for the dynamicLoader method.
		 * @method _dynamicLoadReturn
		 * @param response {Array} array of child nodes 
		 */
		_dynamicLoadReturn: function (response) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoadReturn", 524);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 525);
var self = this,
				node = self._node,
				root = self._root,
				initNodes = function (children) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "initNodes", 528);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 529);
YArray.each(children, function (child) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 8)", 529);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 530);
child._parent = node;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 531);
child._root = root;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 532);
child.id = child.id || Y.guid();
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 533);
initNodes(child.children || []);
					});
				};

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 537);
if (response) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 538);
initNodes(response);

				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 540);
node.children = response;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 541);
self._renderChildren();
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 543);
node.isLeaf = true;
			}
			// isLeaf might have been set in the response, not just in the line above.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 546);
Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));
		},
		/**
		 * Renders the children of this node.  
		 * It the children had been rendered, they will be replaced.
		 * @method _renderChildren
		 * @private
		 */
		_renderChildren: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_renderChildren", 554);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 555);
var s = '',
				node = this._node,
				depth = this.get('depth');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 558);
node._childrenRendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 559);
this.forEachChild(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 9)", 559);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 560);
s += fwNode._getHTML(index, array.length, depth + 1);
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 562);
Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);
		},
		/**
		 * Generic setter for values stored in the underlying node.
		 * @method _genericSetter
		 * @param value {Any} Value to be set.
		 * @param name {String} Name of the attribute to be set.
		 * @protected
		 */
		_genericSetter: function (value, name) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_genericSetter", 571);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 572);
if (this._state.data[name].initializing) {
				// This is to let the initial value pass through
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 574);
return value;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 576);
this._node[name] = value;
			// this is to prevent the initial value to be changed.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 578);
return  Y.Attribute.INVALID_VALUE;
		},
		/**
		 * Generic getter for values stored in the underlying node.
		 * @method _genericGetter
		 * @param value {Any} Value stored by Attribute (not used).
		 * @param name {String} Name of the attribute to be read.
		 * @return {Any} Value read.
		 * @protected
		 */
		_genericGetter: function (value, name) {
			// since value is never actually set, 
			// value will always keep the default (initial) value.
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_genericGetter", 588);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 591);
return this._node[name] || value;
		},
		/**
		 * Prevents this instance from being returned to the pool and reused.
		 * Remember to {{#crossLink "release"}}{{/crossLink}} this instance when no longer needed.
		 * @method hold
		 * @chainable
		 */
		hold: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "hold", 599);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 600);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "release", 609);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 610);
this._node._held = null;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 611);
this._root._poolReturn(this);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 612);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getParent", 621);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 622);
var node = this._node._parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 623);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getNextSibling", 632);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 633);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) + 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 636);
if (index === 0 || index > siblings.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 637);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 639);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getPreviousSibling", 648);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 649);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) - 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 652);
if (index < 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 653);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 655);
return this._root._poolFetch(siblings[index]);
		},
		
		/**
		 * Sugar method to toggle the expanded state of the node.
		 * @method toggle
		 * @chainable
		 */
		toggle: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "toggle", 663);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 664);
this.set('expanded', !this.get('expanded'));
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 665);
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
		 * @property CNAME\_NODE
		 * @type String
		 * @static
		 */
		CNAME_NODE: CNAME_NODE,
		/**
		 * CCS className constant to use as the class name for the DOM element that will containe the children of this node.
		 * @property CNAME\_CHILDREN
		 * @type String
		 * @static
		 */
		CNAME_CHILDREN: CNAME_CHILDREN,
		/**
		 * CCS className constant added to the DOM element for this node when its state is not expanded.
		 * @property CNAME\_COLLAPSED
		 * @type String
		 * @static
		 */
		CNAME_COLLAPSED: CNAME_COLLAPSED,
		/**
		 * CCS className constant added to the DOM element for this node when its state is expanded.
		 * @property CNAME\_EXPANDED
		 * @type String
		 * @static
		 */
		CNAME_EXPANDED: CNAME_EXPANDED,
		/**
		 * CCS className constant added to the DOM element for this node when it has no children.
		 * @property CNAME\_NOCHILDREN
		 * @type String
		 * @static
		 */
		CNAME_NOCHILDREN: CNAME_NOCHILDREN,
		/**
		 * CCS className constant added to the DOM element for this node when it is the first in the group.
		 * @property CNAME\_FIRSTCHILD
		 * @type String
		 * @static
		 */
		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,
		/**
		 * CCS className constant added to the DOM element for this node when it is the last in the group.
		 * @property CNAME\_LASTCHILD
		 * @type String
		 * @static
		 */
		CNAME_LASTCHILD: CNAME_LASTCHILD,
		/**
		 * CCS className constant added to the DOM element for this node when dynamically loading its children.
		 * @property CNAME\_LOADING
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
				readOnly: true,
				getter: function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 758);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 759);
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
				validator: Lang.isString,
				getter: '_genericGetter',
				setter: '_genericSetter'
			},
			/**
			 * Label for this node. Nodes usually have some textual content, this is the place for it.
			 * @attribute label
			 * @type {String}
			 * @default ''
			 */
			label: {
				validator: Lang.isString,
				getter: '_genericGetter',
				setter: '_genericSetter',
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
				getter: '_genericGetter',
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
				readOnly: true,
				getter: function () {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 810);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 811);
var count = 0, 
						node = this._node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 813);
while (node._parent) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 814);
count += 1;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 815);
node = node._parent;
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 817);
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
				getter: '_expandedGetter',
				setter: '_expandedSetter'
			}
		}
	}
);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 833);
Y.FlyweightTreeNode = FWNode;



}, '@VERSION@', {"requires": ["base-base", "base-build", "classnamemanager"], "skinnable": false});
