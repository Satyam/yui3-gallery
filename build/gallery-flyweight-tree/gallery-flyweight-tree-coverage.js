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
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].code=["YUI.add('gallery-flyweight-tree', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	YArray = Y.Array,","","    DOT = '.',","	BYPASS_PROXY = \"_bypassProxy\",","	VALUE = 'value',","    EXPANDED = 'expanded',","    DYNAMIC_LOADER = 'dynamicLoader',","    TABINDEX = 'tabIndex',","    FOCUSED = 'focused',","","    DEFAULT_POOL = '_default',","","    getCName = Y.ClassNameManager.getClassName,","    FWNODE_NAME = 'flyweight-tree-node',","	CNAME_NODE = getCName(FWNODE_NAME),","	cName = function (name) {","		return getCName(FWNODE_NAME, name);","	},","    CNAME_CONTENT = cName('content'),","	CNAME_CHILDREN = cName('children'),","	CNAME_COLLAPSED = cName('collapsed'),","	CNAME_EXPANDED = cName(EXPANDED),","	CNAME_NOCHILDREN = cName('no-children'),","	CNAME_FIRSTCHILD = cName('first-child'),","	CNAME_LASTCHILD = cName('last-child'),","	CNAME_LOADING = cName('loading'),","","	FWMgr,","	FWNode;","","/**","* @module gallery-flyweight-tree","*","*/","","/**"," * Extension to handle its child nodes by using the flyweight pattern."," *"," * The information for the tree is stored internally in a plain object without methods,"," * events or attributes."," * This manager will position FlyweightTreeNode instances (or subclasses of it)"," * over these iNodes from a small pool of them, in order to save memory."," *"," * The nodes on this configuration tree are referred to in this documentation as `iNodes`"," * for 'internal nodes', to tell them apart from the pooled FlyweightTreeNode instances"," * that will be used to manipulate them.  The FlyweightTreeNode instances will usually"," * be declared as `fwNodes` when confusion might arise."," * If a variable or argument is not explicitly named `iNode` or a related name it is"," * FlyweightTreeNode instance."," *"," * The developer should not be concerned about the iNodes,"," * except in the initial configuration tree."," * If the developer finds anything that needs to be done through iNodes,"," * it is a bug and should be reported (thanks)."," * iNodes should be private."," *"," * @class FlyweightTreeManager"," * @constructor"," */","FWMgr = function () {","	this._pool = {};","	this._initialValues = {};","    this._eventHandles = [","        Y.Do.after(this._doAfterRender, this, \"render\"),","        this.after('focus', this._afterFocus),","        this.on('destroy', this._onDestroy)","    ];","};","","FWMgr.ATTRS = {","	/**","	 * Default object type of the nodes if no explicit type is given in the configuration tree.","	 * It can be specified as an object reference, these two are equivalent: `Y.FWTreeNode` or  `'FWTreeNode'`.","	 *","	 * @attribute defaultType","	 * @type {String | Object}","	 * @default 'FlyweightTreeNode'","	 */","	defaultType: {","		value: 'FlyweightTreeNode'","	},","	/**","	 * Function used to load the nodes dynamically.","	 * Function will run in the scope of the FlyweightTreeManager instance and will","	 * receive:","	 *","	 * * node {FlyweightTreeNode} reference to the parent of the children to be loaded.","	 * * callback {Function} function to call with the configuration info for the children.","	 *","	 * The function shall fetch the nodes and create a configuration object","	 * much like the one a whole tree might receive.","	 * It is not limited to just one level of nodes, it might contain children elements as well.","	 * When the data is processed, it should call the callback with the configuration object.","	 * The function is responsible of handling any errors.","	 * If the the callback is called with no arguments, the parent node will be marked as having no children.","     *","     * This attribute should be set before the tree is rendered as childless nodes","     * render differently when there is a dynamic loader than when there isn't.","     * (childless nodes can be expanded when a dynamic loader is present and the UI should reflect that).","	 * @attribute dynamicLoader","	 * @type {Function or null}","	 * @default null","	 */","	dynamicLoader: {","		value: null,","        setter: '_dynamicLoaderSetter'","	},","    /**","     * Points to the node that currently has the focus.","     * If read, please make sure to release the node instance to the pool when done.","     * @attribute focusedNode","     * @type FlyweightTreeNode","     * @default First node in the tree","     */","    focusedNode: {","        getter: '_focusedNodeGetter',","        setter: '_focusedNodeSetter'","        // There is no need for validator since the setter already takes care of validation.","    }","};","","","FWMgr.prototype = {","	/**","	 * Clone of the configuration tree.","	 * The FlyweightTreeNode instances will use the iNodes (internal nodes) in this tree as the storage for their state.","	 * @property _tree","	 * @type Object","	 * @private","	 */","	_tree: null,","	/**","	 * Pool of FlyweightTreeNode instances to use and reuse by the manager.","	 * It contains a hash of arrays indexed by the iNode (internal node) type.","	 * Each array contains a series of FlyweightTreeNode subclasses of the corresponding type.","	 * @property _pool","	 * @type {Object}","	 * @private","	 */","	_pool: null,","	/**","	 * List of dom events to be listened for at the outer container and fired again","	 * at the FlyweightTreeNode level once positioned over the source iNode.","	 * @property _domEvents","	 * @type Array of strings","	 * @protected","	 * @default null","	 */","	_domEvents: null,","    /**","     * Reference to the element that has the focus or should have the focus","     * when this widget is active (ie, tabbed into).","     * Mostly used for WAI-ARIA support.","     * @property _focusedINode","     * @type FlyweightTreeNode","     * @private","     * @default null","     */","    _focusedINode: null,","","    /**","     * Event handles of events subscribed to, to detach them on destroy","     * @property _eventHandles","     * @type Array of EventHandles","     * @private","     */","    _eventHandles: null,","","	/**","	 * Method to load the configuration tree.","     * The nodes in this tree are copied into iNodes (internal nodes) for internal use.","     *","     * The constructor does not load the tree automatically so as to allow the subclass","     * of this manager","	 * to process the tree definition anyway it wants, adding defaults and such","	 * and to name the tree whatever is suitable.","	 * For TreeView, the configuration property is named `tree`, for a form, it is named `form`.","	 * It also sets initial values for some default properties such as `parent` references and `id` for all iNodes.","	 * @method _loadConfig","	 * @param tree {Array} Configuration for the first level of nodes.","	 * Contains objects with the following attributes:","	 * @param tree.label {String} Text or HTML markup to be shown in the node","	 * @param [tree.expanded=true] {Boolean} Whether the children of this node should be visible.","	 * @param [tree.children] {Array} Further definitions for the children of this node","	 * @param [tree.type=FWTreeNode] {FWTreeNode | String} Class used to create instances for this iNode.","	 * It can be a reference to an object or a name that can be resolved as `Y[name]`.","	 * @param [tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing the UI for this node.","	 * @param [tree.template] {String} Template for this particular node.","	 * @protected","	 */","	_loadConfig: function (tree) {","		this._tree = {","			children: Y.clone(tree)","		};","		this._initNodes(this._tree);","","	},","	/** Initializes the iNodes configuration with default values and management info.","	 * @method _initNodes","	 * @param parentINode {Object} Parent of the iNodes to be set","	 * @private","	 */","	_initNodes: function (parentINode) {","		var self = this,","            dynLoad = !!self.get(DYNAMIC_LOADER);","		YArray.each(parentINode.children, function (iNode) {","            if (!self._focusedINode) {","                self._focusedINode = iNode;","            }","			iNode._parent = parentINode;","			iNode.id = iNode.id || Y.guid();","            if (dynLoad && !iNode.children) {","                iNode.expanded = !!iNode.isLeaf;","            } else {","                iNode.expanded = (iNode.expanded === undefined) || !!iNode.expanded;","            }","			self._initNodes(iNode);","		});","	},","    /**","     * Part of the lifecycle.  Destroys the pools.","     * @method _onDestroy","     * @protected","     */","    _onDestroy: function () {","        YArray.each(this._pool, function (fwNode) {","            fwNode.destroy();","        });","        this._pool = null;","        YArray.each(this._eventHandles, function (evHandle) {","            evHandle.detach();","        });","        this._eventHandles = null;","","    },","    /**","     * Initializes the events for its internal use and those requested in","     * the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","     * @method _doAfterRender","     * @private","     */","    _doAfterRender: function() {","		var self = this;","		if (self._domEvents) {","			YArray.each(self._domEvents, function (event) {","				self._eventHandles.push(self.after(event, self._afterDomEvent, self));","			});","		}","","        // This should formally be done via two calls to Y.Do.before and Y.Do.after","        // but I think it is too heavy.","        self.fire = (function (original) {","            return function (type, ev) {","                var ret;","                if (ev && ev.domEvent) {","                    ev.node = this._poolFetchFromEvent(ev);","                    ret = original.call(this, type, ev);","                    this._poolReturn(ev.node);","                    return ret;","                }","                return original.call(this, type, ev);","            };","        })(self.fire);","","    },","    /**","     * Expands all the nodes of the tree.","     *","     * It will only expand existing nodes.  If there is a {{#crossLink \"dynamicLoader:attribute\"}}{{/crossLink}} configured","     * it will not expand those since that might lead to extreme situations.","     * @method expandAll","     * @chainable","     */","    expandAll: function () {","        this._forSomeINode(function(iNode) {","            if (iNode.children && !iNode.expanded) {","                this._poolReturn(this._poolFetch(iNode).set(EXPANDED, true));","            }","        });","    },","","	/** Generic event listener for DOM events listed in the {{#crossLink \"_domEvents\"}}{{/crossLink}} array.","	 *  It will locate the iNode represented by the UI elements that received the event,","     *  slide a suitable instance on it and fire the same event on that node.","	 *  @method _afterEvent","	 *  @param ev {EventFacade} Event facade as produced by the event","	 *  @private","	 */","    _afterDomEvent: function(ev) {","		var fwNode =  ev.node;","		if (fwNode) {","			fwNode.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});","		}","	},","	/**","	 * Returns a string identifying the type of the object to handle the iNode","	 * or null if type was not a FlyweightNode instance.","	 * @method _getTypeString","	 * @param iNode {Object} Internal node in the tree configuration","	 * @return {String} type of iNode.","	 * @private","	 */","	_getTypeString: function (iNode) {","		var type = iNode.type || DEFAULT_POOL;","		if (!Lang.isString(type)) {","			if (Lang.isObject(type)) {","				type = type.NAME;","			} else {","				throw \"Node contains unknown type\";","			}","		}","		return type;","	},","	/**","	 * Pulls from the pool an instance of the type declared in the given iNode","	 * and slides it over that iNode.","	 * If there are no instances of the given type in the pool, a new one will be created via {{#crossLink \"_createNode\"}}{{/crossLink}}","	 * If an instance is held (see: {{#crossLink \"FlyweightTreeNode/hold\"}}{{/crossLink}}), it will be returned instead.","	 * @method _poolFetch","	 * @param iNode {Object} reference to a iNode within the configuration tree","	 * @return {FlyweightTreeNode} Usually a subclass of FlyweightTreeNode positioned over the given iNode","	 * @protected","	 */","	_poolFetch: function(iNode) {","		var pool,","			fwNode = iNode._held,","			type = this._getTypeString(iNode);","","		if (fwNode) {","			return fwNode;","		}","		pool = this._pool[type];","		if (pool === undefined) {","			pool = this._pool[type] = [];","		}","		if (pool.length) {","			fwNode = pool.pop();","			fwNode._slideTo(iNode);","			return fwNode;","		}","		return this._createNode(iNode);","	},","	/**","	 * Returns the FlyweightTreeNode instance to the pool.","	 * Instances held (see: {{#crossLink \"FlyweightTreeNode/hold\"}}{{/crossLink}}) are never returned.","	 * @method _poolReturn","	 * @param fwNode {FlyweightTreeNode} Instance to return.","	 * @protected","	 */","	_poolReturn: function (fwNode) {","		if (fwNode._iNode._held) {","			return;","		}","		var pool,","			type = this._getTypeString(fwNode._iNode);","		pool = this._pool[type];","		if (pool) {","			pool.push(fwNode);","		}","","	},","	/**","	 * Returns a new instance of the type given in iNode or the","	 * {{#crossLink \"defaultType\"}}{{/crossLink}} if none specified","	 * and slides it on top of the iNode provided.","	 * @method _createNode","	 * @param iNode {Object} reference to a iNode within the configuration tree","	 * @return {FlyweightTreeNode} Instance of the corresponding subclass of FlyweightTreeNode","	 * @protected","	 */","	_createNode: function (iNode) {","		var newNode,","			Type = iNode.type || this.get('defaultType');","		if (Lang.isString(Type)) {","			Type = Y[Type];","		}","		if (Type) {","			newNode = new Type({root:this});","			if (newNode instanceof Y.FlyweightTreeNode) {","				// I need to do this otherwise Attribute will initialize","				// the real iNode with default values when activating a lazyAdd attribute.","				newNode._slideTo({});","				YArray.each(Y.Object.keys(newNode._state.data), newNode._addLazyAttr, newNode);","				// newNode.getAttrs();","				// That's it (see above)","				newNode._root =  this;","				newNode._slideTo(iNode);","				return newNode;","			}","		}","		return null;","	},","	/**","	 * Returns an instance of Flyweight node positioned over the root","	 * @method getRoot","	 * @return {FlyweightTreeNode}","	 */","	getRoot: function () {","		return this._poolFetch(this._tree);","	},","	/**","	 * Returns a string with the markup for the whole tree.","	 * A subclass might opt to produce markup for those parts visible. (lazy rendering)","	 * @method _getHTML","	 * @return {String} HTML for this widget","	 * @protected","	 */","	_getHTML: function () {","		var s = '',","			root = this.getRoot();","		root.forSomeChildren( function (fwNode, index, array) {","			s += fwNode._getHTML(index, array.length, 0);","		});","		this._poolReturn(root);","		return s;","	},","	/**","	 * Locates a iNode in the tree by the element that represents it.","	 * @method _findINodeByElement","	 * @param el {Node} Any element belonging to the tree","	 * @return {Object} iNode that produced the markup for that element or null if not found","	 * @protected","	 */","	_findINodeByElement: function(el) {","		var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),","			found = null,","			scan = function (iNode) {","				if (iNode.id === id) {","					found = iNode;","					return true;","				}","				if (iNode.children) {","					return YArray.some(iNode.children, scan);","				}","				return false;","			};","		if (scan(this._tree)) {","			return found;","		}","		return null;","	},","	/**","	 * Returns a FlyweightTreeNode instance from the pool, positioned over the iNode whose markup generated some event.","	 * @method _poolFetchFromEvent","	 * @param ev {EventFacade}","	 * @return {FlyweightTreeNode} The FlyweightTreeNode instance or null if not found.","	 * @private","	 */","	_poolFetchFromEvent: function (ev) {","		var found = this._findINodeByElement(ev.domEvent.target);","		if (found) {","			return this._poolFetch(found);","		}","		return null;","	},","	/**","	 * Traverses the whole configuration tree, calling a given function for each iNode.","	 * If the function returns true, the traversing will terminate.","	 * @method _forSomeINode","	 * @param fn {Function} Function to call on each configuration iNode","	 *		@param fn.iNode {Object} iNode in the configuration tree","	 *		@param fn.depth {Integer} depth of this iNode within the tree","	 *		@param fn.index {Integer} index of this iNode within the array of its siblings","	 * @param scope {Object} scope to run the function in, defaults to `this`.","	 * @return true if any of the function calls returned true (the traversal was terminated earlier)","	 * @protected","	 */","	_forSomeINode: function(fn, scope) {","		scope = scope || this;","		var loop = function(iNode, depth) {","			return YArray.some(iNode.children || [], function(childINode, index) {","				if (fn.call(scope, childINode,depth, index)) {","                    return true;","                }","				return loop(childINode,depth + 1);","			});","		};","		return loop(this._tree, 0);","	},","	/**","	 * Executes the given function over all the nodes in the tree or until the function returns true.","	 * If dynamic loading is enabled, it will not run over nodes not yet loaded.","	 * @method forSomeNodes","	 * @param fn {function} function to execute on each node.  It will receive:","	 *	@param fn.node {FlyweightTreeNode} node being visited.","	 *	@param fn.depth {Integer} depth from the root. The root node is level zero and it is not traversed.","	 *	@param fn.index {Integer} position of this node within its branch","	 *	@param fn.array {Array} array containing itself and its siblings","	 * @param scope {Object} Scope to run the function in.  Defaults to the FlyweightTreeManager instance.","	 * @return {Boolean} true if any function calls returned true (the traversal was interrupted)","	 */","	forSomeNodes: function (fn, scope) {","		scope = scope || this;","","		var forOneLevel = function (fwNode, depth) {","			fwNode.forSomeChildren(function (fwNode, index, array) {","				if (fn.call(scope, fwNode, depth, index, array) === true) {","					return true;","				}","				return forOneLevel(fwNode, depth+1);","			});","		};","		return forOneLevel(this.getRoot(), 1);","	},","    /**","     * Getter for the {{#crossLink \"focusedNode:attribute\"}}{{/crossLink}} attribute","     * @method _focusedNodeGetter","     * @return {FlyweightNode} Node that would have the focus if the widget is focused","     * @private","     */","    _focusedNodeGetter: function () {","        return this._poolFetch(this._focusedINode);","    },","    /**","     * Setter for the {{#crossLink \"focusedNode:attribute\"}}{{/crossLink}} attribute","     * @method _focusedNodeSetter","     * @param value {FlyweightNode} Node to receive the focus.","     * @return {Object} iNode matching the focused node.","     * @private","     */","    _focusedNodeSetter: function (value) {","        if (!value || value instanceof Y.FlyweightTreeNode) {","            var newINode = (value?value._iNode:this._tree.children[0]);","            this._focusOnINode(newINode);","            return newINode;","        } else {","            return Y.Attribute.INVALID_VALUE;","        }","    },","    /**","     * Sets the focus on the given iNode","     * @method _focusOnINode","     * @param iNode {Object} iNode to receive the focus","     * @private","     */","    _focusOnINode: function (iNode) {","        var prevINode = this._focusedINode,","            el;","","        if (iNode && iNode !== prevINode) {","","            el = Y.one('#' + prevINode.id + ' .' + CNAME_CONTENT);","            el.blur();","            el.set(TABINDEX, -1);","","            el = Y.one('#' + iNode.id + ' .' + CNAME_CONTENT);","            el.focus();","            el.set(TABINDEX,0);","","            this._focusedINode = iNode;","        }","","    },","    /**","     * Setter for the {{#crossLink \"dynamicLoader:attribute\"}}{{/crossLink}} attribute.","     * It changes the expanded attribute to false on childless iNodes not marked with `isLeaf","     * since they can now be expanded.","     * @method","     * @param value {Function | null } Function to handle the loading of nodes on demand","     * @return {Function | null | INVALID_VALUE} function set or rejection","     * @private","     */","    _dynamicLoaderSetter: function (value) {","        if (!Lang.isFunction(value) &&  value !== null) {","            return Y.Attribute.INVALID_VALUE;","        }","        if (value) {","            this._forSomeINode(function(iNode) {","                if (!iNode.children) {","                    iNode.expanded = !!iNode.isLeaf;","                }","            });","        }","        return value;","    }","};","","Y.FlyweightTreeManager = FWMgr;","/**","* An implementation of the flyweight pattern.","* This object can be slid on top of a literal object containing the definition","* of a tree and will take its state from that iNode it is slid upon.","* It relies for most of its functionality on the flyweight manager object,","* which contains most of the code.","* @module gallery-flyweight-tree","*/","","/**","* An implementation of the flyweight pattern.  This class should not be instantiated directly.","* Instances of this class can be requested from the flyweight manager class","* @class FlyweightTreeNode","* @extends Base","* @constructor  Do not instantiate directly.","*/","FWNode = Y.Base.create(","	FWNODE_NAME,","	Y.Base,","	[],","	{","		/**","		 * Reference to the iNode in the configuration tree it has been slid over.","		 * @property _iNode","		 * @type {Object}","		 * @private","		 **/","		_iNode:null,","		/**","		 * Reference to the FlyweightTreeManager instance this node belongs to.","		 * It is set by the root and should be considered read-only.","		 * @property _root","		 * @type FlyweightTreeManager","		 * @private","		 */","		_root: null,","        /**","         *","         */","        initializer: function (cfg) {","            this._root = cfg.root;","        },","		/**","		 * Returns a string with the markup for this node along that of its children","		 * produced from its attributes rendered","		 * via the first template string it finds in these locations:","		 *","		 * * It's own {{#crossLink \"template\"}}{{/crossLink}} configuration attribute","		 * * The static {{#crossLink \"FlyweightTreeNode/TEMPLATE\"}}{{/crossLink}} class property","		 *","		 * @method _getHTML","		 * @param index {Integer} index of this node within the array of siblings","		 * @param nSiblings {Integer} number of siblings including this node","		 * @param depth {Integer} number of levels to the root","		 * @return {String} markup generated by this node","		 * @protected","		 */","		_getHTML: function(index, nSiblings, depth) {","			// assumes that if you asked for the HTML it is because you are rendering it","			var root = this._root,","                iNode = this._iNode,","				attrs = this.getAttrs(),","				s = '',","				templ = iNode.template,","				childCount = iNode.children && iNode.children.length,","				nodeClasses = [CNAME_NODE],","				superConstructor = this.constructor;","","			while (!templ) {","				templ = superConstructor.TEMPLATE;","				superConstructor = superConstructor.superclass.constructor;","","			}","","			iNode._rendered = true;","			if (childCount) {","				if (attrs.expanded) {","					iNode._childrenRendered = true;","					this.forSomeChildren( function (fwNode, index, array) {","						s += fwNode._getHTML(index, array.length, depth + 1);","					});","					nodeClasses.push(CNAME_EXPANDED);","				} else {","					nodeClasses.push(CNAME_COLLAPSED);","				}","			} else {","				if (this._root.get(DYNAMIC_LOADER) && !iNode.isLeaf) {","					nodeClasses.push(CNAME_COLLAPSED);","				} else {","					nodeClasses.push(CNAME_NOCHILDREN);","				}","			}","			if (index === 0) {","				nodeClasses.push(CNAME_FIRSTCHILD);","			}","			if (index === nSiblings - 1) {","				nodeClasses.push(CNAME_LASTCHILD);","			}","			attrs.children = s;","			attrs.cname_node = nodeClasses.join(' ');","			attrs.cname_content = CNAME_CONTENT;","			attrs.cname_children = CNAME_CHILDREN;","            attrs.tabIndex = (iNode === root._focusedINode)?0:-1;","","			return Lang.sub(templ, attrs);","","		},","		/**","		 * Method to slide this instance on top of another iNode in the configuration object","		 * @method _slideTo","		 * @param iNode {Object} iNode in the underlying configuration tree to slide this object on top of.","		 * @private","		 */","		_slideTo: function (iNode) {","			this._iNode = iNode;","			this._stateProxy = iNode;","		},","		/**","		 * Executes the given function on each of the child nodes of this node.","		 * @method forSomeChildren","		 * @param fn {Function} Function to be executed on each node","		 *		@param fn.child {FlyweightTreeNode} Instance of a suitable subclass of FlyweightTreeNode,","		 *		positioned on top of the child node","		 *		@param fn.index {Integer} Index of this child within the array of children","		 *		@param fn.array {Array} array containing itself and its siblings","		 * @param scope {object} The falue of this for the function.  Defaults to the parent.","		**/","		forSomeChildren: function(fn, scope) {","			var root = this._root,","				children = this._iNode.children,","				child, ret;","			scope = scope || this;","			if (children && children.length) {","				YArray.some(children, function (iNode, index, array) {","					child = root._poolFetch(iNode);","					ret = fn.call(scope, child, index, array);","					root._poolReturn(child);","					return ret;","				});","			}","		},","		/**","		 * Getter for the expanded configuration attribute.","		 * It is meant to be overriden by the developer.","		 * The supplied version defaults to true if the expanded property","		 * is not set in the underlying configuration tree.","		 * It can be overriden to default to false.","		 * @method _expandedGetter","		 * @return {Boolean} The expanded state of the node.","		 * @protected","		 */","		_expandedGetter: function () {","			return this._iNode.expanded !== false;","		},","		/**","		 * Setter for the expanded configuration attribute.","		 * It renders the child nodes if this branch has never been expanded.","		 * Then sets the className on the node to the static constants","		 * CNAME_COLLAPSED or CNAME_EXPANDED from Y.FlyweightTreeManager","		 * @method _expandedSetter","		 * @param value {Boolean} new value for the expanded attribute","		 * @private","		 */","		_expandedSetter: function (value) {","			var self = this,","				iNode = self._iNode,","				root = self._root,","				el = Y.one('#' + iNode.id),","				dynLoader = root.get(DYNAMIC_LOADER);","","			iNode.expanded = value = !!value;","			if (dynLoader && !iNode.isLeaf && (!iNode.children  || !iNode.children.length)) {","				this._loadDynamic();","				return;","			}","			if (iNode.children && iNode.children.length) {","				if (value) {","					if (!iNode._childrenRendered) {","						self._renderChildren();","					}","					el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);","				} else {","					el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);","				}","			}","            el.set('aria-expanded', String(value));","		},","		/**","		 * Triggers the dynamic loading of children for this node.","		 * @method _loadDynamic","		 * @private","		 */","		_loadDynamic: function () {","			var self = this,","				root = self._root;","			Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);","			root.get(DYNAMIC_LOADER).call(root, self, Y.bind(self._dynamicLoadReturn, self));","","		},","		/**","		 * Callback for the dynamicLoader method.","		 * @method _dynamicLoadReturn","		 * @param response {Array} array of child iNodes","		 * @private","		 */","		_dynamicLoadReturn: function (response) {","			var self = this,","				iNode = self._iNode,","				root = self._root;","","			if (response) {","","				iNode.children = response;","				root._initNodes(iNode);","				self._renderChildren();","			} else {","				iNode.isLeaf = true;","			}","			// isLeaf might have been set in the response, not just in the line above.","			Y.one('#' + iNode.id).replaceClass(CNAME_LOADING, (iNode.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));","		},","		/**","		 * Renders the children of this node.","		 * It the children had been rendered, they will be replaced.","		 * @method _renderChildren","		 * @private","		 */","		_renderChildren: function () {","			var s = '',","				iNode = this._iNode,","				depth = this.get('depth');","			iNode._childrenRendered = true;","			this.forSomeChildren(function (fwNode, index, array) {","				s += fwNode._getHTML(index, array.length, depth + 1);","			});","			Y.one('#' + iNode.id + ' .' + CNAME_CHILDREN).setContent(s);","		},","		/**","		 * Prevents this instance from being returned to the pool and reused.","		 * Remember to {{#crossLink \"release\"}}{{/crossLink}} this instance when no longer needed.","		 * @method hold","		 * @chainable","		 */","		hold: function () {","			return (this._iNode._held = this);","		},","		/**","		 * Allows this instance to be returned to the pool and reused.","		 *","		 * __Important__: This instance should not be used after being released","		 * @method release","		 * @chainable","		 */","		release: function () {","			this._iNode._held = null;","			this._root._poolReturn(this);","			return this;","		},","		/**","		 * Returns the parent node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getParent","		 * @return FlyweightTreeNode","		 */","		getParent: function() {","			var iNode = this._iNode._parent;","			return (iNode?this._root._poolFetch(iNode):null);","		},","		/**","		 * Returns the next sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getNextSibling","		 * @return FlyweightTreeNode","		 */","		getNextSibling: function() {","			var parent = this._iNode._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) + 1;","			if (index === 0 || index > siblings.length) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","		/**","		 * Returns the previous sibling node for this node or null if none exists.","		 * The copy is not on {{#crossLink \"hold\"}}{{/crossLink}}.","		 * Remember to release the copy to the pool when done.","		 * @method getPreviousSibling","		 * @return FlyweightTreeNode","		 */","		getPreviousSibling: function() {","			var parent = this._iNode._parent,","				siblings = (parent && parent.children) || [],","				index = siblings.indexOf(this) - 1;","			if (index < 0) {","				return null;","			}","			return this._root._poolFetch(siblings[index]);","		},","        /**","         * Sets the focus to this node.","         * @method focus","         * @chainable","         */","        focus: function() {","            return this._root.set(FOCUSED, this);","        },","        /**","         * Removes the focus from this node","         * @method blur","         * @chainable","         */","        blur: function () {","            return this._root.set(FOCUSED, null);","        },","		/**","		 * Sugar method to toggle the expanded state of the node.","		 * @method toggle","		 * @chainable","		 */","		toggle: function() {","			return this.set(EXPANDED, !this.get(EXPANDED));","		},","        /**","         * Sugar method to expand a node","         * @method expand","         * @chainable","         */","        expand: function() {","            return this.set(EXPANDED, true);","        },","        /**","         * Sugar method to collapse this node","         * @method collapse","         * @chainable","         */","        collapse: function() {","            return this.set(EXPANDED, false);","        },","		/**","		 * Returns true if this node is the root node","		 * @method isRoot","		 * @return {Boolean} true if root node","		 */","		isRoot: function() {","			return this._root._tree === this._iNode;","		},","		/**","		* Gets the stored value for the attribute, from either the","		* internal state object, or the state proxy if it exits","		*","		* @method _getStateVal","		* @private","		* @param {String} name The name of the attribute","		* @return {Any} The stored value of the attribute","		*/","		_getStateVal : function(name) {","			var iNode = this._iNode;","			if (this._state.get(name, BYPASS_PROXY) || !iNode) {","				return this._state.get(name, VALUE);","			}","			if (iNode.hasOwnProperty(name)) {","				return iNode[name];","			}","			return this._state.get(name, VALUE);","		},","","		/**","		* Sets the stored value for the attribute, in either the","		* internal state object, or the state proxy if it exits","		*","		* @method _setStateVal","		* @private","		* @param {String} name The name of the attribute","		* @param {Any} value The value of the attribute","		*/","		_setStateVal : function(name, value) {","			var iNode = this._iNode;","			if (this._state.get(name, BYPASS_PROXY) || this._state.get(name, 'initializing') || !iNode) {","				this._state.add(name, VALUE, value);","			} else {","				iNode[name] = value;","			}","		}","	},","	{","		/**","		 * Template string to be used to render this node.","		 * It should be overriden by the subclass.","		 *","		 * It contains the HTML markup for this node plus placeholders,","		 * enclosed in curly braces, that have access to any of the","		 * configuration attributes of this node plus several predefined placeholders.","         *","         * It must contain at least three elements identified by their classNames:","","         +----------------------------+","         | {cname_node}               |","         | +------------------------+ |","         | | {cname_content}        | |","         | +------------------------+ |","         |                            |","         | +------------------------+ |","         | | {cname_children}       | |","         | +------------------------+ |","         +----------------------------+","","         * For example:","","         '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\">' +","               '<div tabIndex=\"{tabIndex}\" class=\"{cname_content}\">{label}</div>' +","               '<div class=\"{cname_children}\" role=\"group\">{children}</div>' +","         '</div>'","","         * The outermost container identified by the className `{cname_node}`","         * must also use the `{id}` placeholder to set the `id` of the node.","         * It should also have the proper ARIA role assigned and the","         * `aria-expanded` set to the `{expanded}` placeholder.","         *","         * It must contain two further elements:","         *","         * * A container for the contents of this node, identified by the className","         *   `{cname_content}` which should contain everything the user would associate","         *   with this node, such as the label and other status indicators","         *   such as toggle and selection indicators.","         *   This is the element that would receive the focus of the node, thus,","         *   it must have a `{tabIndex}` placeholder to receive the appropriate","         *   value for the `tabIndex` attribute.","         *","         * * The other element is the container for the children of this node.","         *   It will be identified by the className `{cname_children}` and it","         *   should enclose the placeholder `{children}`.","         *","		 * @property TEMPLATE","		 * @type {String}","		 * @default '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\"><div tabIndex=\"{tabIndex}\"","         class=\"{cname_content}\">{label}</div><div class=\"{cname_children}\" role=\"group\">{children}</div></div>'","		 * @static","		 */","		TEMPLATE: '<div id=\"{id}\" class=\"{cname_node}\" role=\"\" aria-expanded=\"{expanded}\">' +","                        '<div tabIndex=\"{tabIndex}\" class=\"{cname_content}\">{label}</div>' +","                        '<div class=\"{cname_children}\" role=\"group\">{children}</div>' +","                   '</div>',","		/**","		 * CCS className constant to use as the class name for the DOM element representing the node.","		 * @property CNAME_NODE","		 * @type String","		 * @static","		 */","		CNAME_NODE: CNAME_NODE,","		/**","		 * CCS className constant to use as the class name for the DOM element that will contain the label and/or status of this node.","		 * @property CNAME_CONTENT","		 * @type String","		 * @static","		 */","		CNAME_CONTENT: CNAME_CONTENT,","		/**","		 * CCS className constant to use as the class name for the DOM element that will contain the children of this node.","		 * @property CNAME_CHILDREN","		 * @type String","		 * @static","		 */","		CNAME_CHILDREN: CNAME_CHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when its state is not expanded.","		 * @property CNAME_COLLAPSED","		 * @type String","		 * @static","		 */","		CNAME_COLLAPSED: CNAME_COLLAPSED,","		/**","		 * CCS className constant added to the DOM element for this node when its state is expanded.","		 * @property CNAME_EXPANDED","		 * @type String","		 * @static","		 */","		CNAME_EXPANDED: CNAME_EXPANDED,","		/**","		 * CCS className constant added to the DOM element for this node when it has no children.","		 * @property CNAME_NOCHILDREN","		 * @type String","		 * @static","		 */","		CNAME_NOCHILDREN: CNAME_NOCHILDREN,","		/**","		 * CCS className constant added to the DOM element for this node when it is the first in the group.","		 * @property CNAME_FIRSTCHILD","		 * @type String","		 * @static","		 */","		CNAME_FIRSTCHILD: CNAME_FIRSTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when it is the last in the group.","		 * @property CNAME_LASTCHILD","		 * @type String","		 * @static","		 */","		CNAME_LASTCHILD: CNAME_LASTCHILD,","		/**","		 * CCS className constant added to the DOM element for this node when dynamically loading its children.","		 * @property CNAME_LOADING","		 * @type String","		 * @static","		 */","		CNAME_LOADING: CNAME_LOADING,","		ATTRS: {","			/**","			 * Reference to the FlyweightTreeManager this node belongs to","			 * @attribute root","			 * @type {FlyweightTreeManager}","			 * @readOnly","			 *","			 */","","			root: {","				_bypassProxy: true,","				readOnly: true,","				getter: function() {","					return this._root;","				}","			},","","			/**","			 * Template to use on this particular instance.","			 * The renderer will default to the static TEMPLATE property of this class","			 * (the preferred way) or the nodeTemplate configuration attribute of the root.","			 * See the TEMPLATE static property.","			 * @attribute template","			 * @type {String}","			 * @default undefined","			 */","			template: {","				validator: Lang.isString","			},","			/**","			 * Label for this node. Nodes usually have some textual content, this is the place for it.","			 * @attribute label","			 * @type {String}","			 * @default ''","			 */","			label: {","				validator: Lang.isString,","				value: ''","			},","			/**","			 * Id to assign to the DOM element that contains this node.","			 * If none was supplied, it will generate one","			 * @attribute id","			 * @type {Identifier}","			 * @default guid()","			 * @readOnly","			 */","			id: {","				readOnly: true","			},","			/**","			 * Returns the depth of this node from the root.","			 * This is calculated on-the-fly.","			 * @attribute depth","			 * @type Integer","			 * @readOnly","			 */","			depth: {","				_bypassProxy: true,","				readOnly: true,","				getter: function () {","					var count = 0,","						iNode = this._iNode;","					while (iNode._parent) {","						count += 1;","						iNode = iNode._parent;","					}","					return count-1;","				}","			},","			/**","			 * Expanded state of this node.","			 * @attribute expanded","			 * @type Boolean","			 * @default true","			 */","			expanded: {","				_bypassProxy: true,","				getter: '_expandedGetter',","				setter: '_expandedSetter'","			}","		}","	}",");","Y.FlyweightTreeNode = FWNode;","","","","}, '@VERSION@', {\"requires\": [\"base-base\", \"base-build\", \"classnamemanager\", \"event-focus\"], \"skinnable\": false});"];
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].lines = {"1":0,"3":0,"5":0,"22":0,"65":0,"66":0,"67":0,"68":0,"75":0,"128":0,"197":0,"200":0,"209":0,"211":0,"212":0,"213":0,"215":0,"216":0,"217":0,"218":0,"220":0,"222":0,"231":0,"232":0,"234":0,"235":0,"236":0,"238":0,"248":0,"249":0,"250":0,"251":0,"257":0,"258":0,"259":0,"260":0,"261":0,"262":0,"263":0,"264":0,"266":0,"280":0,"281":0,"282":0,"295":0,"296":0,"297":0,"309":0,"310":0,"311":0,"312":0,"314":0,"317":0,"330":0,"334":0,"335":0,"337":0,"338":0,"339":0,"341":0,"342":0,"343":0,"344":0,"346":0,"356":0,"357":0,"359":0,"361":0,"362":0,"363":0,"377":0,"379":0,"380":0,"382":0,"383":0,"384":0,"387":0,"388":0,"391":0,"392":0,"393":0,"396":0,"404":0,"414":0,"416":0,"417":0,"419":0,"420":0,"430":0,"433":0,"434":0,"435":0,"437":0,"438":0,"440":0,"442":0,"443":0,"445":0,"455":0,"456":0,"457":0,"459":0,"474":0,"475":0,"476":0,"477":0,"478":0,"480":0,"483":0,"498":0,"500":0,"501":0,"502":0,"503":0,"505":0,"508":0,"517":0,"527":0,"528":0,"529":0,"530":0,"532":0,"542":0,"545":0,"547":0,"548":0,"549":0,"551":0,"552":0,"553":0,"555":0,"569":0,"570":0,"572":0,"573":0,"574":0,"575":0,"579":0,"583":0,"600":0,"624":0,"643":0,"652":0,"653":0,"654":0,"658":0,"659":0,"660":0,"661":0,"662":0,"663":0,"665":0,"667":0,"670":0,"671":0,"673":0,"676":0,"677":0,"679":0,"680":0,"682":0,"683":0,"684":0,"685":0,"686":0,"688":0,"698":0,"699":0,"712":0,"715":0,"716":0,"717":0,"718":0,"719":0,"720":0,"721":0,"736":0,"748":0,"754":0,"755":0,"756":0,"757":0,"759":0,"760":0,"761":0,"762":0,"764":0,"766":0,"769":0,"777":0,"779":0,"780":0,"790":0,"794":0,"796":0,"797":0,"798":0,"800":0,"803":0,"812":0,"815":0,"816":0,"817":0,"819":0,"828":0,"838":0,"839":0,"840":0,"850":0,"851":0,"861":0,"864":0,"865":0,"867":0,"877":0,"880":0,"881":0,"883":0,"891":0,"899":0,"907":0,"915":0,"923":0,"931":0,"943":0,"944":0,"945":0,"947":0,"948":0,"950":0,"963":0,"964":0,"965":0,"967":0,"1105":0,"1153":0,"1155":0,"1156":0,"1157":0,"1159":0,"1176":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].functions = {"cName:21":0,"FWMgr:65":0,"_loadConfig:196":0,"(anonymous 2):211":0,"_initNodes:208":0,"(anonymous 3):231":0,"(anonymous 4):235":0,"_onDestroy:230":0,"(anonymous 5):250":0,"(anonymous 7):258":0,"(anonymous 6):257":0,"_doAfterRender:247":0,"(anonymous 8):280":0,"expandAll:279":0,"_afterDomEvent:294":0,"_getTypeString:308":0,"_poolFetch:329":0,"_poolReturn:355":0,"_createNode:376":0,"getRoot:403":0,"(anonymous 9):416":0,"_getHTML:413":0,"scan:432":0,"_findINodeByElement:429":0,"_poolFetchFromEvent:454":0,"(anonymous 10):476":0,"loop:475":0,"_forSomeINode:473":0,"(anonymous 11):501":0,"forOneLevel:500":0,"forSomeNodes:497":0,"_focusedNodeGetter:516":0,"_focusedNodeSetter:526":0,"_focusOnINode:541":0,"(anonymous 12):573":0,"_dynamicLoaderSetter:568":0,"initializer:623":0,"(anonymous 13):662":0,"_getHTML:641":0,"_slideTo:697":0,"(anonymous 14):717":0,"forSomeChildren:711":0,"_expandedGetter:735":0,"_expandedSetter:747":0,"_loadDynamic:776":0,"_dynamicLoadReturn:789":0,"(anonymous 15):816":0,"_renderChildren:811":0,"hold:827":0,"release:837":0,"getParent:849":0,"getNextSibling:860":0,"getPreviousSibling:876":0,"focus:890":0,"blur:898":0,"toggle:906":0,"expand:914":0,"collapse:922":0,"isRoot:930":0,"_getStateVal:942":0,"_setStateVal:962":0,"getter:1104":0,"getter:1152":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredLines = 241;
_yuitest_coverage["build/gallery-flyweight-tree/gallery-flyweight-tree.js"].coveredFunctions = 64;
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
this._eventHandles = [
        Y.Do.after(this._doAfterRender, this, "render"),
        this.after('focus', this._afterFocus),
        this.on('destroy', this._onDestroy)
    ];
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 75);
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


_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 128);
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
     * Event handles of events subscribed to, to detach them on destroy
     * @property _eventHandles
     * @type Array of EventHandles
     * @private
     */
    _eventHandles: null,

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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadConfig", 196);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 197);
this._tree = {
			children: Y.clone(tree)
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 200);
this._initNodes(this._tree);

	},
	/** Initializes the iNodes configuration with default values and management info.
	 * @method _initNodes
	 * @param parentINode {Object} Parent of the iNodes to be set
	 * @private
	 */
	_initNodes: function (parentINode) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_initNodes", 208);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 209);
var self = this,
            dynLoad = !!self.get(DYNAMIC_LOADER);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 211);
YArray.each(parentINode.children, function (iNode) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 2)", 211);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 212);
if (!self._focusedINode) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 213);
self._focusedINode = iNode;
            }
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 215);
iNode._parent = parentINode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 216);
iNode.id = iNode.id || Y.guid();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 217);
if (dynLoad && !iNode.children) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 218);
iNode.expanded = !!iNode.isLeaf;
            } else {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 220);
iNode.expanded = (iNode.expanded === undefined) || !!iNode.expanded;
            }
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 222);
self._initNodes(iNode);
		});
	},
    /**
     * Part of the lifecycle.  Destroys the pools.
     * @method _onDestroy
     * @protected
     */
    _onDestroy: function () {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_onDestroy", 230);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 231);
YArray.each(this._pool, function (fwNode) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 3)", 231);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 232);
fwNode.destroy();
        });
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 234);
this._pool = null;
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 235);
YArray.each(this._eventHandles, function (evHandle) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 4)", 235);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 236);
evHandle.detach();
        });
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 238);
this._eventHandles = null;

    },
    /**
     * Initializes the events for its internal use and those requested in
     * the {{#crossLink "_domEvents"}}{{/crossLink}} array.
     * @method _doAfterRender
     * @private
     */
    _doAfterRender: function() {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_doAfterRender", 247);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 248);
var self = this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 249);
if (self._domEvents) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 250);
YArray.each(self._domEvents, function (event) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 5)", 250);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 251);
self._eventHandles.push(self.after(event, self._afterDomEvent, self));
			});
		}

        // This should formally be done via two calls to Y.Do.before and Y.Do.after
        // but I think it is too heavy.
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 257);
self.fire = (function (original) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 6)", 257);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 258);
return function (type, ev) {
                _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 7)", 258);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 259);
var ret;
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 260);
if (ev && ev.domEvent) {
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 261);
ev.node = this._poolFetchFromEvent(ev);
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 262);
ret = original.call(this, type, ev);
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 263);
this._poolReturn(ev.node);
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 264);
return ret;
                }
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 266);
return original.call(this, type, ev);
            };
        })(self.fire);

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
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "expandAll", 279);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 280);
this._forSomeINode(function(iNode) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 8)", 280);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 281);
if (iNode.children && !iNode.expanded) {
                _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 282);
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
    _afterDomEvent: function(ev) {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_afterDomEvent", 294);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 295);
var fwNode =  ev.node;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 296);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 297);
fwNode.fire(ev.type.split(':')[1], {domEvent:ev.domEvent});
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getTypeString", 308);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 309);
var type = iNode.type || DEFAULT_POOL;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 310);
if (!Lang.isString(type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 311);
if (Lang.isObject(type)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 312);
type = type.NAME;
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 314);
throw "Node contains unknown type";
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 317);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetch", 329);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 330);
var pool,
			fwNode = iNode._held,
			type = this._getTypeString(iNode);

		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 334);
if (fwNode) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 335);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 337);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 338);
if (pool === undefined) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 339);
pool = this._pool[type] = [];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 341);
if (pool.length) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 342);
fwNode = pool.pop();
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 343);
fwNode._slideTo(iNode);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 344);
return fwNode;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 346);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolReturn", 355);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 356);
if (fwNode._iNode._held) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 357);
return;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 359);
var pool,
			type = this._getTypeString(fwNode._iNode);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 361);
pool = this._pool[type];
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 362);
if (pool) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 363);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_createNode", 376);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 377);
var newNode,
			Type = iNode.type || this.get('defaultType');
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 379);
if (Lang.isString(Type)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 380);
Type = Y[Type];
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 382);
if (Type) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 383);
newNode = new Type({root:this});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 384);
if (newNode instanceof Y.FlyweightTreeNode) {
				// I need to do this otherwise Attribute will initialize
				// the real iNode with default values when activating a lazyAdd attribute.
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 387);
newNode._slideTo({});
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 388);
YArray.each(Y.Object.keys(newNode._state.data), newNode._addLazyAttr, newNode);
				// newNode.getAttrs();
				// That's it (see above)
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 391);
newNode._root =  this;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 392);
newNode._slideTo(iNode);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 393);
return newNode;
			}
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 396);
return null;
	},
	/**
	 * Returns an instance of Flyweight node positioned over the root
	 * @method getRoot
	 * @return {FlyweightTreeNode}
	 */
	getRoot: function () {
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getRoot", 403);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 404);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 413);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 414);
var s = '',
			root = this.getRoot();
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 416);
root.forSomeChildren( function (fwNode, index, array) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 9)", 416);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 417);
s += fwNode._getHTML(index, array.length, 0);
		});
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 419);
this._poolReturn(root);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 420);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_findINodeByElement", 429);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 430);
var id = el.ancestor(DOT + FWNode.CNAME_NODE, true).get('id'),
			found = null,
			scan = function (iNode) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "scan", 432);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 433);
if (iNode.id === id) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 434);
found = iNode;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 435);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 437);
if (iNode.children) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 438);
return YArray.some(iNode.children, scan);
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 440);
return false;
			};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 442);
if (scan(this._tree)) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 443);
return found;
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 445);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_poolFetchFromEvent", 454);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 455);
var found = this._findINodeByElement(ev.domEvent.target);
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 456);
if (found) {
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 457);
return this._poolFetch(found);
		}
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 459);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_forSomeINode", 473);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 474);
scope = scope || this;
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 475);
var loop = function(iNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "loop", 475);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 476);
return YArray.some(iNode.children || [], function(childINode, index) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 10)", 476);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 477);
if (fn.call(scope, childINode,depth, index)) {
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 478);
return true;
                }
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 480);
return loop(childINode,depth + 1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 483);
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
		_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forSomeNodes", 497);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 498);
scope = scope || this;

		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 500);
var forOneLevel = function (fwNode, depth) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forOneLevel", 500);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 501);
fwNode.forSomeChildren(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 11)", 501);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 502);
if (fn.call(scope, fwNode, depth, index, array) === true) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 503);
return true;
				}
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 505);
return forOneLevel(fwNode, depth+1);
			});
		};
		_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 508);
return forOneLevel(this.getRoot(), 1);
	},
    /**
     * Getter for the {{#crossLink "focusedNode:attribute"}}{{/crossLink}} attribute
     * @method _focusedNodeGetter
     * @return {FlyweightNode} Node that would have the focus if the widget is focused
     * @private
     */
    _focusedNodeGetter: function () {
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusedNodeGetter", 516);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 517);
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
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusedNodeSetter", 526);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 527);
if (!value || value instanceof Y.FlyweightTreeNode) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 528);
var newINode = (value?value._iNode:this._tree.children[0]);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 529);
this._focusOnINode(newINode);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 530);
return newINode;
        } else {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 532);
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
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_focusOnINode", 541);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 542);
var prevINode = this._focusedINode,
            el;

        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 545);
if (iNode && iNode !== prevINode) {

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 547);
el = Y.one('#' + prevINode.id + ' .' + CNAME_CONTENT);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 548);
el.blur();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 549);
el.set(TABINDEX, -1);

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 551);
el = Y.one('#' + iNode.id + ' .' + CNAME_CONTENT);
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 552);
el.focus();
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 553);
el.set(TABINDEX,0);

            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 555);
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
        _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoaderSetter", 568);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 569);
if (!Lang.isFunction(value) &&  value !== null) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 570);
return Y.Attribute.INVALID_VALUE;
        }
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 572);
if (value) {
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 573);
this._forSomeINode(function(iNode) {
                _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 12)", 573);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 574);
if (!iNode.children) {
                    _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 575);
iNode.expanded = !!iNode.isLeaf;
                }
            });
        }
        _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 579);
return value;
    }
};

_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 583);
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
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 600);
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
         *
         */
        initializer: function (cfg) {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "initializer", 623);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 624);
this._root = cfg.root;
        },
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getHTML", 641);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 643);
var root = this._root,
                iNode = this._iNode,
				attrs = this.getAttrs(),
				s = '',
				templ = iNode.template,
				childCount = iNode.children && iNode.children.length,
				nodeClasses = [CNAME_NODE],
				superConstructor = this.constructor;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 652);
while (!templ) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 653);
templ = superConstructor.TEMPLATE;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 654);
superConstructor = superConstructor.superclass.constructor;

			}

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 658);
iNode._rendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 659);
if (childCount) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 660);
if (attrs.expanded) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 661);
iNode._childrenRendered = true;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 662);
this.forSomeChildren( function (fwNode, index, array) {
						_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 13)", 662);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 663);
s += fwNode._getHTML(index, array.length, depth + 1);
					});
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 665);
nodeClasses.push(CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 667);
nodeClasses.push(CNAME_COLLAPSED);
				}
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 670);
if (this._root.get(DYNAMIC_LOADER) && !iNode.isLeaf) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 671);
nodeClasses.push(CNAME_COLLAPSED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 673);
nodeClasses.push(CNAME_NOCHILDREN);
				}
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 676);
if (index === 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 677);
nodeClasses.push(CNAME_FIRSTCHILD);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 679);
if (index === nSiblings - 1) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 680);
nodeClasses.push(CNAME_LASTCHILD);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 682);
attrs.children = s;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 683);
attrs.cname_node = nodeClasses.join(' ');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 684);
attrs.cname_content = CNAME_CONTENT;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 685);
attrs.cname_children = CNAME_CHILDREN;
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 686);
attrs.tabIndex = (iNode === root._focusedINode)?0:-1;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 688);
return Lang.sub(templ, attrs);

		},
		/**
		 * Method to slide this instance on top of another iNode in the configuration object
		 * @method _slideTo
		 * @param iNode {Object} iNode in the underlying configuration tree to slide this object on top of.
		 * @private
		 */
		_slideTo: function (iNode) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_slideTo", 697);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 698);
this._iNode = iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 699);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "forSomeChildren", 711);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 712);
var root = this._root,
				children = this._iNode.children,
				child, ret;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 715);
scope = scope || this;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 716);
if (children && children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 717);
YArray.some(children, function (iNode, index, array) {
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 14)", 717);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 718);
child = root._poolFetch(iNode);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 719);
ret = fn.call(scope, child, index, array);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 720);
root._poolReturn(child);
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 721);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedGetter", 735);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 736);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_expandedSetter", 747);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 748);
var self = this,
				iNode = self._iNode,
				root = self._root,
				el = Y.one('#' + iNode.id),
				dynLoader = root.get(DYNAMIC_LOADER);

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 754);
iNode.expanded = value = !!value;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 755);
if (dynLoader && !iNode.isLeaf && (!iNode.children  || !iNode.children.length)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 756);
this._loadDynamic();
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 757);
return;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 759);
if (iNode.children && iNode.children.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 760);
if (value) {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 761);
if (!iNode._childrenRendered) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 762);
self._renderChildren();
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 764);
el.replaceClass(CNAME_COLLAPSED, CNAME_EXPANDED);
				} else {
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 766);
el.replaceClass(CNAME_EXPANDED, CNAME_COLLAPSED);
				}
			}
            _yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 769);
el.set('aria-expanded', String(value));
		},
		/**
		 * Triggers the dynamic loading of children for this node.
		 * @method _loadDynamic
		 * @private
		 */
		_loadDynamic: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_loadDynamic", 776);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 777);
var self = this,
				root = self._root;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 779);
Y.one('#' + this.get('id')).replaceClass(CNAME_COLLAPSED, CNAME_LOADING);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 780);
root.get(DYNAMIC_LOADER).call(root, self, Y.bind(self._dynamicLoadReturn, self));

		},
		/**
		 * Callback for the dynamicLoader method.
		 * @method _dynamicLoadReturn
		 * @param response {Array} array of child iNodes
		 * @private
		 */
		_dynamicLoadReturn: function (response) {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_dynamicLoadReturn", 789);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 790);
var self = this,
				iNode = self._iNode,
				root = self._root;

			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 794);
if (response) {

				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 796);
iNode.children = response;
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 797);
root._initNodes(iNode);
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 798);
self._renderChildren();
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 800);
iNode.isLeaf = true;
			}
			// isLeaf might have been set in the response, not just in the line above.
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 803);
Y.one('#' + iNode.id).replaceClass(CNAME_LOADING, (iNode.isLeaf?CNAME_NOCHILDREN:CNAME_EXPANDED));
		},
		/**
		 * Renders the children of this node.
		 * It the children had been rendered, they will be replaced.
		 * @method _renderChildren
		 * @private
		 */
		_renderChildren: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_renderChildren", 811);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 812);
var s = '',
				iNode = this._iNode,
				depth = this.get('depth');
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 815);
iNode._childrenRendered = true;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 816);
this.forSomeChildren(function (fwNode, index, array) {
				_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "(anonymous 15)", 816);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 817);
s += fwNode._getHTML(index, array.length, depth + 1);
			});
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 819);
Y.one('#' + iNode.id + ' .' + CNAME_CHILDREN).setContent(s);
		},
		/**
		 * Prevents this instance from being returned to the pool and reused.
		 * Remember to {{#crossLink "release"}}{{/crossLink}} this instance when no longer needed.
		 * @method hold
		 * @chainable
		 */
		hold: function () {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "hold", 827);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 828);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "release", 837);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 838);
this._iNode._held = null;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 839);
this._root._poolReturn(this);
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 840);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getParent", 849);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 850);
var iNode = this._iNode._parent;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 851);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getNextSibling", 860);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 861);
var parent = this._iNode._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) + 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 864);
if (index === 0 || index > siblings.length) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 865);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 867);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getPreviousSibling", 876);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 877);
var parent = this._iNode._parent,
				siblings = (parent && parent.children) || [],
				index = siblings.indexOf(this) - 1;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 880);
if (index < 0) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 881);
return null;
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 883);
return this._root._poolFetch(siblings[index]);
		},
        /**
         * Sets the focus to this node.
         * @method focus
         * @chainable
         */
        focus: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "focus", 890);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 891);
return this._root.set(FOCUSED, this);
        },
        /**
         * Removes the focus from this node
         * @method blur
         * @chainable
         */
        blur: function () {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "blur", 898);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 899);
return this._root.set(FOCUSED, null);
        },
		/**
		 * Sugar method to toggle the expanded state of the node.
		 * @method toggle
		 * @chainable
		 */
		toggle: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "toggle", 906);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 907);
return this.set(EXPANDED, !this.get(EXPANDED));
		},
        /**
         * Sugar method to expand a node
         * @method expand
         * @chainable
         */
        expand: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "expand", 914);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 915);
return this.set(EXPANDED, true);
        },
        /**
         * Sugar method to collapse this node
         * @method collapse
         * @chainable
         */
        collapse: function() {
            _yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "collapse", 922);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 923);
return this.set(EXPANDED, false);
        },
		/**
		 * Returns true if this node is the root node
		 * @method isRoot
		 * @return {Boolean} true if root node
		 */
		isRoot: function() {
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "isRoot", 930);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 931);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_getStateVal", 942);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 943);
var iNode = this._iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 944);
if (this._state.get(name, BYPASS_PROXY) || !iNode) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 945);
return this._state.get(name, VALUE);
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 947);
if (iNode.hasOwnProperty(name)) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 948);
return iNode[name];
			}
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 950);
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
			_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "_setStateVal", 962);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 963);
var iNode = this._iNode;
			_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 964);
if (this._state.get(name, BYPASS_PROXY) || this._state.get(name, 'initializing') || !iNode) {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 965);
this._state.add(name, VALUE, value);
			} else {
				_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 967);
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
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 1104);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1105);
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
					_yuitest_coverfunc("build/gallery-flyweight-tree/gallery-flyweight-tree.js", "getter", 1152);
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1153);
var count = 0,
						iNode = this._iNode;
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1155);
while (iNode._parent) {
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1156);
count += 1;
						_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1157);
iNode = iNode._parent;
					}
					_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1159);
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
_yuitest_coverline("build/gallery-flyweight-tree/gallery-flyweight-tree.js", 1176);
Y.FlyweightTreeNode = FWNode;



}, '@VERSION@', {"requires": ["base-base", "base-build", "classnamemanager", "event-focus"], "skinnable": false});
