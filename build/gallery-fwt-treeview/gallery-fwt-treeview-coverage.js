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
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-fwt-treeview/gallery-fwt-treeview.js",
    code: []
};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].code=["YUI.add('gallery-fwt-treeview', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	// DOT = '.',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('fw-treeview', name);","	},","	CNAMES = {","		toggle: cName('toggle'),","		icon: cName('icon'),","		selection: cName('selection'),","		content: cName('content'),","		sel_prefix: cName('selected-state')","	},","	CBX = 'contentBox',","	NOT_SELECTED = 0,","	PARTIALLY_SELECTED = 1,","	FULLY_SELECTED = 2;","/** Creates a Treeview using the FlyweightTreeManager extension to handle its nodes."," * It creates the tree based on an object passed as the `tree` attribute in the constructor."," * @example"," *","	var tv = new Y.FWTreeView({tree: [","		{","			label:'label 0',","			children: [","				{","					label: 'label 0-0',","					children: [","						{label: 'label 0-0-0'},","						{label: 'label 0-0-1'}","					]","				},","				{label: 'label 0-1'}","			]","		},","		{label: 'label 1'}","","	]});","	tv.render('#container');"," * @module gallery-fwt-treeview"," * @class Y.FWTreeView"," * @extends Y.Widget"," * @uses Y.FlyweightTreeManager"," * @constructor"," * @param config {Object} Configuration attributes, amongst them:"," * @param config.tree {Array} Array of objects defining the first level of nodes."," * @param config.tree.label {String} Text of HTML markup to be shown in the node"," * @param [config.tree.expanded=true] {Boolean} Whether the children of this node should be visible."," * @param [config.tree.children] {Array} Further definitions for the children of this node"," * @param [config.tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node."," * It can be a reference to an object or a name that can be resolved as `Y[name]`."," * @param [config.tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node."," * @param [config.tree.template] {String} Template for this particular node. "," */","Y.FWTreeView = Y.Base.create(","	'fw-treeview',","	Y.Widget,","	[Y.FlyweightTreeManager],","	{","		/**","		 * Widget lifecycle method","		 * @method initializer","		 * @param config {object} configuration object of which ","		 * `tree` contains the tree configuration.","		 */","		initializer: function (config) {","			this._domEvents = ['click'];","			this._loadConfig(config.tree);","		},","		/**","		 * Widget lifecyle method","		 * I opted for not including this method in FlyweightTreeManager so that","		 * it can be used to extend Base, not just Widget","		 * @method renderUI","		 * @protected","		 */","		renderUI: function () {","			this.get(CBX).setContent(this._getHTML());","		},","		/**","		 * Overrides the default CONTENT_TEMPLATE to make it an unordered list instead of a div","		 * @property CONTENT_TEMPLATE","		 * @type String","		 */","		CONTENT_TEMPLATE: '<ul></ul>'","","	},","	{","		ATTRS: {","			/**","			 * Override for the `defaultType` value of FlyweightTreeManager","			 * so it creates FWTreeNode instances instead of the default.","			 * @attribute defaultType","			 * @type String","			 * @default 'FWTreeNode'","			 */","			defaultType: {","				value: 'FWTreeNode'","			},","			/**","			 * Enables toggling by clicking on the label item instead of just the toggle icon.","			 * @attribute toggleOnLabelClick","			 * @type Boolean","			 * @value false","			 */","			toggleOnLabelClick: {","				value:false,","				validator:Lang.isBoolean","			}","","","		}","","	}",");","/** This class must not be generated directly.  "," *  Instances of it will be provided by Y.FWTreeView as required."," *  "," *  Subclasses might be defined based on it.  "," *  Usually, they will add further attributes and redefine the TEMPLATE to "," *  show those extra attributes."," *  "," *  @module gallery-fwt-treeview"," *    "," *  @class Y.FWTreeNode"," *  @extends Y.FlyweightTreeNode"," *  @constructor"," */"," Y.FWTreeNode = Y.Base.create(","	'fw-treenode',","	Y.FlyweightTreeNode,","	[],","	{","		initializer: function() {","			this.after('click', this._afterClick, this);","			this.after('selectedChange', this._afterSelectedChange, this);","		},","		/**","		 * Responds to the click event by toggling the node","		 * @method _afterClick","		 * @param ev {EventFacade}","		 * @private","		 */","		_afterClick: function (ev) {","			var target = ev.domEvent.target;","			if (target.hasClass(CNAMES.toggle)) {","				this.toggle();","			} else if (target.hasClass(CNAMES.selection)) {","				this.toggleSelection();","			} else if (target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) {","				if (this.get('root').get('toggleOnLabelClick')) {","					this.toggle();","				}","			}","		},","		/**","		 * Sugar method to toggle the selected state of a node.","		 * @method toggleSelection","		 */","		toggleSelection: function() {","			this.set('selected', (this.get('selected')?NOT_SELECTED:FULLY_SELECTED));","		},","		/**","		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.","		 * @method _afterSelectedChange","		 * @param ev {EventFacade} out of which","		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'` so that propagation goes in just one direction and doesn't bounce back.","		 * @private","		 */","		_afterSelectedChange: function (ev) {","			var selected = ev.newVal;","				","			if (!this.isRoot()) {","				Y.one('#' + this.get('id')).replaceClass('yui3-fw-treeview-selected-state-' + ev.prevVal,'yui3-fw-treeview-selected-state-' + selected);","				if (this.get('propagateUp') && ev.src !== 'propagatingDown') {","					this.getParent()._childSelectedChange().release();","				}","			}","			if (this.get('propagateDown') && ev.src !== 'propagatingUp') {","				this.forSomeChildren(function(node) {","					node.set('selected' , selected, 'propagatingDown');","				});","			}","		},","		/**","		 * Overrides the original in Y.FlyweightTreeNode so as to propagate the selected state","		 * on dynamically loaded nodes.","		 * @method _dynamicLoadReturn","		 * @private","		 */","		_dynamicLoadReturn: function () {","			 Y.FWTreeNode.superclass._dynamicLoadReturn.apply(this, arguments);","			 if (this.get('propagateDown')) {","				var selected = this.get('selected');","				this.forSomeChildren(function(node) {","					node.set('selected' , selected, 'propagatingDown');","				});","			}","			 ","		},","		/**","		 * When propagating selection up, it is called by a child when changing its selected state","		 * so that the parent adjusts its own state accordingly.","		 * @method _childSelectedChange","		 * @private","		 */","		_childSelectedChange: function () {","			var count = 0, selCount = 0;","			this.forSomeChildren(function (node) {","				count +=2;","				selCount += node.get('selected');","			});","			this.set('selected', (selCount === 0?NOT_SELECTED:(selCount === count?FULLY_SELECTED:PARTIALLY_SELECTED)), {src:'propagatingUp'});","			return this;","		}","		","	},","	{","		/**","		 * Template to produce the markup for a node in the tree.","		 * @property TEMPLATE","		 * @type String","		 * @static","		 */","		TEMPLATE: Lang.sub('<li id=\"{id}\" class=\"{cname_node} {sel_prefix}-{selected}\"><div class=\"{toggle}\"></div><div class=\"{icon}\"></div><div class=\"{selection}\"></div><div class=\"{content}\">{label}</div><ul class=\"{cname_children}\">{children}</ul></li>', CNAMES),","		/**","		 * Constant to use with the `selected` attribute to indicate the node is not selected.","		 * @property NOT_SELECTED","		 * @type integer","		 * @value 0","		 * @static","		 * @final","		 */","		NOT_SELECTED:NOT_SELECTED,","		/**","		 * Constant to use with the `selected` attribute to indicate some ","		 * but not all of the children of this node are selected.","		 * This state should only be acquired by upward propagation from descendants.","		 * @property PARTIALLY_SELECTED","		 * @type integer","		 * @value 1","		 * @static","		 * @final","		 */","		PARTIALLY_SELECTED:PARTIALLY_SELECTED,","		/**","		 * Constant to use with the `selected` attribute to indicate the node is selected.","		 * @property FULLY_SELECTED","		 * @type integer","		 * @value 2","		 * @static","		 * @final","		 */","		FULLY_SELECTED:FULLY_SELECTED,","		ATTRS: {","			/**","			 * Selected/highlighted state of the node. ","			 * It can be","			 * ","			 * - Y.FWTreeNode.NOT_SELECTED (0) not selected","			 * - Y.FWTreeNode.PARTIALLY_SELECTED (1) partially selected: some children are selected, some not or partially selected.","			 * - Y.FWTreeNode.FULLY_SELECTED (2) fully selected.","			 * ","			 * The partially selected state can only be the result of selection propagating up from a child node.","			 * The attribute might return PARTIALLY_SELECTED but the developer should never set that value.","			 * @attribute selected","			 * @type Integer","			 * @value NOT_SELECTED","			 */","			selected: {","				value:NOT_SELECTED,","				validator:function (value) {","					return value === NOT_SELECTED || value === FULLY_SELECTED || value === PARTIALLY_SELECTED;","				}","			},","			/**","			 * Whether selection of one node should propagate to its parent.","			 * @attribute propagateUp","			 * @type Boolean","			 * @value true","			 */","			propagateUp: {","				value: true,","				validator: Lang.isBoolean","			},","			/**","			 * Whether selection of one node should propagate to its children.","			 * @attribute propagateDown","			 * @type Boolean","			 * @value true","			 */","			propagateDown: {","				value: true,","				validator: Lang.isBoolean","			}","		}","	}",");","","","","}, '@VERSION@', {\"requires\": [\"gallery-flyweight-tree\", \"widget\", \"base-build\"], \"skinnable\": true});"];
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].lines = {"1":0,"3":0,"5":0,"9":0,"59":0,"71":0,"72":0,"82":0,"133":0,"139":0,"140":0,"149":0,"150":0,"151":0,"152":0,"153":0,"154":0,"155":0,"156":0,"165":0,"175":0,"177":0,"178":0,"179":0,"180":0,"183":0,"184":0,"185":0,"196":0,"197":0,"198":0,"199":0,"200":0,"212":0,"213":0,"214":0,"215":0,"217":0,"218":0,"277":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].functions = {"cName:8":0,"initializer:70":0,"renderUI:81":0,"initializer:138":0,"_afterClick:148":0,"toggleSelection:164":0,"(anonymous 2):184":0,"_afterSelectedChange:174":0,"(anonymous 3):199":0,"_dynamicLoadReturn:195":0,"(anonymous 4):213":0,"_childSelectedChange:211":0,"validator:276":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredLines = 40;
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredFunctions = 14;
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 1);
YUI.add('gallery-fwt-treeview', function (Y, NAME) {

_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 3);
'use strict';
/*jslint white: true */
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 5);
var Lang = Y.Lang,
	// DOT = '.',
	getCName = Y.ClassNameManager.getClassName,
	cName = function (name) {
		_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "cName", 8);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 9);
return getCName('fw-treeview', name);
	},
	CNAMES = {
		toggle: cName('toggle'),
		icon: cName('icon'),
		selection: cName('selection'),
		content: cName('content'),
		sel_prefix: cName('selected-state')
	},
	CBX = 'contentBox',
	NOT_SELECTED = 0,
	PARTIALLY_SELECTED = 1,
	FULLY_SELECTED = 2;
/** Creates a Treeview using the FlyweightTreeManager extension to handle its nodes.
 * It creates the tree based on an object passed as the `tree` attribute in the constructor.
 * @example
 *
	var tv = new Y.FWTreeView({tree: [
		{
			label:'label 0',
			children: [
				{
					label: 'label 0-0',
					children: [
						{label: 'label 0-0-0'},
						{label: 'label 0-0-1'}
					]
				},
				{label: 'label 0-1'}
			]
		},
		{label: 'label 1'}

	]});
	tv.render('#container');
 * @module gallery-fwt-treeview
 * @class Y.FWTreeView
 * @extends Y.Widget
 * @uses Y.FlyweightTreeManager
 * @constructor
 * @param config {Object} Configuration attributes, amongst them:
 * @param config.tree {Array} Array of objects defining the first level of nodes.
 * @param config.tree.label {String} Text of HTML markup to be shown in the node
 * @param [config.tree.expanded=true] {Boolean} Whether the children of this node should be visible.
 * @param [config.tree.children] {Array} Further definitions for the children of this node
 * @param [config.tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node.
 * It can be a reference to an object or a name that can be resolved as `Y[name]`.
 * @param [config.tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node.
 * @param [config.tree.template] {String} Template for this particular node. 
 */
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 59);
Y.FWTreeView = Y.Base.create(
	'fw-treeview',
	Y.Widget,
	[Y.FlyweightTreeManager],
	{
		/**
		 * Widget lifecycle method
		 * @method initializer
		 * @param config {object} configuration object of which 
		 * `tree` contains the tree configuration.
		 */
		initializer: function (config) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 70);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 71);
this._domEvents = ['click'];
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 72);
this._loadConfig(config.tree);
		},
		/**
		 * Widget lifecyle method
		 * I opted for not including this method in FlyweightTreeManager so that
		 * it can be used to extend Base, not just Widget
		 * @method renderUI
		 * @protected
		 */
		renderUI: function () {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "renderUI", 81);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 82);
this.get(CBX).setContent(this._getHTML());
		},
		/**
		 * Overrides the default CONTENT_TEMPLATE to make it an unordered list instead of a div
		 * @property CONTENT_TEMPLATE
		 * @type String
		 */
		CONTENT_TEMPLATE: '<ul></ul>'

	},
	{
		ATTRS: {
			/**
			 * Override for the `defaultType` value of FlyweightTreeManager
			 * so it creates FWTreeNode instances instead of the default.
			 * @attribute defaultType
			 * @type String
			 * @default 'FWTreeNode'
			 */
			defaultType: {
				value: 'FWTreeNode'
			},
			/**
			 * Enables toggling by clicking on the label item instead of just the toggle icon.
			 * @attribute toggleOnLabelClick
			 * @type Boolean
			 * @value false
			 */
			toggleOnLabelClick: {
				value:false,
				validator:Lang.isBoolean
			}


		}

	}
);
/** This class must not be generated directly.  
 *  Instances of it will be provided by Y.FWTreeView as required.
 *  
 *  Subclasses might be defined based on it.  
 *  Usually, they will add further attributes and redefine the TEMPLATE to 
 *  show those extra attributes.
 *  
 *  @module gallery-fwt-treeview
 *    
 *  @class Y.FWTreeNode
 *  @extends Y.FlyweightTreeNode
 *  @constructor
 */
 _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 133);
Y.FWTreeNode = Y.Base.create(
	'fw-treenode',
	Y.FlyweightTreeNode,
	[],
	{
		initializer: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 138);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 139);
this.after('click', this._afterClick, this);
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 140);
this.after('selectedChange', this._afterSelectedChange, this);
		},
		/**
		 * Responds to the click event by toggling the node
		 * @method _afterClick
		 * @param ev {EventFacade}
		 * @private
		 */
		_afterClick: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterClick", 148);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 149);
var target = ev.domEvent.target;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 150);
if (target.hasClass(CNAMES.toggle)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 151);
this.toggle();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 152);
if (target.hasClass(CNAMES.selection)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 153);
this.toggleSelection();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 154);
if (target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 155);
if (this.get('root').get('toggleOnLabelClick')) {
					_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 156);
this.toggle();
				}
			}}}
		},
		/**
		 * Sugar method to toggle the selected state of a node.
		 * @method toggleSelection
		 */
		toggleSelection: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "toggleSelection", 164);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 165);
this.set('selected', (this.get('selected')?NOT_SELECTED:FULLY_SELECTED));
		},
		/**
		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.
		 * @method _afterSelectedChange
		 * @param ev {EventFacade} out of which
		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'` so that propagation goes in just one direction and doesn't bounce back.
		 * @private
		 */
		_afterSelectedChange: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterSelectedChange", 174);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 175);
var selected = ev.newVal;
				
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 177);
if (!this.isRoot()) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 178);
Y.one('#' + this.get('id')).replaceClass('yui3-fw-treeview-selected-state-' + ev.prevVal,'yui3-fw-treeview-selected-state-' + selected);
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 179);
if (this.get('propagateUp') && ev.src !== 'propagatingDown') {
					_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 180);
this.getParent()._childSelectedChange().release();
				}
			}
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 183);
if (this.get('propagateDown') && ev.src !== 'propagatingUp') {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 184);
this.forSomeChildren(function(node) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 2)", 184);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 185);
node.set('selected' , selected, 'propagatingDown');
				});
			}
		},
		/**
		 * Overrides the original in Y.FlyweightTreeNode so as to propagate the selected state
		 * on dynamically loaded nodes.
		 * @method _dynamicLoadReturn
		 * @private
		 */
		_dynamicLoadReturn: function () {
			 _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_dynamicLoadReturn", 195);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 196);
Y.FWTreeNode.superclass._dynamicLoadReturn.apply(this, arguments);
			 _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 197);
if (this.get('propagateDown')) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 198);
var selected = this.get('selected');
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 199);
this.forSomeChildren(function(node) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 3)", 199);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 200);
node.set('selected' , selected, 'propagatingDown');
				});
			}
			 
		},
		/**
		 * When propagating selection up, it is called by a child when changing its selected state
		 * so that the parent adjusts its own state accordingly.
		 * @method _childSelectedChange
		 * @private
		 */
		_childSelectedChange: function () {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_childSelectedChange", 211);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 212);
var count = 0, selCount = 0;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 213);
this.forSomeChildren(function (node) {
				_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 4)", 213);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 214);
count +=2;
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 215);
selCount += node.get('selected');
			});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 217);
this.set('selected', (selCount === 0?NOT_SELECTED:(selCount === count?FULLY_SELECTED:PARTIALLY_SELECTED)), {src:'propagatingUp'});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 218);
return this;
		}
		
	},
	{
		/**
		 * Template to produce the markup for a node in the tree.
		 * @property TEMPLATE
		 * @type String
		 * @static
		 */
		TEMPLATE: Lang.sub('<li id="{id}" class="{cname_node} {sel_prefix}-{selected}"><div class="{toggle}"></div><div class="{icon}"></div><div class="{selection}"></div><div class="{content}">{label}</div><ul class="{cname_children}">{children}</ul></li>', CNAMES),
		/**
		 * Constant to use with the `selected` attribute to indicate the node is not selected.
		 * @property NOT_SELECTED
		 * @type integer
		 * @value 0
		 * @static
		 * @final
		 */
		NOT_SELECTED:NOT_SELECTED,
		/**
		 * Constant to use with the `selected` attribute to indicate some 
		 * but not all of the children of this node are selected.
		 * This state should only be acquired by upward propagation from descendants.
		 * @property PARTIALLY_SELECTED
		 * @type integer
		 * @value 1
		 * @static
		 * @final
		 */
		PARTIALLY_SELECTED:PARTIALLY_SELECTED,
		/**
		 * Constant to use with the `selected` attribute to indicate the node is selected.
		 * @property FULLY_SELECTED
		 * @type integer
		 * @value 2
		 * @static
		 * @final
		 */
		FULLY_SELECTED:FULLY_SELECTED,
		ATTRS: {
			/**
			 * Selected/highlighted state of the node. 
			 * It can be
			 * 
			 * - Y.FWTreeNode.NOT_SELECTED (0) not selected
			 * - Y.FWTreeNode.PARTIALLY_SELECTED (1) partially selected: some children are selected, some not or partially selected.
			 * - Y.FWTreeNode.FULLY_SELECTED (2) fully selected.
			 * 
			 * The partially selected state can only be the result of selection propagating up from a child node.
			 * The attribute might return PARTIALLY_SELECTED but the developer should never set that value.
			 * @attribute selected
			 * @type Integer
			 * @value NOT_SELECTED
			 */
			selected: {
				value:NOT_SELECTED,
				validator:function (value) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "validator", 276);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 277);
return value === NOT_SELECTED || value === FULLY_SELECTED || value === PARTIALLY_SELECTED;
				}
			},
			/**
			 * Whether selection of one node should propagate to its parent.
			 * @attribute propagateUp
			 * @type Boolean
			 * @value true
			 */
			propagateUp: {
				value: true,
				validator: Lang.isBoolean
			},
			/**
			 * Whether selection of one node should propagate to its children.
			 * @attribute propagateDown
			 * @type Boolean
			 * @value true
			 */
			propagateDown: {
				value: true,
				validator: Lang.isBoolean
			}
		}
	}
);



}, '@VERSION@', {"requires": ["gallery-flyweight-tree", "widget", "base-build"], "skinnable": true});
