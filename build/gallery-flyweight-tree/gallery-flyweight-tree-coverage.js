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
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].code=["YUI.add('gallery-flyweight-tree', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	DOT = '.',","	DEFAULT_POOL = '_default',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('flyweight-tree-node', name);","	},","	CNAME_NODE = cName(''),","	CNAME_CHILDREN = cName('children'),","	CNAME_COLLAPSED = cName('collapsed'),","	CNAME_EXPANDED = cName('expanded'),","	CNAME_NOCHILDREN = cName('no-children'),","	CNAME_FIRSTCHILD = cName('first-child'),","	CNAME_LASTCHILD = cName('last-child'),","	CNAME_LOADING = cName('loading'),","	YArray = Y.Array,","	FWMgr,","	FWNode;","","/**","* @module gallery-flyweight-tree","*","*/","","/**"," * Extension to handle its child nodes by using the flyweight pattern."," * @class Y.FlyweightTreeManager"," * @constructor"," */","FWMgr = function () {","	this._pool = {};","	this._initialValues = {};","};","","FWMgr.ATTRS = {","	/**","	 * Default object type of the child nodes if no explicit type is given in the configuration tree.","	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.  ","	 * ","	 * @attribute defaultType","	 * @type {String | Object}","	 * @default 'FlyweightTreeNode'","	 */","	defaultType: {","		value: 'FlyweightTreeNode'			","	},","	/**","	 * Function used to load the nodes dynamically.","	 * Function will run in the scope of the FlyweightTreeManager instance and will","	 * receive:","	 * ","	 * * node {Y.FlyweightTreeNode} reference to the parent of the children to be loaded.","	 * * callback {Function} function to call with the configuration info for the children.","	 * ","	 * The function shall fetch the nodes and create a configuration object ","	 * much like the one a whole tree might receive.  ","	 * It is not limited to just one level of nodes, it might contain children elements as well.","	 * When the data is processed, it should call the callback with the configuration object.","	 * The function is responsible of handling any errors.","	 * If the the callback is called with no arguments, the parent node will be marked as having no children.","	 * @attribute dynamicLoader","	 * @type {Function}","	 * @default null","	 */","	dynamicLoader: {","		validator: Lang.isFunction,","		value: null","	}","};","","","FWMgr.prototype = {","	/**","	 * Clone of the configuration tree.","	 * The FlyweightTreeNode instances will use the nodes in this tree as the storage for their state.","	 * @property _tree","	 * @type Object","	 * @private","	 */","	_tree: null,","	/**","	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.  ","	 * It contains a hash of arrays indexed by the node type. ","	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.","	 * @property _pool","	 * @type {Object}","	 * @private","	 */","	_pool: null,","	/**","	 * Initial values for node attributes.  ","	 * Contains default values for each node type, indexed by node type and attribute name.","	 * @property _initialValues","	 * @type Object","	 * @private","	 */","	_initialValues: null,","	/**","	 * List of dom events to be listened for at the outer contained and fired again","	 * at the node once positioned over the source node.","	 * @property _domEvents","	 * @type Array of strings","	 * @protected","	 * @default null","	 */","	_domEvents: null,","	","	/**","	 * Method to load the configuration tree.","	 * This is not done in the constructor so as to allow the subclass ","	 * to process the tree definition anyway it wants, adding defaults and such","	 * and to name the tree whatever is suitable.","	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.","	 * It also sets initial values for some default properties such as `parent` references and `id` for all nodes.","	 * @method _loadConfig","	 * @param tree {Array} Configuration for the first level of nodes. ","	 * Contains objects with the following attributes:","	 * @param tree.label {String} Text or HTML markup to be shown in the node","	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.","	 * @param [tree.children] {Array} Further definitions for the children of this node","	 * @param [tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node.  ","	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.","	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node.","	 * @param [tree.template] {String} Template for this particular node. ","	 * @protected","	 */","	_loadConfig: function (tree) {","		var self = this;","		self._tree = {","			children: Y.clone(tree)","		};","		self._initNodes(this._tree);","		if (self._domEvents) {","			Y.Array.each(self._domEvents, function (event) {","				self.after(event, self._afterDomEvent, self);","			});","		}","	},","	/** Initializes the node configuration with default values and management info.","	 * @method _initNodes","	 * @param parent {Object} Parent of the nodes to be set","	 * @private","	 */","	_initNodes: function (parent) {","		var self = this, ","			fwNode,","			type,","			defaultValues,","			name,","			value;","		Y.Array.each(parent.children, function (child) {","			type = child.type || DEFAULT_POOL;","			defaultValues = self._initialValues[type];","			if (!defaultValues) {","				defaultValues = {type:child.type};","				fwNode = self._poolFetch(defaultValues);","					for (name in fwNode._attrs) {","					if (fwNode._attrs.hasOwnProperty(name) && ['initialized','destroyed'].indexOf(name) === -1) {","						value = fwNode._state.get(name,'value');","						if (value !== undefined) {","							defaultValues[name] =  value;","							fwNode._state.remove(name,'value');","						}","					}","				}","				self._initialValues[type] = defaultValues;","				self._poolReturn(fwNode);","			}","			Y.Object.each(defaultValues, function(value, name) {","				if (child[name] === undefined) {","					child[name] = value;","				}","			});","			child._parent = parent;","			child.id = child.id || Y.guid();","			self._initNodes(child);","		});","	},","","	/** Generic event listener for DOM events listed in the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","	 *  It will locate the node that caused the event, slide a suitable instance on it and fire the","	 *  same event on that node.","	 *  @method _afterEvent","	 *  @param ev {EventFacade} Event facade as produced by the event","	 *  @private","	 */","	_afterDomEvent: function (ev) {","		var node = this._poolFetchFromEvent(ev);","		if (node) {","			node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});","			this._poolReturn(node);			","		}","	},","	/**","	 * Pulls from the pool an instance of the type declared in the given node","	 * and slides it over that node.","	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink \"_getNode\"}}{{/crossLink}}","	 * If an instance is held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}), it will be returned instead.","	 * @method _poolFetch","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given node","	 * @protected","	 */","	_poolFetch: function(node) {","		var pool,","			fwNode = node._held,","			type = node.type || DEFAULT_POOL;","			","		if (fwNode) {","			return fwNode;","		}","		if (Lang.isObject(type)) {","			// If the type of object cannot be identified, return a default type.","			type = type.NAME || DEFAULT_POOL;","		}","		pool = this._pool[type];","		if (pool === undefined) {","			pool = this._pool[type] = [];","		}","		if (pool.length) {","			fwNode = pool.pop();","			fwNode._slideTo(node);","			return fwNode;","		}","		return this._getNode(node);","	},","	/**","	 * Returns the FlyweightTreeNode instance to the pool.","	 * Instances held (see: {{#crossLink \"Y.FlyweightTreeNode/hold\"}}{{/crossLink}}) are never returned.","	 * @method _poolReturn","	 * @param fwNode {Y.FlyweightTreeNode} Instance to return.","	 * @protected","	 */","	_poolReturn: function (fwNode) {","		if (fwNode._node._held) {","			return;","		}","		var pool,","			type = fwNode._node.type || DEFAULT_POOL;","		if (Lang.isObject(type)) {","			type = type.NAME;","			if (!type) {","				// Don't know where to put it, drop it.","				return;","			}","		}","		pool = this._pool[type];","		if (pool) {","			pool.push(fwNode);","		}","		","	},","	/**","	 * Returns a new instance of the type given in node or the ","	 * {{#crossLink \"defaultType\"}}{{/crossLink}} if none specified","	 * and slides it on top of the node provided.","	 * @method _getNode","	 * @param node {Object} reference to a node within the configuration tree","	 * @return {Y.FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode","	 * @protected","	 */","	_getNode: function (node) {","		var newNode,","			Type = node.type || this.get('defaultType');","		if (Lang.isString(Type)) {","			Type = Y[Type];","		}","		if (Type) {","			newNode = new Type();","			if (newNode instanceof Y.FlyweightTreeNode) {","				// I need to do this otherwise Attribute will initialize the real node with default values","				newNode._slideTo({});","				newNode.getAttrs();","				// That's it (see above)","				newNode._root =  this;","				newNode._slideTo(node);","				return newNode;","			}","		}","		return null;","	},","	/**","	 * Returns an instance of Flyweight node positioned over the root","	 * @method _getRootNode","	 * @return {Y.FlyweightTreeNode} ","	 * @protected","	 */","	_getRootNode: function () {","		return this._poolFetch(this._tree);","	},","	/**","	 * Returns a string with the markup for the whole tree. ","	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)","	 * @method _getHTML","	 * @return {String} HTML for this widget","	 * @protected","	 */","	_getHTML: function () {","		var s = '',","			root = this._getRootNode();","		root.forEachChild( function (fwNode, index, array) {","			s += fwNode._getHTML(index, array.length, 0);","		});","		this._poolReturn(root);","		return s;","	},","	/**","	 * Locates a node in the tree by the element that represents it.","	 * @method _findNodeByElement","	 * @param el {Y.Node} Any element belonging to the tree","	 * @return {Object} Node that produced the markup for that element or null if not found","	 * @protected","	 */","	_findNodeByElement: function(el) {","		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),","			found = null,","			scan = function (node) {","				if (node.id === id) {","					found = node;","					return true;","				}","				if (node.children) {","					return Y.Array.some(node.children, scan);","				}","				return false;","			};","		if (scan(this._tree)) {","			return found;","		}","		return null;","	},","	/**","	 * Returns a FlyweightTreeNode instance from the pool, positioned over the node whose markup generated some event.","	 * @method _poolFetchFromEvent","	 * @param ev {EventFacade}","	 * @return {Y.FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.","	 * @private","	 */","	_poolFetchFromEvent: function (ev) {","		var found = this._findNodeByElement(ev.domEvent.target);","		if (found) {","			return this._poolFetch(found);","		}","		return null;			","	},","	/**","	 * Traverses the whole configuration tree, calling a given function for each node.","	 * If the function returns true, the traversing will terminate.","	 * @method _forSomeCfgNode","	 * @param fn {Function} Function to call on each configuration node","	 *		@param fn.cfgNode {Object} node in the configuratino tree","	 *		@param fn.depth {Integer} depth of this node within the tee","	 *		@param fn.index {Integer} index of this node within the array of its siblings","	 * @param scope {Object} scope to run the function in, defaults to this.","	 * @return true if any of the function calls returned true (the traversal was terminated earlier)","	 * @protected","	 */","	_forSomeCfgNode: function(fn, scope) {","		scope = scope || this;","		var loop = function(cfgNode, depth) {","			return Y.Array.some(cfgNode.children || [], function(childNode, index) {","				fn.call(scope, childNode,depth, index);","				return loop(childNode,depth + 1);","			});","		};","		return loop(this._tree, 0);","	}","};","","Y.FlyweightTreeManager = FWMgr;","/**","* An implementation of the flyweight pattern.  ","* This object can be slid on top of a literal object containing the definition ","* of a tree and will take its state from that node it is slid upon.","* It relies for most of its functionality on the flyweight manager object,","* which contains most of the code.","* @module gallery-flyweight-tree","*/","","/**","* An implementation of the flyweight pattern.  This class should not be instantiated directly.","* Instances of this class can be requested from the flyweight manager class","* @class Y.FlyweightTreeNode","* @extends Y.Base","* @constructor  Do not instantiate directly.","*/","FWNode = Y.Base.create(","	'flyweight-tree-node',","	Y.Base,","	[],","	{","		/**","		 * Reference to the node in the configuration tree it has been slid over.","		 * @property _node","		 * @type {Object}","		 * @private","		 **/","		_node:null,","		/**","		 * Reference to the FlyweightTreeManager instance this node belongs to.","		 * It is set by the root and should be considered read-only.","		 * @property _root","		 * @type Y.FlyweightTreeManager","		 * @private","		 */","		_root: null,","		/**","		 * Returns a string with the markup for this node along that of its children","		 * produced from its attributes rendered","		 * via the first template string it finds in these locations:","		 *","		 * * It's own {{#crossLink \"template\"}}{{/crossLink}} configuration attribute","		 * * The static {{#crossLink \"FlyweightTreeNode/TEMPLATE\"}}{{/crossLink}} class property","		 *","		 * @method _getHTML","		 * @param index {Integer} index of this node within the array of siblings","		 * @param nSiblings {Integer} number of siblings including this node","		 * @param depth {Integer} number of levels to the root","		 * @return {String} markup generated by this node","		 * @protected","		 */","		_getHTML: function(index, nSiblings, depth) {","			// assumes that if you asked for the HTML it is because you are rendering it","			var self = this,","				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.","				getAttrs = function() {","					var o = {},","					i, l, attr,","","					attrs = Y.Object.keys(self._state.data);","","					for (i = 0, l = attrs.length; i < l; i+=1) {","						attr = attrs[i];","						o[attr] = self.get(attr);","					}","","					return o;","				},","				node = this._node,","				attrs = getAttrs(),","				s = '', ","				templ = node.template || this.constructor.TEMPLATE,","				childCount = node.children && node.children.length,","				nodeClasses = [CNAME_NODE];","","			node._rendered = true;","			if (childCount) {","				if (attrs.expanded) {","					node._childrenRendered = true;","					this.forEachChild( function (fwNode, index, array) {","						s += fwNode._getHTML(index, array.length, depth+1);","					});","					nodeClasses.push(CNAME_EXPANDED);","				} else {","					nodeClasses.push(CNAME_COLLAPSED);","				}","			} else {","				if (this._root.get('dynamicLoader') && !node.isLeaf) {","					nodeClasses.push(CNAME_COLLAPSED);","				} else {","					nodeClasses.push(CNAME_NOCHILDREN);","				}","			}","			if (index === 0) {","				nodeClasses.push(CNAME_FIRSTCHILD);","			} else if (index === nSiblings - 1) {","				nodeClasses.push(CNAME_LASTCHILD);","			}","			attrs.children = s;","			attrs.cname_node = nodeClasses.join(' ');","			attrs.cname_children = CNAME_CHILDREN;","","			return Lang.sub(templ, attrs);","","		},","		/**","		 * Method to slide this instance on top of another node in the configuration object","		 * @method _slideTo","		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.","		 * @private","		 */","		_slideTo: function (node) {","			this._node = node;","			this._stateProxy = node;","		},","		/**","		 * Executes the given function on each of the child nodes of this node.","		 * @method forEachChild","		 * @param fn {Function} Function to be executed on each node","		 *		@param fn.child {Y.FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode, ","		 *		positioned on top of the child node","		 *		@param fn.index {Integer} Index of this child within the array of children","		 *		@param fn.array {Array} array containing itself and its siblings","		 * @param scope {object} The falue of this for the function.  Defaults to the parent.","		**/","		forEachChild: function(fn, scope) {","			var root = this._root,","				children = this._node.children,","				child, ret;","			scope = scope || this;","			if (children && children.length) {","				YArray.each(children, function (node, index, array) {","					child = root._poolFetch(node);","					ret = fn.call(scope, child, index, array);","					root._poolReturn(child);","					return ret;","				});","			}","		},","		/**","		 * Getter for the expanded configuration attribute.","		 * It is meant to be overriden by the developer.","		 * The supplied version defaults to true if the expanded property ","		 * is not set in the underlying configuration tree.","		 * It can be overriden to default to false.","		 * @method _expandedGetter","		 * @return {Boolean} The expanded state of the node.","		 * @protected","		 */","		_expandedGetter: function () {","			return this._node.expanded !== false;","		},","		/**","		 * Setter for the expanded configuration attribute.","		 * It renders the child nodes if this branch has never been expanded.","		 * Then sets the className on the node to the static constants ","		 * CNAME_COLLAPSED or CNAME_EXPANDED from Y.FlyweightTreeManager","		 * @method _expandedSetter","		 * @param value {Boolean} new value for the expanded attribute","		 * @private","		 */","		_expandedSetter: function (value) {","			var self = this,","				node = self._node,","				root = self._root,","				el = Y.one('#' + node.id),","				dynLoader = root.get('dynamicLoader');","				","			node.expanded = value = !!value;","			if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {","				this._loadDynamic();","				return;","			}","			if (node.children && node.children.length) {","				if (value) {","					if (!node._childrenRendered) {","						self._renderChildren();","					}","					el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);","				} else {","					el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);","				}","			}","		},","		/**","		 * Triggers the dynamic loading of children for this node.","		 * @method _loadDynamic","		 * @private","		 */","		_loadDynamic: function () {","			var self = this,","				root = self._root;","			Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);","			root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));","			","		},","		/**","		 * Callback for the dynamicLoader method.","		 * @method _dynamicLoadReturn","		 * @param response {Array} array of child nodes ","		 */","		_dynamicLoadReturn: function (response) {","			var self = this,","				node = self._node,","				root = self._root;","","			if (response) {","","				node.children = response;","				root._initNodes(node);","				self._renderChildren();","			} else {","				node.isLeaf = true;","			}","			// isLeaf might have been set in the response, not just in the line above.","			Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));","		},","		/**","		 * Renders the children of this node.  ","		 * It the children had been rendered, they will be replaced.","		 * @method _renderChildren","		 * @private","		 */","		_renderChildren: function () {","			var s = '',","				node = this._node,","				depth = this.get('depth');","			node._childrenRendered = true;","			this.forEachChild(function (fwNode, index, array) {","				s += fwNode._getHTML(index, array.length, depth + 1);","			});","			Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);","		},","		/**","		 * Prevents this instance from being returned to the pool and reused.","		 * Remember to {{#crossLink \"release\"}}{{/crossLink}} this instance when no longer needed.","		 * @method hold","		 * @chainable","		 */","		hold: function () {","			return (this._node._held = this);","		},","		/**","		 * Allows this instance to be returned to the pool and reused.","		 * ","		 * __Important__: This instance should not be used after being released","		 * @method release","		 * @chainable","		 */","		release: function () {","			this._node._held = null;","			this._root._poolReturn(this);","			return this;","		},","		/**","		 * Returns the parent node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getParent","		 * @return Y.FlyweightTreeNode","		 */","		getParent: function() {","			var node = this._node._parent;","			return (node?this._root._poolFetch(node):null);","		},","		/**","		 * Returns the next sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getNextSibling","		 * @return Y.FlyweightTreeNode","		 */","		getNextSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) + 1;","			if (index === 0 || index > siblings.length) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		/**","		 * Returns the previous sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.  ","		 * Remember to release the copy to the pool when done.","		 * @method getPreviousSibling","		 * @return Y.FlyweightTreeNode","		 */","		getPreviousSibling: function() {","			var parent = this._node._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) - 1;","			if (index < 0) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		","		/**","		 * Sugar method to toggle the expanded state of the node.","		 * @method toggle","		 * @chainable","		 */","		toggle: function() {","			this.set('expanded', !this.get('expanded'));","			return this;","		}","	},","	{","		/**","		 * Template string to be used to render this node.","		 * It should be overriden by the subclass.","		 *    ","		 * It contains the HTML markup for this node plus placeholders,","		 * enclosed in curly braces, that have access to any of the ","		 * configuration attributes of this node plus the following","		 * additional placeholders:","		 * ","		 * * children: The markup for the children of this node will be placed here","		 * * cname_node: The className for the HTML element enclosing this node.","		 *   The template should always use this className to help it locate the DOM element for this node.","		 * * cname_children: The className for the HTML element enclosing the children of this node.","		 * The template should always use this className to help it locate the DOM element that contains the children of this node.","		 * ","		 * The template should also add the `id` attribute to the DOM Element representing this node. ","		 * @property TEMPLATE","		 * @type {String}","		 * @default '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>'","		 * @static","		 */","		TEMPLATE: '<div id=\"{id}\" class=\"{cname_node}\"><div class=\"content\">{label}</div><div class=\"{cname_children}\">{children}</div></div>',","		/**","		 * CCS className constant to use as the class name for the DOM element representing the node.","		 * @property CNAME_NODE","		 * @type String","		 * @static","		 */","		CNAME_NODE: CNAME_NODE,","		/**","		 * CCS className constant to use as the class name for the DOM element that will containe the children of this node.","		 * @property CNAME_CHILDREN","		 * @type String","		 * @static","		 */","		CNAME_CHILDREN: CNAME_CHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when its state is not expanded.","		 * @property CNAME_COLLAPSED","		 * @type String","		 * @static","		 */","		CNAME_COLLAPSED: CNAME_COLLAPSED,","		/**","		 * CCS className constant added to the DOM element for this node when its state is expanded.","		 * @property CNAME_EXPANDED","		 * @type String","		 * @static","		 */","		CNAME_EXPANDED: CNAME_EXPANDED,","		/**","		 * CCS className constant added to the DOM element for this node when it has no children.","		 * @property CNAME_NOCHILDREN","		 * @type String","		 * @static","		 */","		CNAME_NOCHILDREN: CNAME_NOCHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when it is the first in the group.","		 * @property CNAME_FIRSTCHILD","		 * @type String","		 * @static","		 */","		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when it is the last in the group.","		 * @property CNAME_LASTCHILD","		 * @type String","		 * @static","		 */","		CNAME_LASTCHILD: CNAME_LASTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when dynamically loading its children.","		 * @property CNAME_LOADING","		 * @type String","		 * @static","		 */","		CNAME_LOADING: CNAME_LOADING,","		ATTRS: {","			/**","			 * Reference to the FlyweightTreeManager this node belongs to","			 * @attribute root","			 * @type {Y.FlyweightTreeManager}","			 * @readOnly","			 * ","			 */","","			root: {","				_bypassProxy: true,","				readOnly: true,","				getter: function() {","					return this._root;","				}","			},","","			/**","			 * Template to use on this particular instance.  ","			 * The renderer will default to the static TEMPLATE property of this class ","			 * (the preferred way) or the nodeTemplate configuration attribute of the root.","			 * See the TEMPLATE static property.","			 * @attribute template","			 * @type {String}","			 * @default undefined","			 */","			template: {","				validator: Lang.isString","			},","			/**","			 * Label for this node. Nodes usually have some textual content, this is the place for it.","			 * @attribute label","			 * @type {String}","			 * @default ''","			 */","			label: {","				validator: Lang.isString,","				value: ''","			},","			/**","			 * Id to assign to the DOM element that contains this node.  ","			 * If none was supplied, it will generate one","			 * @attribute id","			 * @type {Identifier}","			 * @default Y.guid()","			 * @readOnly","			 */","			id: {","				readOnly: true","			},","			/**","			 * Returns the depth of this node from the root.","			 * This is calculated on-the-fly.","			 * @attribute depth","			 * @type Integer","			 * @readOnly","			 */","			depth: {","				_bypassProxy: true,","				readOnly: true,","				getter: function () {","					var count = 0, ","						node = this._node;","					while (node._parent) {","						count += 1;","						node = node._parent;","					}","					return count-1;","				}","			},","			/**","			 * Expanded state of this node.","			 * @attribute expanded","			 * @type Boolean","			 * @default true","			 */","			expanded: {","				_bypassProxy: true,","				getter: '_expandedGetter',","				setter: '_expandedSetter'","			}","		}","	}",");","Y.FlyweightTreeNode = FWNode;","","","","}, '@VERSION@', {\"requires\": [\"base-base\", \"base-build\", \"classnamemanager\"], \"skinnable\": false});"];
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].lines = {"1":0,"3":0,"5":0,"10":0,"34":0,"35":0,"36":0,"39":0,"76":0,"132":0,"133":0,"136":0,"137":0,"138":0,"139":0,"149":0,"155":0,"156":0,"157":0,"158":0,"159":0,"160":0,"161":0,"162":0,"163":0,"164":0,"165":0,"166":0,"170":0,"171":0,"173":0,"174":0,"175":0,"178":0,"179":0,"180":0,"192":0,"193":0,"194":0,"195":0,"209":0,"213":0,"214":0,"216":0,"218":0,"220":0,"221":0,"222":0,"224":0,"225":0,"226":0,"227":0,"229":0,"239":0,"240":0,"242":0,"244":0,"245":0,"246":0,"248":0,"251":0,"252":0,"253":0,"267":0,"269":0,"270":0,"272":0,"273":0,"274":0,"276":0,"277":0,"279":0,"280":0,"281":0,"284":0,"293":0,"303":0,"305":0,"306":0,"308":0,"309":0,"319":0,"322":0,"323":0,"324":0,"326":0,"327":0,"329":0,"331":0,"332":0,"334":0,"344":0,"345":0,"346":0,"348":0,"363":0,"364":0,"365":0,"366":0,"367":0,"370":0,"374":0,"391":0,"428":0,"431":0,"436":0,"437":0,"438":0,"441":0,"450":0,"451":0,"452":0,"453":0,"454":0,"455":0,"457":0,"459":0,"462":0,"463":0,"465":0,"468":0,"469":0,"470":0,"471":0,"473":0,"474":0,"475":0,"477":0,"487":0,"488":0,"501":0,"504":0,"505":0,"506":0,"507":0,"508":0,"509":0,"510":0,"525":0,"537":0,"543":0,"544":0,"545":0,"546":0,"548":0,"549":0,"550":0,"551":0,"553":0,"555":0,"565":0,"567":0,"568":0,"577":0,"581":0,"583":0,"584":0,"585":0,"587":0,"590":0,"599":0,"602":0,"603":0,"604":0,"606":0,"615":0,"625":0,"626":0,"627":0,"637":0,"638":0,"648":0,"651":0,"652":0,"654":0,"664":0,"667":0,"668":0,"670":0,"679":0,"680":0,"775":0,"823":0,"825":0,"826":0,"827":0,"829":0,"846":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].functions = {"cName:9":0,"FWMgr:34":0,"(anonymous 2):138":0,"_loadConfig:131":0,"(anonymous 4):173":0,"(anonymous 3):155":0,"_initNodes:148":0,"_afterDomEvent:191":0,"_poolFetch:208":0,"_poolReturn:238":0,"_getNode:266":0,"_getRootNode:292":0,"(anonymous 5):305":0,"_getHTML:302":0,"scan:321":0,"_findNodeByElement:318":0,"_poolFetchFromEvent:343":0,"(anonymous 6):365":0,"loop:364":0,"_forSomeCfgNode:362":0,"getAttrs:430":0,"(anonymous 7):454":0,"_getHTML:426":0,"_slideTo:486":0,"(anonymous 8):506":0,"forEachChild:500":0,"_expandedGetter:524":0,"_expandedSetter:536":0,"_loadDynamic:564":0,"_dynamicLoadReturn:576":0,"(anonymous 9):603":0,"_renderChildren:598":0,"hold:614":0,"release:624":0,"getParent:636":0,"getNextSibling:647":0,"getPreviousSibling:663":0,"toggle:678":0,"getter:774":0,"getter:822":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredLines = 188;
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
	 * Initial values for node attributes.  
	 * Contains default values for each node type, indexed by node type and attribute name.
	 * @property _initialValues
	 * @type Object
	 * @private
	 */
	_initialValues: null,
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadConfig", 131);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 132);
var self = this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 133);
self._tree = {
			children: Y.clone(tree)
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 136);
self._initNodes(this._tree);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 137);
if (self._domEvents) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 138);
Y.Array.each(self._domEvents, function (event) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 2)", 138);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 139);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_initNodes", 148);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 149);
var self = this, 
			fwNode,
			type,
			defaultValues,
			name,
			value;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 155);
Y.Array.each(parent.children, function (child) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 3)", 155);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 156);
type = child.type || DEFAULT_POOL;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 157);
defaultValues = self._initialValues[type];
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 158);
if (!defaultValues) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 159);
defaultValues = {type:child.type};
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 160);
fwNode = self._poolFetch(defaultValues);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 161);
for (name in fwNode._attrs) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 162);
if (fwNode._attrs.hasOwnProperty(name) && ['initialized','destroyed'].indexOf(name) === -1) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 163);
value = fwNode._state.get(name,'value');
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 164);
if (value !== undefined) {
							_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 165);
defaultValues[name] =  value;
							_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 166);
fwNode._state.remove(name,'value');
						}
					}
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 170);
self._initialValues[type] = defaultValues;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 171);
self._poolReturn(fwNode);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 173);
Y.Object.each(defaultValues, function(value, name) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 4)", 173);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 174);
if (child[name] === undefined) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 175);
child[name] = value;
				}
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 178);
child._parent = parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 179);
child.id = child.id || Y.guid();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 180);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_afterDomEvent", 191);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 192);
var node = this._poolFetchFromEvent(ev);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 193);
if (node) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 194);
node.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 195);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetch", 208);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 209);
var pool,
			fwNode = node._held,
			type = node.type || DEFAULT_POOL;
			
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 213);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 214);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 216);
if (Lang.isObject(type)) {
			// If the type of object cannot be identified, return a default type.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 218);
type = type.NAME || DEFAULT_POOL;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 220);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 221);
if (pool === undefined) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 222);
pool = this._pool[type] = [];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 224);
if (pool.length) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 225);
fwNode = pool.pop();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 226);
fwNode._slideTo(node);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 227);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 229);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolReturn", 238);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 239);
if (fwNode._node._held) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 240);
return;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 242);
var pool,
			type = fwNode._node.type || DEFAULT_POOL;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 244);
if (Lang.isObject(type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 245);
type = type.NAME;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 246);
if (!type) {
				// Don't know where to put it, drop it.
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 248);
return;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 251);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 252);
if (pool) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 253);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getNode", 266);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 267);
var newNode,
			Type = node.type || this.get('defaultType');
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 269);
if (Lang.isString(Type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 270);
Type = Y[Type];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 272);
if (Type) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 273);
newNode = new Type();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 274);
if (newNode instanceof Y.FlyweightTreeNode) {
				// I need to do this otherwise Attribute will initialize the real node with default values
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 276);
newNode._slideTo({});
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 277);
newNode.getAttrs();
				// That's it (see above)
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 279);
newNode._root =  this;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 280);
newNode._slideTo(node);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 281);
return newNode;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 284);
return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method _getRootNode
	 * @return {Y.FlyweightTreeNode} 
	 * @protected
	 */
	_getRootNode: function () {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getRootNode", 292);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 293);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 302);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 303);
var s = '',
			root = this._getRootNode();
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 305);
root.forEachChild( function (fwNode, index, array) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 5)", 305);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 306);
s += fwNode._getHTML(index, array.length, 0);
		});
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 308);
this._poolReturn(root);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 309);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_findNodeByElement", 318);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 319);
var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (node) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "scan", 321);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 322);
if (node.id === id) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 323);
found = node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 324);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 326);
if (node.children) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 327);
return Y.Array.some(node.children, scan);
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 329);
return false;
			};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 331);
if (scan(this._tree)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 332);
return found;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 334);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetchFromEvent", 343);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 344);
var found = this._findNodeByElement(ev.domEvent.target);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 345);
if (found) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 346);
return this._poolFetch(found);
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 348);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_forSomeCfgNode", 362);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 363);
scope = scope || this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 364);
var loop = function(cfgNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "loop", 364);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 365);
return Y.Array.some(cfgNode.children || [], function(childNode, index) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 6)", 365);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 366);
fn.call(scope, childNode,depth, index);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 367);
return loop(childNode,depth + 1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 370);
return loop(this._tree, 0);
	}
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 374);
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
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 391);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 426);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 428);
var self = this,
				// this is a patch until this:  http://yuilibrary.com/projects/yui3/ticket/2532712  gets fixed.
				getAttrs = function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getAttrs", 430);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 431);
var o = {},
					i, l, attr,

					attrs = Y.Object.keys(self._state.data);

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 436);
for (i = 0, l = attrs.length; i < l; i+=1) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 437);
attr = attrs[i];
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 438);
o[attr] = self.get(attr);
					}

					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 441);
return o;
				},
				node = this._node,
				attrs = getAttrs(),
				s = '', 
				templ = node.template || this.constructor.TEMPLATE,
				childCount = node.children && node.children.length,
				nodeClasses = [CNAME_NODE];

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 450);
node._rendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 451);
if (childCount) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 452);
if (attrs.expanded) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 453);
node._childrenRendered = true;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 454);
this.forEachChild( function (fwNode, index, array) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 7)", 454);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 455);
s += fwNode._getHTML(index, array.length, depth+1);
					});
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 457);
nodeClasses.push(CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 459);
nodeClasses.push(CNAME_COLLAPSED);
				}
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 462);
if (this._root.get('dynamicLoader') && !node.isLeaf) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 463);
nodeClasses.push(CNAME_COLLAPSED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 465);
nodeClasses.push(CNAME_NOCHILDREN);
				}
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 468);
if (index === 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 469);
nodeClasses.push(CNAME_FIRSTCHILD);
			} else {_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 470);
if (index === nSiblings - 1) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 471);
nodeClasses.push(CNAME_LASTCHILD);
			}}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 473);
attrs.children = s;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 474);
attrs.cname_node = nodeClasses.join(' ');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 475);
attrs.cname_children = CNAME_CHILDREN;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 477);
return Lang.sub(templ, attrs);

		},
		/**
		 * Method to slide this instance on top of another node in the configuration object
		 * @method _slideTo
		 * @param node {Object} node in the underlying configuration tree to slide this object on top of.
		 * @private
		 */
		_slideTo: function (node) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_slideTo", 486);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 487);
this._node = node;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 488);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forEachChild", 500);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 501);
var root = this._root,
				children = this._node.children,
				child, ret;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 504);
scope = scope || this;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 505);
if (children && children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 506);
YArray.each(children, function (node, index, array) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 8)", 506);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 507);
child = root._poolFetch(node);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 508);
ret = fn.call(scope, child, index, array);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 509);
root._poolReturn(child);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 510);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedGetter", 524);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 525);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedSetter", 536);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 537);
var self = this,
				node = self._node,
				root = self._root,
				el = Y.one('#' + node.id),
				dynLoader = root.get('dynamicLoader');
				
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 543);
node.expanded = value = !!value;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 544);
if (dynLoader && !node.isLeaf && (!node.children  || !node.children.length)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 545);
this._loadDynamic();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 546);
return;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 548);
if (node.children && node.children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 549);
if (value) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 550);
if (!node._childrenRendered) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 551);
self._renderChildren();
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 553);
el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 555);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadDynamic", 564);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 565);
var self = this,
				root = self._root;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 567);
Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 568);
root.get('dynamicLoader').call(root, self, Y.bind(self._dynamicLoadReturn, self));
			
		},
		/**
		 * Callback for the dynamicLoader method.
		 * @method _dynamicLoadReturn
		 * @param response {Array} array of child nodes 
		 */
		_dynamicLoadReturn: function (response) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoadReturn", 576);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 577);
var self = this,
				node = self._node,
				root = self._root;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 581);
if (response) {

				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 583);
node.children = response;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 584);
root._initNodes(node);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 585);
self._renderChildren();
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 587);
node.isLeaf = true;
			}
			// isLeaf might have been set in the response, not just in the line above.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 590);
Y.one('#' + node.id).replaceClass(CNAME_LOADING, (node.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));
		},
		/**
		 * Renders the children of this node.  
		 * It the children had been rendered, they will be replaced.
		 * @method _renderChildren
		 * @private
		 */
		_renderChildren: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_renderChildren", 598);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 599);
var s = '',
				node = this._node,
				depth = this.get('depth');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 602);
node._childrenRendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 603);
this.forEachChild(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 9)", 603);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 604);
s += fwNode._getHTML(index, array.length, depth + 1);
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 606);
Y.one('#' + node.id + ' .' + CNAME_CHILDREN).setContent(s);
		},
		/**
		 * Prevents this instance from being returned to the pool and reused.
		 * Remember to {{#crossLink "release"}}{{/crossLink}} this instance when no longer needed.
		 * @method hold
		 * @chainable
		 */
		hold: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "hold", 614);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 615);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "release", 624);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 625);
this._node._held = null;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 626);
this._root._poolReturn(this);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 627);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getParent", 636);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 637);
var node = this._node._parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 638);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getNextSibling", 647);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 648);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) + 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 651);
if (index === 0 || index > siblings.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 652);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 654);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getPreviousSibling", 663);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 664);
var parent = this._node._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) - 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 667);
if (index < 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 668);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 670);
return this._root._poolFetch(siblings[index]);
		},
		
		/**
		 * Sugar method to toggle the expanded state of the node.
		 * @method toggle
		 * @chainable
		 */
		toggle: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "toggle", 678);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 679);
this.set('expanded', !this.get('expanded'));
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 680);
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
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 774);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 775);
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
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 822);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 823);
var count = 0, 
						node = this._node;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 825);
while (node._parent) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 826);
count += 1;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 827);
node = node._parent;
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 829);
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
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 846);
Y.FlyweightTreeNode = FWNode;



}, '@VERSION@', {"requires": ["base-base", "base-build", "classnamemanager"], "skinnable": false});
