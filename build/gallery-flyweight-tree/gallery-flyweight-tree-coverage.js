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
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].code=["YUI.add('gallery-flyweight-tree', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	YArray = Y.Array,","","    DOT = '.',","	BYPASS_PROXY = \"_bypassProxy\",","	VALUE = 'value',","    EXPANDED = 'expanded',","    DYNAMIC_LOADER = 'dynamicLoader',","    TABINDEX = 'tabIndex',","    FOCUSED = 'focused',","","    DEFAULT_POOL = '_default',","","    getCName = Y.ClassNameManager.getClassName,","    FWNODE_NAME = 'flyweight-tree-node',","	CNAME_NODE = getCName(FWNODE_NAME),","	cName = function (name) {","		return getCName(FWNODE_NAME, name);","	},","    CNAME_CONTENT = cName('content'),","	CNAME_CHILDREN = cName('children'),","	CNAME_COLLAPSED = cName('collapsed'),","	CNAME_EXPANDED = cName(EXPANDED),","	CNAME_NOCHILDREN = cName('no-children'),","	CNAME_FIRSTCHILD = cName('first-child'),","	CNAME_LASTCHILD = cName('last-child'),","	CNAME_LOADING = cName('loading'),","","	FWMgr,","	FWNode;","","/**","* @module gallery-flyweight-tree","*","*/","","/**"," * Extension to handle its child nodes by using the flyweight pattern."," *"," * The information for the tree is stored internally in a plain object without methods,"," * events or attributes."," * This manager will position FlyweightTreeNode instances (or subclasses of it)"," * over these iNodes from a small pool of them, in order to save memory."," *"," * The nodes on this configuration tree are referred to in this documentation as `iNodes`"," * for 'internal nodes', to tell them apart from the pooled FlyweightTreeNode instances"," * that will be used to manipulate them.  The FlyweightTreeNode instances will usually"," * be declared as `fwNodes` when confusion might arise."," * If a variable or argument is not explicitly named `iNode` or a related name it is"," * FlyweightTreeNode instance."," *"," * The developer should not be concerned about the iNodes,"," * except in the initial configuration tree."," * If the developer finds anything that needs to be done through iNodes,"," * it is a bug and should be reported (thanks)."," * iNodes should be private."," *"," * @class FlyweightTreeManager"," * @constructor"," */","FWMgr = function () {","	this._pool = {};","	this._initialValues = {};","    Y.Do.after(this._doAfterRender, this, \"render\");","    this.after('focus', this._afterFocus);","};","","FWMgr.ATTRS = {","	/**","	 * Default object type of the nodes if no explicit type is given in the configuration tree.","	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.","	 *","	 * @attribute defaultType","	 * @type {String | Object}","	 * @default 'FlyweightTreeNode'","	 */","	defaultType: {","		value: 'FlyweightTreeNode'","	},","	/**","	 * Function used to load the nodes dynamically.","	 * Function will run in the scope of the FlyweightTreeManager instance and will","	 * receive:","	 *","	 * * node {FlyweightTreeNode} reference to the parent of the children to be loaded.","	 * * callback {Function} function to call with the configuration info for the children.","	 *","	 * The function shall fetch the nodes and create a configuration object","	 * much like the one a whole tree might receive.","	 * It is not limited to just one level of nodes, it might contain children elements as well.","	 * When the data is processed, it should call the callback with the configuration object.","	 * The function is responsible of handling any errors.","	 * If the the callback is called with no arguments, the parent node will be marked as having no children.","     *","     * This attribute should be set before the tree is rendered as childless nodes","     * render differently when there is a dynamic loader than when there isn't.","     * (childless nodes can be expanded when a dynamic loader is present and the UI should reflect that).","	 * @attribute dynamicLoader","	 * @type {Function or null}","	 * @default null","	 */","	dynamicLoader: {","		value: null,","        setter: '_dynamicLoaderSetter'","	},","    /**","     * Points to the node that currently has the focus.","     * If read, please make sure to release the node instance to the pool when done.","     * @attribute focusedNode","     * @type FlyweightTreeNode","     * @default First node in the tree","     */","    focusedNode: {","        getter: '_focusedNodeGetter',","        setter: '_focusedNodeSetter'","        // There is no need for validator since the setter already takes care of validation.","    }","};","","","FWMgr.prototype = {","	/**","	 * Clone of the configuration tree.","	 * The FlyweightTreeNode instances will use the iNodes (internal nodes) in this tree as the storage for their state.","	 * @property _tree","	 * @type Object","	 * @private","	 */","	_tree: null,","	/**","	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.","	 * It contains a hash of arrays indexed by the iNode (internal node) type.","	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.","	 * @property _pool","	 * @type {Object}","	 * @private","	 */","	_pool: null,","	/**","	 * List of dom events to be listened for at the outer container and fired again","	 * at the FlyweightTreeNode level once positioned over the source iNode.","	 * @property _domEvents","	 * @type Array of strings","	 * @protected","	 * @default null","	 */","	_domEvents: null,","    /**","     * Reference to the element that has the focus or should have the focus","     * when this widget is active (ie, tabbed into).","     * Mostly used for WAI-ARIA support.","     * @property _focusedINode","     * @type FlyweightTreeNode","     * @private","     * @default null","     */","    _focusedINode: null,","","	/**","	 * Method to load the configuration tree.","     * The nodes in this tree are copied into iNodes (internal nodes) for internal use.","     *","     * The constructor does not load the tree automatically so as to allow the subclass","     * of this manager","	 * to process the tree definition anyway it wants, adding defaults and such","	 * and to name the tree whatever is suitable.","	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.","	 * It also sets initial values for some default properties such as `parent` references and `id` for all iNodes.","	 * @method _loadConfig","	 * @param tree {Array} Configuration for the first level of nodes.","	 * Contains objects with the following attributes:","	 * @param tree.label {String} Text or HTML markup to be shown in the node","	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.","	 * @param [tree.children] {Array} Further definitions for the children of this node","	 * @param [tree.type=FWTreeNode] {FWTreeNode | String} Class used to create instances for this iNode.","	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.","	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing the UI for this node.","	 * @param [tree.template] {String} Template for this particular node.","	 * @protected","	 */","	_loadConfig: function (tree) {","		this._tree = {","			children: Y.clone(tree)","		};","		this._initNodes(this._tree);","","	},","	/** Initializes the iNodes configuration with default values and management info.","	 * @method _initNodes","	 * @param parentINode {Object} Parent of the iNodes to be set","	 * @private","	 */","	_initNodes: function (parentINode) {","		var self = this,","            dynLoad = !!self.get(DYNAMIC_LOADER);","		YArray.each(parentINode.children, function (iNode) {","            if (!self._focusedINode) {","                self._focusedINode = iNode;","            }","			iNode._parent = parentINode;","			iNode.id = iNode.id || Y.guid();","            if (dynLoad && !iNode.children) {","                iNode.expanded = !!iNode.isLeaf;","            } else {","                iNode.expanded = (iNode.expanded === undefined) || !!iNode.expanded;","            }","			self._initNodes(iNode);","		});","	},","    /**","     * Initializes the events for its internal use and those requested in","     * the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","     * @method _doAfterRender","     * @private","     */","    _doAfterRender: function() {","		var self = this;","		if (self._domEvents) {","			YArray.each(self._domEvents, function (event) {","				self.after(event, self._afterDomEvent, self);","			});","		}","","    },","    /**","     * Expands all the nodes of the tree.","     *","     * It will only expand existing nodes.  If there is a {{#crossLink \"dynamicLoader:attribute\"}}{{/crossLink}} configured","     * it will not expand those since that might lead to extreme situations.","     * @method expandAll","     * @chainable","     */","    expandAll: function () {","        this._forSomeINode(function(iNode) {","            if (iNode.children && !iNode.expanded) {","                this._poolReturn(this._poolFetch(iNode).set(EXPANDED, true));","            }","        });","    },","","	/** Generic event listener for DOM events listed in the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","	 *  It will locate the iNode represented by the UI elements that received the event,","     *  slide a suitable instance on it and fire the same event on that node.","	 *  @method _afterEvent","	 *  @param ev {EventFacade} Event facade as produced by the event","	 *  @private","	 */","	_afterDomEvent: function (ev) {","		var fwNode = this._poolFetchFromEvent(ev);","		if (fwNode) {","			fwNode.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});","			this._poolReturn(fwNode);","		}","	},","	/**","	 * Returns a string identifying the type of the object to handle the iNode","	 * or null if type was not a FlyweightNode instance.","	 * @method _getTypeString","	 * @param iNode {Object} Internal node in the tree configuration","	 * @return {String} type of iNode.","	 * @private","	 */","	_getTypeString: function (iNode) {","		var type = iNode.type || DEFAULT_POOL;","		if (!Lang.isString(type)) {","			if (Lang.isObject(type)) {","				type = type.NAME;","			} else {","				throw \"Node contains unknown type\";","			}","		}","		return type;","	},","	/**","	 * Pulls from the pool an instance of the type declared in the given iNode","	 * and slides it over that iNode.","	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink \"_createNode\"}}{{/crossLink}}","	 * If an instance is held (see: {{#crossLink \"FlyweightTreeNode/hold\"}}{{/crossLink}}), it will be returned instead.","	 * @method _poolFetch","	 * @param iNode {Object} reference to a iNode within the configuration tree","	 * @return {FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given iNode","	 * @protected","	 */","	_poolFetch: function(iNode) {","		var pool,","			fwNode = iNode._held,","			type = this._getTypeString(iNode);","","		if (fwNode) {","			return fwNode;","		}","		pool = this._pool[type];","		if (pool === undefined) {","			pool = this._pool[type] = [];","		}","		if (pool.length) {","			fwNode = pool.pop();","			fwNode._slideTo(iNode);","			return fwNode;","		}","		return this._createNode(iNode);","	},","	/**","	 * Returns the FlyweightTreeNode instance to the pool.","	 * Instances held (see: {{#crossLink \"FlyweightTreeNode/hold\"}}{{/crossLink}}) are never returned.","	 * @method _poolReturn","	 * @param fwNode {FlyweightTreeNode} Instance to return.","	 * @protected","	 */","	_poolReturn: function (fwNode) {","		if (fwNode._iNode._held) {","			return;","		}","		var pool,","			type = this._getTypeString(fwNode._iNode);","		pool = this._pool[type];","		if (pool) {","			pool.push(fwNode);","		}","","	},","	/**","	 * Returns a new instance of the type given in iNode or the","	 * {{#crossLink \"defaultType\"}}{{/crossLink}} if none specified","	 * and slides it on top of the iNode provided.","	 * @method _createNode","	 * @param iNode {Object} reference to a iNode within the configuration tree","	 * @return {FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode","	 * @protected","	 */","	_createNode: function (iNode) {","		var newNode,","			Type = iNode.type || this.get('defaultType');","		if (Lang.isString(Type)) {","			Type = Y[Type];","		}","		if (Type) {","			newNode = new Type();","			if (newNode instanceof Y.FlyweightTreeNode) {","				// I need to do this otherwise Attribute will initialize","				// the real iNode with default values when activating a lazyAdd attribute.","				newNode._slideTo({});","				YArray.each(Y.Object.keys(newNode._state.data), newNode._addLazyAttr, newNode);","				// newNode.getAttrs();","				// That's it (see above)","				newNode._root =  this;","				newNode._slideTo(iNode);","				return newNode;","			}","		}","		return null;","	},","	/**","	 * Returns an instance of Flyweight node positioned over the root","	 * @method getRoot","	 * @return {FlyweightTreeNode}","	 */","	getRoot: function () {","		return this._poolFetch(this._tree);","	},","	/**","	 * Returns a string with the markup for the whole tree.","	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)","	 * @method _getHTML","	 * @return {String} HTML for this widget","	 * @protected","	 */","	_getHTML: function () {","		var s = '',","			root = this.getRoot();","		root.forSomeChildren( function (fwNode, index, array) {","			s += fwNode._getHTML(index, array.length, 0);","		});","		this._poolReturn(root);","		return s;","	},","	/**","	 * Locates a iNode in the tree by the element that represents it.","	 * @method _findINodeByElement","	 * @param el {Node} Any element belonging to the tree","	 * @return {Object} iNode that produced the markup for that element or null if not found","	 * @protected","	 */","	_findINodeByElement: function(el) {","		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),","			found = null,","			scan = function (iNode) {","				if (iNode.id === id) {","					found = iNode;","					return true;","				}","				if (iNode.children) {","					return YArray.some(iNode.children, scan);","				}","				return false;","			};","		if (scan(this._tree)) {","			return found;","		}","		return null;","	},","	/**","	 * Returns a FlyweightTreeNode instance from the pool, positioned over the iNode whose markup generated some event.","	 * @method _poolFetchFromEvent","	 * @param ev {EventFacade}","	 * @return {FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.","	 * @private","	 */","	_poolFetchFromEvent: function (ev) {","		var found = this._findINodeByElement(ev.domEvent.target);","		if (found) {","			return this._poolFetch(found);","		}","		return null;","	},","	/**","	 * Traverses the whole configuration tree, calling a given function for each iNode.","	 * If the function returns true, the traversing will terminate.","	 * @method _forSomeINode","	 * @param fn {Function} Function to call on each configuration iNode","	 *		@param fn.iNode {Object} iNode in the configuration tree","	 *		@param fn.depth {Integer} depth of this iNode within the tree","	 *		@param fn.index {Integer} index of this iNode within the array of its siblings","	 * @param scope {Object} scope to run the function in, defaults to `this`.","	 * @return true if any of the function calls returned true (the traversal was terminated earlier)","	 * @protected","	 */","	_forSomeINode: function(fn, scope) {","		scope = scope || this;","		var loop = function(iNode, depth) {","			return YArray.some(iNode.children || [], function(childINode, index) {","				if (fn.call(scope, childINode,depth, index)) {","                    return true;","                }","				return loop(childINode,depth + 1);","			});","		};","		return loop(this._tree, 0);","	},","	/**","	 * Executes the given function over all the nodes in the tree or until the function returns true.","	 * If dynamic loading is enabled, it will not run over nodes not yet loaded.","	 * @method forSomeNodes","	 * @param fn {function} function to execute on each node.  It will receive:","	 *	@param fn.node {FlyweightTreeNode} node being visited.","	 *	@param fn.depth {Integer} depth from the root. The root node is level zero and it is not traversed.","	 *	@param fn.index {Integer} position of this node within its branch","	 *	@param fn.array {Array} array containing itself and its siblings","	 * @param scope {Object} Scope to run the function in.  Defaults to the FlyweightTreeManager instance.","	 * @return {Boolean} true if any function calls returned true (the traversal was interrupted)","	 */","	forSomeNodes: function (fn, scope) {","		scope = scope || this;","","		var forOneLevel = function (fwNode, depth) {","			fwNode.forSomeChildren(function (fwNode, index, array) {","				if (fn.call(scope, fwNode, depth, index, array) === true) {","					return true;","				}","				return forOneLevel(fwNode, depth+1);","			});","		};","		return forOneLevel(this.getRoot(), 1);","	},","    /**","     * Getter for the {{#crossLink \"focusedNode:attribute\"}}{{/crossLink}} attribute","     * @method _focusedNodeGetter","     * @return {FlyweightNode} Node that would have the focus if the widget is focused","     * @private","     */","    _focusedNodeGetter: function () {","        return this._poolFetch(this._focusedINode);","    },","    /**","     * Setter for the {{#crossLink \"focusedNode:attribute\"}}{{/crossLink}} attribute","     * @method _focusedNodeSetter","     * @param value {FlyweightNode} Node to receive the focus.","     * @return {Object} iNode matching the focused node.","     * @private","     */","    _focusedNodeSetter: function (value) {","        if (!value || value instanceof Y.FlyweightTreeNode) {","            var newINode = (value?value._iNode:this._tree.children[0]);","            this._focusOnINode(newINode);","            return newINode;","        } else {","            return Y.Attribute.INVALID_VALUE;","        }","    },","    /**","     * Sets the focus on the given iNode","     * @method _focusOnINode","     * @param iNode {Object} iNode to receive the focus","     * @private","     */","    _focusOnINode: function (iNode) {","        var prevINode = this._focusedINode,","            el;","","        if (iNode && iNode !== prevINode) {","","            el = Y.one('#' + prevINode.id + ' .' + CNAME_CONTENT);","            el.blur();","            el.set(TABINDEX, -1);","","            el = Y.one('#' + iNode.id + ' .' + CNAME_CONTENT);","            el.focus();","            el.set(TABINDEX,0);","","            this._focusedINode = iNode;","        }","","    },","    /**","     * Setter for the {{#crossLink \"dynamicLoader:attribute\"}}{{/crossLink}} attribute.","     * It changes the expanded attribute to false on childless iNodes not marked with `isLeaf","     * since they can now be expanded.","     * @method","     * @param value {Function | null } Function to handle the loading of nodes on demand","     * @return {Function | null | INVALID_VALUE} function set or rejection","     * @private","     */","    _dynamicLoaderSetter: function (value) {","        if (!Lang.isFunction(value) &&  value !== null) {","            return Y.Attribute.INVALID_VALUE;","        }","        if (value) {","            this._forSomeINode(function(iNode) {","                if (!iNode.children) {","                    iNode.expanded = !!iNode.isLeaf;","                }","            });","        }","        return value;","    }","};","","Y.FlyweightTreeManager = FWMgr;","/**","* An implementation of the flyweight pattern.","* This object can be slid on top of a literal object containing the definition","* of a tree and will take its state from that iNode it is slid upon.","* It relies for most of its functionality on the flyweight manager object,","* which contains most of the code.","* @module gallery-flyweight-tree","*/","","/**","* An implementation of the flyweight pattern.  This class should not be instantiated directly.","* Instances of this class can be requested from the flyweight manager class","* @class FlyweightTreeNode","* @extends Base","* @constructor  Do not instantiate directly.","*/","FWNode = Y.Base.create(","	FWNODE_NAME,","	Y.Base,","	[],","	{","		/**","		 * Reference to the iNode in the configuration tree it has been slid over.","		 * @property _iNode","		 * @type {Object}","		 * @private","		 **/","		_iNode:null,","		/**","		 * Reference to the FlyweightTreeManager instance this node belongs to.","		 * It is set by the root and should be considered read-only.","		 * @property _root","		 * @type FlyweightTreeManager","		 * @private","		 */","		_root: null,","		/**","		 * Returns a string with the markup for this node along that of its children","		 * produced from its attributes rendered","		 * via the first template string it finds in these locations:","		 *","		 * * It's own {{#crossLink \"template\"}}{{/crossLink}} configuration attribute","		 * * The static {{#crossLink \"FlyweightTreeNode/TEMPLATE\"}}{{/crossLink}} class property","		 *","		 * @method _getHTML","		 * @param index {Integer} index of this node within the array of siblings","		 * @param nSiblings {Integer} number of siblings including this node","		 * @param depth {Integer} number of levels to the root","		 * @return {String} markup generated by this node","		 * @protected","		 */","		_getHTML: function(index, nSiblings, depth) {","			// assumes that if you asked for the HTML it is because you are rendering it","			var root = this._root,","                iNode = this._iNode,","				attrs = this.getAttrs(),","				s = '',","				templ = iNode.template,","				childCount = iNode.children && iNode.children.length,","				nodeClasses = [CNAME_NODE],","				superConstructor = this.constructor;","","			while (!templ) {","				templ = superConstructor.TEMPLATE;","				superConstructor = superConstructor.superclass.constructor;","","			}","","			iNode._rendered = true;","			if (childCount) {","				if (attrs.expanded) {","					iNode._childrenRendered = true;","					this.forSomeChildren( function (fwNode, index, array) {","						s += fwNode._getHTML(index, array.length, depth + 1);","					});","					nodeClasses.push(CNAME_EXPANDED);","				} else {","					nodeClasses.push(CNAME_COLLAPSED);","				}","			} else {","				if (this._root.get(DYNAMIC_LOADER) && !iNode.isLeaf) {","					nodeClasses.push(CNAME_COLLAPSED);","				} else {","					nodeClasses.push(CNAME_NOCHILDREN);","				}","			}","			if (index === 0) {","				nodeClasses.push(CNAME_FIRSTCHILD);","			}","			if (index === nSiblings - 1) {","				nodeClasses.push(CNAME_LASTCHILD);","			}","			attrs.children = s;","			attrs.cname_node = nodeClasses.join(' ');","			attrs.cname_content = CNAME_CONTENT;","			attrs.cname_children = CNAME_CHILDREN;","            attrs.tabIndex = (iNode === root._focusedINode)?0:-1;","","			return Lang.sub(templ, attrs);","","		},","		/**","		 * Method to slide this instance on top of another iNode in the configuration object","		 * @method _slideTo","		 * @param iNode {Object} iNode in the underlying configuration tree to slide this object on top of.","		 * @private","		 */","		_slideTo: function (iNode) {","			this._iNode = iNode;","			this._stateProxy = iNode;","		},","		/**","		 * Executes the given function on each of the child nodes of this node.","		 * @method forSomeChildren","		 * @param fn {Function} Function to be executed on each node","		 *		@param fn.child {FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode,","		 *		positioned on top of the child node","		 *		@param fn.index {Integer} Index of this child within the array of children","		 *		@param fn.array {Array} array containing itself and its siblings","		 * @param scope {object} The falue of this for the function.  Defaults to the parent.","		**/","		forSomeChildren: function(fn, scope) {","			var root = this._root,","				children = this._iNode.children,","				child, ret;","			scope = scope || this;","			if (children && children.length) {","				YArray.some(children, function (iNode, index, array) {","					child = root._poolFetch(iNode);","					ret = fn.call(scope, child, index, array);","					root._poolReturn(child);","					return ret;","				});","			}","		},","		/**","		 * Getter for the expanded configuration attribute.","		 * It is meant to be overriden by the developer.","		 * The supplied version defaults to true if the expanded property","		 * is not set in the underlying configuration tree.","		 * It can be overriden to default to false.","		 * @method _expandedGetter","		 * @return {Boolean} The expanded state of the node.","		 * @protected","		 */","		_expandedGetter: function () {","			return this._iNode.expanded !== false;","		},","		/**","		 * Setter for the expanded configuration attribute.","		 * It renders the child nodes if this branch has never been expanded.","		 * Then sets the className on the node to the static constants","		 * CNAME_COLLAPSED or CNAME_EXPANDED from Y.FlyweightTreeManager","		 * @method _expandedSetter","		 * @param value {Boolean} new value for the expanded attribute","		 * @private","		 */","		_expandedSetter: function (value) {","			var self = this,","				iNode = self._iNode,","				root = self._root,","				el = Y.one('#' + iNode.id),","				dynLoader = root.get(DYNAMIC_LOADER);","","			iNode.expanded = value = !!value;","			if (dynLoader && !iNode.isLeaf && (!iNode.children  || !iNode.children.length)) {","				this._loadDynamic();","				return;","			}","			if (iNode.children && iNode.children.length) {","				if (value) {","					if (!iNode._childrenRendered) {","						self._renderChildren();","					}","					el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);","				} else {","					el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);","				}","			}","            el.set('aria-expanded', String(value));","		},","		/**","		 * Triggers the dynamic loading of children for this node.","		 * @method _loadDynamic","		 * @private","		 */","		_loadDynamic: function () {","			var self = this,","				root = self._root;","			Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);","			root.get(DYNAMIC_LOADER).call(root, self, Y.bind(self._dynamicLoadReturn, self));","","		},","		/**","		 * Callback for the dynamicLoader method.","		 * @method _dynamicLoadReturn","		 * @param response {Array} array of child iNodes","		 * @private","		 */","		_dynamicLoadReturn: function (response) {","			var self = this,","				iNode = self._iNode,","				root = self._root;","","			if (response) {","","				iNode.children = response;","				root._initNodes(iNode);","				self._renderChildren();","			} else {","				iNode.isLeaf = true;","			}","			// isLeaf might have been set in the response, not just in the line above.","			Y.one('#' + iNode.id).replaceClass(CNAME_LOADING, (iNode.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));","		},","		/**","		 * Renders the children of this node.","		 * It the children had been rendered, they will be replaced.","		 * @method _renderChildren","		 * @private","		 */","		_renderChildren: function () {","			var s = '',","				iNode = this._iNode,","				depth = this.get('depth');","			iNode._childrenRendered = true;","			this.forSomeChildren(function (fwNode, index, array) {","				s += fwNode._getHTML(index, array.length, depth + 1);","			});","			Y.one('#' + iNode.id + ' .' + CNAME_CHILDREN).setContent(s);","		},","		/**","		 * Prevents this instance from being returned to the pool and reused.","		 * Remember to {{#crossLink \"release\"}}{{/crossLink}} this instance when no longer needed.","		 * @method hold","		 * @chainable","		 */","		hold: function () {","			return (this._iNode._held = this);","		},","		/**","		 * Allows this instance to be returned to the pool and reused.","		 *","		 * __Important__: This instance should not be used after being released","		 * @method release","		 * @chainable","		 */","		release: function () {","			this._iNode._held = null;","			this._root._poolReturn(this);","			return this;","		},","		/**","		 * Returns the parent node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getParent","		 * @return FlyweightTreeNode","		 */","		getParent: function() {","			var iNode = this._iNode._parent;","			return (iNode?this._root._poolFetch(iNode):null);","		},","		/**","		 * Returns the next sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getNextSibling","		 * @return FlyweightTreeNode","		 */","		getNextSibling: function() {","			var parent = this._iNode._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) + 1;","			if (index === 0 || index > siblings.length) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		/**","		 * Returns the previous sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getPreviousSibling","		 * @return FlyweightTreeNode","		 */","		getPreviousSibling: function() {","			var parent = this._iNode._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) - 1;","			if (index < 0) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","        /**","         * Sets the focus to this node.","         * @method focus","         * @chainable","         */","        focus: function() {","            return this._root.set(FOCUSED, this);","        },","        /**","         * Removes the focus from this node","         * @method blur","         * @chainable","         */","        blur: function () {","            return this._root.set(FOCUSED, null);","        },","		/**","		 * Sugar method to toggle the expanded state of the node.","		 * @method toggle","		 * @chainable","		 */","		toggle: function() {","			return this.set(EXPANDED, !this.get(EXPANDED));","		},","        /**","         * Sugar method to expand a node","         * @method expand","         * @chainable","         */","        expand: function() {","            return this.set(EXPANDED, true);","        },","        /**","         * Sugar method to collapse this node","         * @method collapse","         * @chainable","         */","        collapse: function() {","            return this.set(EXPANDED, false);","        },","		/**","		 * Returns true if this node is the root node","		 * @method isRoot","		 * @return {Boolean} true if root node","		 */","		isRoot: function() {","			return this._root._tree === this._iNode;","		},","		/**","		* Gets the stored value for the attribute, from either the","		* internal state object, or the state proxy if it exits","		*","		* @method _getStateVal","		* @private","		* @param {String} name The name of the attribute","		* @return {Any} The stored value of the attribute","		*/","		_getStateVal : function(name) {","			var iNode = this._iNode;","			if (this._state.get(name, BYPASS_PROXY) || !iNode) {","				return this._state.get(name, VALUE);","			}","			if (iNode.hasOwnProperty(name)) {","				return iNode[name];","			}","			return this._state.get(name, VALUE);","		},","","		/**","		* Sets the stored value for the attribute, in either the","		* internal state object, or the state proxy if it exits","		*","		* @method _setStateVal","		* @private","		* @param {String} name The name of the attribute","		* @param {Any} value The value of the attribute","		*/","		_setStateVal : function(name, value) {","			var iNode = this._iNode;","			if (this._state.get(name, BYPASS_PROXY) || this._state.get(name, 'initializing') || !iNode) {","				this._state.add(name, VALUE, value);","			} else {","				iNode[name] = value;","			}","		}","	},","	{","		/**","		 * Template string to be used to render this node.","		 * It should be overriden by the subclass.","		 *","		 * It contains the HTML markup for this node plus placeholders,","		 * enclosed in curly braces, that have access to any of the","		 * configuration attributes of this node plus several predefined placeholders.","         *","         * It must contain at least three elements identified by their classNames:","","         +----------------------------+","         | {cname_node}               |","         | +------------------------+ |","         | | {cname_content}        | |","         | +------------------------+ |","         |                            |","         | +------------------------+ |","         | | {cname_children}       | |","         | +------------------------+ |","         +----------------------------+","","         * For example:","","         '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\">' +","               '<div tabIndex=\"{tabIndex}\" class=\"{cname_content}\">{label}</div>' +","               '<div class=\"{cname_children}\" role=\"group\">{children}</div>' +","         '</div>'","","         * The outermost container identified by the className `{cname_node}`","         * must also use the `{id}` placeholder to set the `id` of the node.","         * It should also have the proper ARIA role assigned and the","         * `aria-expanded` set to the `{expanded}` placeholder.","         *","         * It must contain two further elements:","         *","         * * A container for the contents of this node, identified by the className","         *   `{cname_content}` which should contain everything the user would associate","         *   with this node, such as the label and other status indicators","         *   such as toggle and selection indicators.","         *   This is the element that would receive the focus of the node, thus,","         *   it must have a `{tabIndex}` placeholder to receive the appropriate","         *   value for the `tabIndex` attribute.","         *","         * * The other element is the container for the children of this node.","         *   It will be identified by the className `{cname_children}` and it","         *   should enclose the placeholder `{children}`.","         *","		 * @property TEMPLATE","		 * @type {String}","		 * @default '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\"><div tabIndex=\"{tabIndex}\"","         class=\"{cname_content}\">{label}</div><div class=\"{cname_children}\" role=\"group\">{children}</div></div>'","		 * @static","		 */","		TEMPLATE: '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\">' +","                        '<div tabIndex=\"{tabIndex}\" class=\"{cname_content}\">{label}</div>' +","                        '<div class=\"{cname_children}\" role=\"group\">{children}</div>' +","                   '</div>',","		/**","		 * CCS className constant to use as the class name for the DOM element representing the node.","		 * @property CNAME_NODE","		 * @type String","		 * @static","		 */","		CNAME_NODE: CNAME_NODE,","		/**","		 * CCS className constant to use as the class name for the DOM element that will contain the label and/or status of this node.","		 * @property CNAME_CONTENT","		 * @type String","		 * @static","		 */","		CNAME_CONTENT: CNAME_CONTENT,","		/**","		 * CCS className constant to use as the class name for the DOM element that will contain the children of this node.","		 * @property CNAME_CHILDREN","		 * @type String","		 * @static","		 */","		CNAME_CHILDREN: CNAME_CHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when its state is not expanded.","		 * @property CNAME_COLLAPSED","		 * @type String","		 * @static","		 */","		CNAME_COLLAPSED: CNAME_COLLAPSED,","		/**","		 * CCS className constant added to the DOM element for this node when its state is expanded.","		 * @property CNAME_EXPANDED","		 * @type String","		 * @static","		 */","		CNAME_EXPANDED: CNAME_EXPANDED,","		/**","		 * CCS className constant added to the DOM element for this node when it has no children.","		 * @property CNAME_NOCHILDREN","		 * @type String","		 * @static","		 */","		CNAME_NOCHILDREN: CNAME_NOCHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when it is the first in the group.","		 * @property CNAME_FIRSTCHILD","		 * @type String","		 * @static","		 */","		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when it is the last in the group.","		 * @property CNAME_LASTCHILD","		 * @type String","		 * @static","		 */","		CNAME_LASTCHILD: CNAME_LASTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when dynamically loading its children.","		 * @property CNAME_LOADING","		 * @type String","		 * @static","		 */","		CNAME_LOADING: CNAME_LOADING,","		ATTRS: {","			/**","			 * Reference to the FlyweightTreeManager this node belongs to","			 * @attribute root","			 * @type {FlyweightTreeManager}","			 * @readOnly","			 *","			 */","","			root: {","				_bypassProxy: true,","				readOnly: true,","				getter: function() {","					return this._root;","				}","			},","","			/**","			 * Template to use on this particular instance.","			 * The renderer will default to the static TEMPLATE property of this class","			 * (the preferred way) or the nodeTemplate configuration attribute of the root.","			 * See the TEMPLATE static property.","			 * @attribute template","			 * @type {String}","			 * @default undefined","			 */","			template: {","				validator: Lang.isString","			},","			/**","			 * Label for this node. Nodes usually have some textual content, this is the place for it.","			 * @attribute label","			 * @type {String}","			 * @default ''","			 */","			label: {","				validator: Lang.isString,","				value: ''","			},","			/**","			 * Id to assign to the DOM element that contains this node.","			 * If none was supplied, it will generate one","			 * @attribute id","			 * @type {Identifier}","			 * @default guid()","			 * @readOnly","			 */","			id: {","				readOnly: true","			},","			/**","			 * Returns the depth of this node from the root.","			 * This is calculated on-the-fly.","			 * @attribute depth","			 * @type Integer","			 * @readOnly","			 */","			depth: {","				_bypassProxy: true,","				readOnly: true,","				getter: function () {","					var count = 0,","						iNode = this._iNode;","					while (iNode._parent) {","						count += 1;","						iNode = iNode._parent;","					}","					return count-1;","				}","			},","			/**","			 * Expanded state of this node.","			 * @attribute expanded","			 * @type Boolean","			 * @default true","			 */","			expanded: {","				_bypassProxy: true,","				getter: '_expandedGetter',","				setter: '_expandedSetter'","			}","		}","	}",");","Y.FlyweightTreeNode = FWNode;","","","","}, '@VERSION@', {\"requires\": [\"base-base\", \"base-build\", \"classnamemanager\", \"event-focus\"], \"skinnable\": false});"];
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].lines = {"1":0,"3":0,"5":0,"22":0,"65":0,"66":0,"67":0,"68":0,"69":0,"72":0,"125":0,"186":0,"189":0,"198":0,"200":0,"201":0,"202":0,"204":0,"205":0,"206":0,"207":0,"209":0,"211":0,"221":0,"222":0,"223":0,"224":0,"238":0,"239":0,"240":0,"253":0,"254":0,"255":0,"256":0,"268":0,"269":0,"270":0,"271":0,"273":0,"276":0,"289":0,"293":0,"294":0,"296":0,"297":0,"298":0,"300":0,"301":0,"302":0,"303":0,"305":0,"315":0,"316":0,"318":0,"320":0,"321":0,"322":0,"336":0,"338":0,"339":0,"341":0,"342":0,"343":0,"346":0,"347":0,"350":0,"351":0,"352":0,"355":0,"363":0,"373":0,"375":0,"376":0,"378":0,"379":0,"389":0,"392":0,"393":0,"394":0,"396":0,"397":0,"399":0,"401":0,"402":0,"404":0,"414":0,"415":0,"416":0,"418":0,"433":0,"434":0,"435":0,"436":0,"437":0,"439":0,"442":0,"457":0,"459":0,"460":0,"461":0,"462":0,"464":0,"467":0,"476":0,"486":0,"487":0,"488":0,"489":0,"491":0,"501":0,"504":0,"506":0,"507":0,"508":0,"510":0,"511":0,"512":0,"514":0,"528":0,"529":0,"531":0,"532":0,"533":0,"534":0,"538":0,"542":0,"559":0,"596":0,"605":0,"606":0,"607":0,"611":0,"612":0,"613":0,"614":0,"615":0,"616":0,"618":0,"620":0,"623":0,"624":0,"626":0,"629":0,"630":0,"632":0,"633":0,"635":0,"636":0,"637":0,"638":0,"639":0,"641":0,"651":0,"652":0,"665":0,"668":0,"669":0,"670":0,"671":0,"672":0,"673":0,"674":0,"689":0,"701":0,"707":0,"708":0,"709":0,"710":0,"712":0,"713":0,"714":0,"715":0,"717":0,"719":0,"722":0,"730":0,"732":0,"733":0,"743":0,"747":0,"749":0,"750":0,"751":0,"753":0,"756":0,"765":0,"768":0,"769":0,"770":0,"772":0,"781":0,"791":0,"792":0,"793":0,"803":0,"804":0,"814":0,"817":0,"818":0,"820":0,"830":0,"833":0,"834":0,"836":0,"844":0,"852":0,"860":0,"868":0,"876":0,"884":0,"896":0,"897":0,"898":0,"900":0,"901":0,"903":0,"916":0,"917":0,"918":0,"920":0,"1058":0,"1106":0,"1108":0,"1109":0,"1110":0,"1112":0,"1129":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].functions = {"cName:21":0,"FWMgr:65":0,"_loadConfig:185":0,"(anonymous 2):200":0,"_initNodes:197":0,"(anonymous 3):223":0,"_doAfterRender:220":0,"(anonymous 4):238":0,"expandAll:237":0,"_afterDomEvent:252":0,"_getTypeString:267":0,"_poolFetch:288":0,"_poolReturn:314":0,"_createNode:335":0,"getRoot:362":0,"(anonymous 5):375":0,"_getHTML:372":0,"scan:391":0,"_findINodeByElement:388":0,"_poolFetchFromEvent:413":0,"(anonymous 6):435":0,"loop:434":0,"_forSomeINode:432":0,"(anonymous 7):460":0,"forOneLevel:459":0,"forSomeNodes:456":0,"_focusedNodeGetter:475":0,"_focusedNodeSetter:485":0,"_focusOnINode:500":0,"(anonymous 8):532":0,"_dynamicLoaderSetter:527":0,"(anonymous 9):615":0,"_getHTML:594":0,"_slideTo:650":0,"(anonymous 10):670":0,"forSomeChildren:664":0,"_expandedGetter:688":0,"_expandedSetter:700":0,"_loadDynamic:729":0,"_dynamicLoadReturn:742":0,"(anonymous 11):769":0,"_renderChildren:764":0,"hold:780":0,"release:790":0,"getParent:802":0,"getNextSibling:813":0,"getPreviousSibling:829":0,"focus:843":0,"blur:851":0,"toggle:859":0,"expand:867":0,"collapse:875":0,"isRoot:883":0,"_getStateVal:895":0,"_setStateVal:915":0,"getter:1057":0,"getter:1105":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredLines = 227;
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredFunctions = 58;
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1);
YUI.add('gallery-flyweight-tree', function (Y, NAME) {

_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 3);
'use strict';
/*jslint white: true */
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 5);
var Lang = Y.Lang,
	YArray = Y.Array,

    DOT = '.',
	BYPASS_PROXY = "_bypassProxy",
	VALUE = 'value',
    EXPANDED = 'expanded',
    DYNAMIC_LOADER = 'dynamicLoader',
    TABINDEX = 'tabIndex',
    FOCUSED = 'focused',

    DEFAULT_POOL = '_default',

    getCName = Y.ClassNameManager.getClassName,
    FWNODE_NAME = 'flyweight-tree-node',
	CNAME_NODE = getCName(FWNODE_NAME),
	cName = function (name) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "cName", 21);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 22);
return getCName(FWNODE_NAME, name);
	},
    CNAME_CONTENT = cName('content'),
	CNAME_CHILDREN = cName('children'),
	CNAME_COLLAPSED = cName('collapsed'),
	CNAME_EXPANDED = cName(EXPANDED),
	CNAME_NOCHILDREN = cName('no-children'),
	CNAME_FIRSTCHILD = cName('first-child'),
	CNAME_LASTCHILD = cName('last-child'),
	CNAME_LOADING = cName('loading'),

	FWMgr,
	FWNode;

/**
* @module gallery-flyweight-tree
*
*/

/**
 * Extension to handle its child nodes by using the flyweight pattern.
 *
 * The information for the tree is stored internally in a plain object without methods,
 * events or attributes.
 * This manager will position FlyweightTreeNode instances (or subclasses of it)
 * over these iNodes from a small pool of them, in order to save memory.
 *
 * The nodes on this configuration tree are referred to in this documentation as `iNodes`
 * for 'internal nodes', to tell them apart from the pooled FlyweightTreeNode instances
 * that will be used to manipulate them.  The FlyweightTreeNode instances will usually
 * be declared as `fwNodes` when confusion might arise.
 * If a variable or argument is not explicitly named `iNode` or a related name it is
 * FlyweightTreeNode instance.
 *
 * The developer should not be concerned about the iNodes,
 * except in the initial configuration tree.
 * If the developer finds anything that needs to be done through iNodes,
 * it is a bug and should be reported (thanks).
 * iNodes should be private.
 *
 * @class FlyweightTreeManager
 * @constructor
 */
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 65);
FWMgr = function () {
	_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "FWMgr", 65);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 66);
this._pool = {};
	_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 67);
this._initialValues = {};
    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 68);
Y.Do.after(this._doAfterRender, this, "render");
    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 69);
this.after('focus', this._afterFocus);
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 72);
FWMgr.ATTRS = {
	/**
	 * Default object type of the nodes if no explicit type is given in the configuration tree.
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
	 * * node {FlyweightTreeNode} reference to the parent of the children to be loaded.
	 * * callback {Function} function to call with the configuration info for the children.
	 *
	 * The function shall fetch the nodes and create a configuration object
	 * much like the one a whole tree might receive.
	 * It is not limited to just one level of nodes, it might contain children elements as well.
	 * When the data is processed, it should call the callback with the configuration object.
	 * The function is responsible of handling any errors.
	 * If the the callback is called with no arguments, the parent node will be marked as having no children.
     *
     * This attribute should be set before the tree is rendered as childless nodes
     * render differently when there is a dynamic loader than when there isn't.
     * (childless nodes can be expanded when a dynamic loader is present and the UI should reflect that).
	 * @attribute dynamicLoader
	 * @type {Function or null}
	 * @default null
	 */
	dynamicLoader: {
		value: null,
        setter: '_dynamicLoaderSetter'
	},
    /**
     * Points to the node that currently has the focus.
     * If read, please make sure to release the node instance to the pool when done.
     * @attribute focusedNode
     * @type FlyweightTreeNode
     * @default First node in the tree
     */
    focusedNode: {
        getter: '_focusedNodeGetter',
        setter: '_focusedNodeSetter'
        // There is no need for validator since the setter already takes care of validation.
    }
};


_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 125);
FWMgr.prototype = {
	/**
	 * Clone of the configuration tree.
	 * The FlyweightTreeNode instances will use the iNodes (internal nodes) in this tree as the storage for their state.
	 * @property _tree
	 * @type Object
	 * @private
	 */
	_tree: null,
	/**
	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.
	 * It contains a hash of arrays indexed by the iNode (internal node) type.
	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.
	 * @property _pool
	 * @type {Object}
	 * @private
	 */
	_pool: null,
	/**
	 * List of dom events to be listened for at the outer container and fired again
	 * at the FlyweightTreeNode level once positioned over the source iNode.
	 * @property _domEvents
	 * @type Array of strings
	 * @protected
	 * @default null
	 */
	_domEvents: null,
    /**
     * Reference to the element that has the focus or should have the focus
     * when this widget is active (ie, tabbed into).
     * Mostly used for WAI-ARIA support.
     * @property _focusedINode
     * @type FlyweightTreeNode
     * @private
     * @default null
     */
    _focusedINode: null,

	/**
	 * Method to load the configuration tree.
     * The nodes in this tree are copied into iNodes (internal nodes) for internal use.
     *
     * The constructor does not load the tree automatically so as to allow the subclass
     * of this manager
	 * to process the tree definition anyway it wants, adding defaults and such
	 * and to name the tree whatever is suitable.
	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.
	 * It also sets initial values for some default properties such as `parent` references and `id` for all iNodes.
	 * @method _loadConfig
	 * @param tree {Array} Configuration for the first level of nodes.
	 * Contains objects with the following attributes:
	 * @param tree.label {String} Text or HTML markup to be shown in the node
	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.
	 * @param [tree.children] {Array} Further definitions for the children of this node
	 * @param [tree.type=FWTreeNode] {FWTreeNode | String} Class used to create instances for this iNode.
	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.
	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing the UI for this node.
	 * @param [tree.template] {String} Template for this particular node.
	 * @protected
	 */
	_loadConfig: function (tree) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadConfig", 185);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 186);
this._tree = {
			children: Y.clone(tree)
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 189);
this._initNodes(this._tree);

	},
	/** Initializes the iNodes configuration with default values and management info.
	 * @method _initNodes
	 * @param parentINode {Object} Parent of the iNodes to be set
	 * @private
	 */
	_initNodes: function (parentINode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_initNodes", 197);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 198);
var self = this,
            dynLoad = !!self.get(DYNAMIC_LOADER);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 200);
YArray.each(parentINode.children, function (iNode) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 2)", 200);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 201);
if (!self._focusedINode) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 202);
self._focusedINode = iNode;
            }
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 204);
iNode._parent = parentINode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 205);
iNode.id = iNode.id || Y.guid();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 206);
if (dynLoad && !iNode.children) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 207);
iNode.expanded = !!iNode.isLeaf;
            } else {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 209);
iNode.expanded = (iNode.expanded === undefined) || !!iNode.expanded;
            }
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 211);
self._initNodes(iNode);
		});
	},
    /**
     * Initializes the events for its internal use and those requested in
     * the {{#crossLink "_domEvents"}}{{/crossLink}} array.
     * @method _doAfterRender
     * @private
     */
    _doAfterRender: function() {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_doAfterRender", 220);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 221);
var self = this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 222);
if (self._domEvents) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 223);
YArray.each(self._domEvents, function (event) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 3)", 223);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 224);
self.after(event, self._afterDomEvent, self);
			});
		}

    },
    /**
     * Expands all the nodes of the tree.
     *
     * It will only expand existing nodes.  If there is a {{#crossLink "dynamicLoader:attribute"}}{{/crossLink}} configured
     * it will not expand those since that might lead to extreme situations.
     * @method expandAll
     * @chainable
     */
    expandAll: function () {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "expandAll", 237);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 238);
this._forSomeINode(function(iNode) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 4)", 238);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 239);
if (iNode.children && !iNode.expanded) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 240);
this._poolReturn(this._poolFetch(iNode).set(EXPANDED, true));
            }
        });
    },

	/** Generic event listener for DOM events listed in the {{#crossLink "_domEvents"}}{{/crossLink}} array.
	 *  It will locate the iNode represented by the UI elements that received the event,
     *  slide a suitable instance on it and fire the same event on that node.
	 *  @method _afterEvent
	 *  @param ev {EventFacade} Event facade as produced by the event
	 *  @private
	 */
	_afterDomEvent: function (ev) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_afterDomEvent", 252);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 253);
var fwNode = this._poolFetchFromEvent(ev);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 254);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 255);
fwNode.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 256);
this._poolReturn(fwNode);
		}
	},
	/**
	 * Returns a string identifying the type of the object to handle the iNode
	 * or null if type was not a FlyweightNode instance.
	 * @method _getTypeString
	 * @param iNode {Object} Internal node in the tree configuration
	 * @return {String} type of iNode.
	 * @private
	 */
	_getTypeString: function (iNode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getTypeString", 267);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 268);
var type = iNode.type || DEFAULT_POOL;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 269);
if (!Lang.isString(type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 270);
if (Lang.isObject(type)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 271);
type = type.NAME;
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 273);
throw "Node contains unknown type";
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 276);
return type;
	},
	/**
	 * Pulls from the pool an instance of the type declared in the given iNode
	 * and slides it over that iNode.
	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink "_createNode"}}{{/crossLink}}
	 * If an instance is held (see: {{#crossLink "FlyweightTreeNode/hold"}}{{/crossLink}}), it will be returned instead.
	 * @method _poolFetch
	 * @param iNode {Object} reference to a iNode within the configuration tree
	 * @return {FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given iNode
	 * @protected
	 */
	_poolFetch: function(iNode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetch", 288);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 289);
var pool,
			fwNode = iNode._held,
			type = this._getTypeString(iNode);

		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 293);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 294);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 296);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 297);
if (pool === undefined) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 298);
pool = this._pool[type] = [];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 300);
if (pool.length) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 301);
fwNode = pool.pop();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 302);
fwNode._slideTo(iNode);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 303);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 305);
return this._createNode(iNode);
	},
	/**
	 * Returns the FlyweightTreeNode instance to the pool.
	 * Instances held (see: {{#crossLink "FlyweightTreeNode/hold"}}{{/crossLink}}) are never returned.
	 * @method _poolReturn
	 * @param fwNode {FlyweightTreeNode} Instance to return.
	 * @protected
	 */
	_poolReturn: function (fwNode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolReturn", 314);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 315);
if (fwNode._iNode._held) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 316);
return;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 318);
var pool,
			type = this._getTypeString(fwNode._iNode);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 320);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 321);
if (pool) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 322);
pool.push(fwNode);
		}

	},
	/**
	 * Returns a new instance of the type given in iNode or the
	 * {{#crossLink "defaultType"}}{{/crossLink}} if none specified
	 * and slides it on top of the iNode provided.
	 * @method _createNode
	 * @param iNode {Object} reference to a iNode within the configuration tree
	 * @return {FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode
	 * @protected
	 */
	_createNode: function (iNode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_createNode", 335);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 336);
var newNode,
			Type = iNode.type || this.get('defaultType');
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 338);
if (Lang.isString(Type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 339);
Type = Y[Type];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 341);
if (Type) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 342);
newNode = new Type();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 343);
if (newNode instanceof Y.FlyweightTreeNode) {
				// I need to do this otherwise Attribute will initialize
				// the real iNode with default values when activating a lazyAdd attribute.
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 346);
newNode._slideTo({});
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 347);
YArray.each(Y.Object.keys(newNode._state.data), newNode._addLazyAttr, newNode);
				// newNode.getAttrs();
				// That's it (see above)
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 350);
newNode._root =  this;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 351);
newNode._slideTo(iNode);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 352);
return newNode;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 355);
return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method getRoot
	 * @return {FlyweightTreeNode}
	 */
	getRoot: function () {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getRoot", 362);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 363);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 372);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 373);
var s = '',
			root = this.getRoot();
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 375);
root.forSomeChildren( function (fwNode, index, array) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 5)", 375);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 376);
s += fwNode._getHTML(index, array.length, 0);
		});
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 378);
this._poolReturn(root);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 379);
return s;
	},
	/**
	 * Locates a iNode in the tree by the element that represents it.
	 * @method _findINodeByElement
	 * @param el {Node} Any element belonging to the tree
	 * @return {Object} iNode that produced the markup for that element or null if not found
	 * @protected
	 */
	_findINodeByElement: function(el) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_findINodeByElement", 388);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 389);
var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (iNode) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "scan", 391);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 392);
if (iNode.id === id) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 393);
found = iNode;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 394);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 396);
if (iNode.children) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 397);
return YArray.some(iNode.children, scan);
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 399);
return false;
			};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 401);
if (scan(this._tree)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 402);
return found;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 404);
return null;
	},
	/**
	 * Returns a FlyweightTreeNode instance from the pool, positioned over the iNode whose markup generated some event.
	 * @method _poolFetchFromEvent
	 * @param ev {EventFacade}
	 * @return {FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.
	 * @private
	 */
	_poolFetchFromEvent: function (ev) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetchFromEvent", 413);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 414);
var found = this._findINodeByElement(ev.domEvent.target);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 415);
if (found) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 416);
return this._poolFetch(found);
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 418);
return null;
	},
	/**
	 * Traverses the whole configuration tree, calling a given function for each iNode.
	 * If the function returns true, the traversing will terminate.
	 * @method _forSomeINode
	 * @param fn {Function} Function to call on each configuration iNode
	 *		@param fn.iNode {Object} iNode in the configuration tree
	 *		@param fn.depth {Integer} depth of this iNode within the tree
	 *		@param fn.index {Integer} index of this iNode within the array of its siblings
	 * @param scope {Object} scope to run the function in, defaults to `this`.
	 * @return true if any of the function calls returned true (the traversal was terminated earlier)
	 * @protected
	 */
	_forSomeINode: function(fn, scope) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_forSomeINode", 432);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 433);
scope = scope || this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 434);
var loop = function(iNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "loop", 434);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 435);
return YArray.some(iNode.children || [], function(childINode, index) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 6)", 435);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 436);
if (fn.call(scope, childINode,depth, index)) {
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 437);
return true;
                }
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 439);
return loop(childINode,depth + 1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 442);
return loop(this._tree, 0);
	},
	/**
	 * Executes the given function over all the nodes in the tree or until the function returns true.
	 * If dynamic loading is enabled, it will not run over nodes not yet loaded.
	 * @method forSomeNodes
	 * @param fn {function} function to execute on each node.  It will receive:
	 *	@param fn.node {FlyweightTreeNode} node being visited.
	 *	@param fn.depth {Integer} depth from the root. The root node is level zero and it is not traversed.
	 *	@param fn.index {Integer} position of this node within its branch
	 *	@param fn.array {Array} array containing itself and its siblings
	 * @param scope {Object} Scope to run the function in.  Defaults to the FlyweightTreeManager instance.
	 * @return {Boolean} true if any function calls returned true (the traversal was interrupted)
	 */
	forSomeNodes: function (fn, scope) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forSomeNodes", 456);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 457);
scope = scope || this;

		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 459);
var forOneLevel = function (fwNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forOneLevel", 459);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 460);
fwNode.forSomeChildren(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 7)", 460);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 461);
if (fn.call(scope, fwNode, depth, index, array) === true) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 462);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 464);
return forOneLevel(fwNode, depth+1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 467);
return forOneLevel(this.getRoot(), 1);
	},
    /**
     * Getter for the {{#crossLink "focusedNode:attribute"}}{{/crossLink}} attribute
     * @method _focusedNodeGetter
     * @return {FlyweightNode} Node that would have the focus if the widget is focused
     * @private
     */
    _focusedNodeGetter: function () {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusedNodeGetter", 475);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 476);
return this._poolFetch(this._focusedINode);
    },
    /**
     * Setter for the {{#crossLink "focusedNode:attribute"}}{{/crossLink}} attribute
     * @method _focusedNodeSetter
     * @param value {FlyweightNode} Node to receive the focus.
     * @return {Object} iNode matching the focused node.
     * @private
     */
    _focusedNodeSetter: function (value) {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusedNodeSetter", 485);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 486);
if (!value || value instanceof Y.FlyweightTreeNode) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 487);
var newINode = (value?value._iNode:this._tree.children[0]);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 488);
this._focusOnINode(newINode);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 489);
return newINode;
        } else {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 491);
return Y.Attribute.INVALID_VALUE;
        }
    },
    /**
     * Sets the focus on the given iNode
     * @method _focusOnINode
     * @param iNode {Object} iNode to receive the focus
     * @private
     */
    _focusOnINode: function (iNode) {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusOnINode", 500);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 501);
var prevINode = this._focusedINode,
            el;

        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 504);
if (iNode && iNode !== prevINode) {

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 506);
el = Y.one('#' + prevINode.id + ' .' + CNAME_CONTENT);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 507);
el.blur();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 508);
el.set(TABINDEX, -1);

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 510);
el = Y.one('#' + iNode.id + ' .' + CNAME_CONTENT);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 511);
el.focus();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 512);
el.set(TABINDEX,0);

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 514);
this._focusedINode = iNode;
        }

    },
    /**
     * Setter for the {{#crossLink "dynamicLoader:attribute"}}{{/crossLink}} attribute.
     * It changes the expanded attribute to false on childless iNodes not marked with `isLeaf
     * since they can now be expanded.
     * @method
     * @param value {Function | null } Function to handle the loading of nodes on demand
     * @return {Function | null | INVALID_VALUE} function set or rejection
     * @private
     */
    _dynamicLoaderSetter: function (value) {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoaderSetter", 527);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 528);
if (!Lang.isFunction(value) &&  value !== null) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 529);
return Y.Attribute.INVALID_VALUE;
        }
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 531);
if (value) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 532);
this._forSomeINode(function(iNode) {
                _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 8)", 532);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 533);
if (!iNode.children) {
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 534);
iNode.expanded = !!iNode.isLeaf;
                }
            });
        }
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 538);
return value;
    }
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 542);
Y.FlyweightTreeManager = FWMgr;
/**
* An implementation of the flyweight pattern.
* This object can be slid on top of a literal object containing the definition
* of a tree and will take its state from that iNode it is slid upon.
* It relies for most of its functionality on the flyweight manager object,
* which contains most of the code.
* @module gallery-flyweight-tree
*/

/**
* An implementation of the flyweight pattern.  This class should not be instantiated directly.
* Instances of this class can be requested from the flyweight manager class
* @class FlyweightTreeNode
* @extends Base
* @constructor  Do not instantiate directly.
*/
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 559);
FWNode = Y.Base.create(
	FWNODE_NAME,
	Y.Base,
	[],
	{
		/**
		 * Reference to the iNode in the configuration tree it has been slid over.
		 * @property _iNode
		 * @type {Object}
		 * @private
		 **/
		_iNode:null,
		/**
		 * Reference to the FlyweightTreeManager instance this node belongs to.
		 * It is set by the root and should be considered read-only.
		 * @property _root
		 * @type FlyweightTreeManager
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 594);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 596);
var root = this._root,
                iNode = this._iNode,
				attrs = this.getAttrs(),
				s = '',
				templ = iNode.template,
				childCount = iNode.children && iNode.children.length,
				nodeClasses = [CNAME_NODE],
				superConstructor = this.constructor;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 605);
while (!templ) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 606);
templ = superConstructor.TEMPLATE;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 607);
superConstructor = superConstructor.superclass.constructor;

			}

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 611);
iNode._rendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 612);
if (childCount) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 613);
if (attrs.expanded) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 614);
iNode._childrenRendered = true;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 615);
this.forSomeChildren( function (fwNode, index, array) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 9)", 615);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 616);
s += fwNode._getHTML(index, array.length, depth + 1);
					});
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 618);
nodeClasses.push(CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 620);
nodeClasses.push(CNAME_COLLAPSED);
				}
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 623);
if (this._root.get(DYNAMIC_LOADER) && !iNode.isLeaf) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 624);
nodeClasses.push(CNAME_COLLAPSED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 626);
nodeClasses.push(CNAME_NOCHILDREN);
				}
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 629);
if (index === 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 630);
nodeClasses.push(CNAME_FIRSTCHILD);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 632);
if (index === nSiblings - 1) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 633);
nodeClasses.push(CNAME_LASTCHILD);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 635);
attrs.children = s;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 636);
attrs.cname_node = nodeClasses.join(' ');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 637);
attrs.cname_content = CNAME_CONTENT;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 638);
attrs.cname_children = CNAME_CHILDREN;
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 639);
attrs.tabIndex = (iNode === root._focusedINode)?0:-1;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 641);
return Lang.sub(templ, attrs);

		},
		/**
		 * Method to slide this instance on top of another iNode in the configuration object
		 * @method _slideTo
		 * @param iNode {Object} iNode in the underlying configuration tree to slide this object on top of.
		 * @private
		 */
		_slideTo: function (iNode) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_slideTo", 650);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 651);
this._iNode = iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 652);
this._stateProxy = iNode;
		},
		/**
		 * Executes the given function on each of the child nodes of this node.
		 * @method forSomeChildren
		 * @param fn {Function} Function to be executed on each node
		 *		@param fn.child {FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode,
		 *		positioned on top of the child node
		 *		@param fn.index {Integer} Index of this child within the array of children
		 *		@param fn.array {Array} array containing itself and its siblings
		 * @param scope {object} The falue of this for the function.  Defaults to the parent.
		**/
		forSomeChildren: function(fn, scope) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forSomeChildren", 664);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 665);
var root = this._root,
				children = this._iNode.children,
				child, ret;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 668);
scope = scope || this;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 669);
if (children && children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 670);
YArray.some(children, function (iNode, index, array) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 10)", 670);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 671);
child = root._poolFetch(iNode);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 672);
ret = fn.call(scope, child, index, array);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 673);
root._poolReturn(child);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 674);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedGetter", 688);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 689);
return this._iNode.expanded !== false;
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedSetter", 700);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 701);
var self = this,
				iNode = self._iNode,
				root = self._root,
				el = Y.one('#' + iNode.id),
				dynLoader = root.get(DYNAMIC_LOADER);

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 707);
iNode.expanded = value = !!value;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 708);
if (dynLoader && !iNode.isLeaf && (!iNode.children  || !iNode.children.length)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 709);
this._loadDynamic();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 710);
return;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 712);
if (iNode.children && iNode.children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 713);
if (value) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 714);
if (!iNode._childrenRendered) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 715);
self._renderChildren();
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 717);
el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 719);
el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);
				}
			}
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 722);
el.set('aria-expanded', String(value));
		},
		/**
		 * Triggers the dynamic loading of children for this node.
		 * @method _loadDynamic
		 * @private
		 */
		_loadDynamic: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadDynamic", 729);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 730);
var self = this,
				root = self._root;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 732);
Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 733);
root.get(DYNAMIC_LOADER).call(root, self, Y.bind(self._dynamicLoadReturn, self));

		},
		/**
		 * Callback for the dynamicLoader method.
		 * @method _dynamicLoadReturn
		 * @param response {Array} array of child iNodes
		 * @private
		 */
		_dynamicLoadReturn: function (response) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoadReturn", 742);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 743);
var self = this,
				iNode = self._iNode,
				root = self._root;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 747);
if (response) {

				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 749);
iNode.children = response;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 750);
root._initNodes(iNode);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 751);
self._renderChildren();
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 753);
iNode.isLeaf = true;
			}
			// isLeaf might have been set in the response, not just in the line above.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 756);
Y.one('#' + iNode.id).replaceClass(CNAME_LOADING, (iNode.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));
		},
		/**
		 * Renders the children of this node.
		 * It the children had been rendered, they will be replaced.
		 * @method _renderChildren
		 * @private
		 */
		_renderChildren: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_renderChildren", 764);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 765);
var s = '',
				iNode = this._iNode,
				depth = this.get('depth');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 768);
iNode._childrenRendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 769);
this.forSomeChildren(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 11)", 769);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 770);
s += fwNode._getHTML(index, array.length, depth + 1);
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 772);
Y.one('#' + iNode.id + ' .' + CNAME_CHILDREN).setContent(s);
		},
		/**
		 * Prevents this instance from being returned to the pool and reused.
		 * Remember to {{#crossLink "release"}}{{/crossLink}} this instance when no longer needed.
		 * @method hold
		 * @chainable
		 */
		hold: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "hold", 780);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 781);
return (this._iNode._held = this);
		},
		/**
		 * Allows this instance to be returned to the pool and reused.
		 *
		 * __Important__: This instance should not be used after being released
		 * @method release
		 * @chainable
		 */
		release: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "release", 790);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 791);
this._iNode._held = null;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 792);
this._root._poolReturn(this);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 793);
return this;
		},
		/**
		 * Returns the parent node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.
		 * Remember to release the copy to the pool when done.
		 * @method getParent
		 * @return FlyweightTreeNode
		 */
		getParent: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getParent", 802);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 803);
var iNode = this._iNode._parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 804);
return (iNode?this._root._poolFetch(iNode):null);
		},
		/**
		 * Returns the next sibling node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.
		 * Remember to release the copy to the pool when done.
		 * @method getNextSibling
		 * @return FlyweightTreeNode
		 */
		getNextSibling: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getNextSibling", 813);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 814);
var parent = this._iNode._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) + 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 817);
if (index === 0 || index > siblings.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 818);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 820);
return this._root._poolFetch(siblings[index]);
		},
		/**
		 * Returns the previous sibling node for this node or null if none exists.
		 * The copy is not on {{#crossLink "hold"}}{{/crossLink}}.
		 * Remember to release the copy to the pool when done.
		 * @method getPreviousSibling
		 * @return FlyweightTreeNode
		 */
		getPreviousSibling: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getPreviousSibling", 829);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 830);
var parent = this._iNode._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) - 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 833);
if (index < 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 834);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 836);
return this._root._poolFetch(siblings[index]);
		},
        /**
         * Sets the focus to this node.
         * @method focus
         * @chainable
         */
        focus: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "focus", 843);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 844);
return this._root.set(FOCUSED, this);
        },
        /**
         * Removes the focus from this node
         * @method blur
         * @chainable
         */
        blur: function () {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "blur", 851);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 852);
return this._root.set(FOCUSED, null);
        },
		/**
		 * Sugar method to toggle the expanded state of the node.
		 * @method toggle
		 * @chainable
		 */
		toggle: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "toggle", 859);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 860);
return this.set(EXPANDED, !this.get(EXPANDED));
		},
        /**
         * Sugar method to expand a node
         * @method expand
         * @chainable
         */
        expand: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "expand", 867);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 868);
return this.set(EXPANDED, true);
        },
        /**
         * Sugar method to collapse this node
         * @method collapse
         * @chainable
         */
        collapse: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "collapse", 875);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 876);
return this.set(EXPANDED, false);
        },
		/**
		 * Returns true if this node is the root node
		 * @method isRoot
		 * @return {Boolean} true if root node
		 */
		isRoot: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "isRoot", 883);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 884);
return this._root._tree === this._iNode;
		},
		/**
		* Gets the stored value for the attribute, from either the
		* internal state object, or the state proxy if it exits
		*
		* @method _getStateVal
		* @private
		* @param {String} name The name of the attribute
		* @return {Any} The stored value of the attribute
		*/
		_getStateVal : function(name) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getStateVal", 895);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 896);
var iNode = this._iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 897);
if (this._state.get(name, BYPASS_PROXY) || !iNode) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 898);
return this._state.get(name, VALUE);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 900);
if (iNode.hasOwnProperty(name)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 901);
return iNode[name];
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 903);
return this._state.get(name, VALUE);
		},

		/**
		* Sets the stored value for the attribute, in either the
		* internal state object, or the state proxy if it exits
		*
		* @method _setStateVal
		* @private
		* @param {String} name The name of the attribute
		* @param {Any} value The value of the attribute
		*/
		_setStateVal : function(name, value) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_setStateVal", 915);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 916);
var iNode = this._iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 917);
if (this._state.get(name, BYPASS_PROXY) || this._state.get(name, 'initializing') || !iNode) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 918);
this._state.add(name, VALUE, value);
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 920);
iNode[name] = value;
			}
		}
	},
	{
		/**
		 * Template string to be used to render this node.
		 * It should be overriden by the subclass.
		 *
		 * It contains the HTML markup for this node plus placeholders,
		 * enclosed in curly braces, that have access to any of the
		 * configuration attributes of this node plus several predefined placeholders.
         *
         * It must contain at least three elements identified by their classNames:

         +----------------------------+
         | {cname_node}               |
         | +------------------------+ |
         | | {cname_content}        | |
         | +------------------------+ |
         |                            |
         | +------------------------+ |
         | | {cname_children}       | |
         | +------------------------+ |
         +----------------------------+

         * For example:

         '<div id="{id}" class="{cname_node}" role="" aria-expanded="{expanded}">' +
               '<div tabIndex="{tabIndex}" class="{cname_content}">{label}</div>' +
               '<div class="{cname_children}" role="group">{children}</div>' +
         '</div>'

         * The outermost container identified by the className `{cname_node}`
         * must also use the `{id}` placeholder to set the `id` of the node.
         * It should also have the proper ARIA role assigned and the
         * `aria-expanded` set to the `{expanded}` placeholder.
         *
         * It must contain two further elements:
         *
         * * A container for the contents of this node, identified by the className
         *   `{cname_content}` which should contain everything the user would associate
         *   with this node, such as the label and other status indicators
         *   such as toggle and selection indicators.
         *   This is the element that would receive the focus of the node, thus,
         *   it must have a `{tabIndex}` placeholder to receive the appropriate
         *   value for the `tabIndex` attribute.
         *
         * * The other element is the container for the children of this node.
         *   It will be identified by the className `{cname_children}` and it
         *   should enclose the placeholder `{children}`.
         *
		 * @property TEMPLATE
		 * @type {String}
		 * @default '<div id="{id}" class="{cname_node}" role="" aria-expanded="{expanded}"><div tabIndex="{tabIndex}"
         class="{cname_content}">{label}</div><div class="{cname_children}" role="group">{children}</div></div>'
		 * @static
		 */
		TEMPLATE: '<div id="{id}" class="{cname_node}" role="" aria-expanded="{expanded}">' +
                        '<div tabIndex="{tabIndex}" class="{cname_content}">{label}</div>' +
                        '<div class="{cname_children}" role="group">{children}</div>' +
                   '</div>',
		/**
		 * CCS className constant to use as the class name for the DOM element representing the node.
		 * @property CNAME_NODE
		 * @type String
		 * @static
		 */
		CNAME_NODE: CNAME_NODE,
		/**
		 * CCS className constant to use as the class name for the DOM element that will contain the label and/or status of this node.
		 * @property CNAME_CONTENT
		 * @type String
		 * @static
		 */
		CNAME_CONTENT: CNAME_CONTENT,
		/**
		 * CCS className constant to use as the class name for the DOM element that will contain the children of this node.
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
			 * @type {FlyweightTreeManager}
			 * @readOnly
			 *
			 */

			root: {
				_bypassProxy: true,
				readOnly: true,
				getter: function() {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 1057);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1058);
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
			 * @default guid()
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
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 1105);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1106);
var count = 0,
						iNode = this._iNode;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1108);
while (iNode._parent) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1109);
count += 1;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1110);
iNode = iNode._parent;
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1112);
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
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1129);
Y.FlyweightTreeNode = FWNode;



}, '@VERSION@', {"requires": ["base-base", "base-build", "classnamemanager", "event-focus"], "skinnable": false});
