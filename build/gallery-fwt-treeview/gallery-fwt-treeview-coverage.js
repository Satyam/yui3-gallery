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
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].code=["YUI.add('gallery-fwt-treeview', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	// DOT = '.',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('fw-treeview', name);","	},","	CNAMES = {","		toggle: cName('toggle'),","		icon: cName('icon'),","		selection: cName('selection'),","		content: cName('content'),","		sel_prefix: cName('selected-state')","	},","	CBX = 'contentBox';","/** Creates a Treeview using the FlyweightTreeManager extension to handle its nodes."," * It creates the tree based on an object passed as the `tree` attribute in the constructor."," * @example"," *","	var tv = new Y.FWTreeView({tree: [","		{","			label:'label 0',","			children: [","				{","					label: 'label 0-0',","					children: [","						{label: 'label 0-0-0'},","						{label: 'label 0-0-1'}","					]","				},","				{label: 'label 0-1'}","			]","		},","		{label: 'label 1'}","","	]});","	tv.render('#container');"," * @module gallery-fwt-treeview"," * @class Y.FWTreeView"," * @extends Y.Widget"," * @uses Y.FlyweightTreeManager"," * @constructor"," * @param config {Object} Configuration attributes, amongst them:"," * @param config.tree {Array} Array of objects defining the first level of nodes."," * @param config.tree.label {String} Text of HTML markup to be shown in the node"," * @param [config.tree.expanded=true] {Boolean} Whether the children of this node should be visible."," * @param [config.tree.children] {Array} Further definitions for the children of this node"," * @param [config.tree.type=Y.FWTreeNode] {Y.FWTreeNode | String} Class used to create instances for this node."," * It can be a reference to an object or a name that can be resolved as `Y[name]`."," * @param [config.tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node."," * @param [config.tree.template] {String} Template for this particular node. "," */","Y.FWTreeView = Y.Base.create(","	'fw-treeview',","	Y.Widget,","	[Y.FlyweightTreeManager],","	{","		/**","		 * Widget lifecycle method","		 * @method initializer","		 * @param config {object} configuration object of which ","		 * `tree` contains the tree configuration.","		 */","		initializer: function (config) {","			this._domEvents = ['click'];","			this._loadConfig(config.tree);","		},","		/**","		 * Widget lifecyle method","		 * I opted for not including this method in FlyweightTreeManager so that","		 * it can be used to extend Base, not just Widget","		 * @method renderUI","		 * @protected","		 */","		renderUI: function () {","			this.get(CBX).setContent(this._getHTML());","		},","		/**","		 * Overrides the default CONTENT_TEMPLATE to make it an unordered list instead of a div","		 * @property CONTENT_TEMPLATE","		 * @type String","		 */","		CONTENT_TEMPLATE: '<ul></ul>'","","	},","	{","		ATTRS: {","			/**","			 * Override for the `defaultType` value of FlyweightTreeManager","			 * so it creates FWTreeNode instances instead of the default.","			 * @attribute defaultType","			 * @type String","			 * @default 'FWTreeNode'","			 */","			defaultType: {","				value: 'FWTreeNode'","			},","			toggleOnLabelClick: {","				value:false,","				validator:Lang.isBoolean","			}","","","		}","","	}",");","/** This class must not be generated directly.  "," *  Instances of it will be provided by Y.FWTreeView as required."," *  "," *  Subclasses might be defined based on it.  "," *  Usually, they will add further attributes and redefine the TEMPLATE to "," *  show those extra attributes."," *  "," *  @module gallery-fwt-treeview"," *    "," *  @class Y.FWTreeNode"," *  @extends Y.FlyweightTreeNode"," *  @constructor"," */"," Y.FWTreeNode = Y.Base.create(","	'fw-treenode',","	Y.FlyweightTreeNode,","	[],","	{","		initializer: function() {","			this.after('click', this._afterClick, this);","			this.after('selectedChange', this._afterSelectedChange, this);","		},","		/**","		 * Responds to the click event by toggling the node","		 * @method _afterClick","		 * @param ev {EventFacade}","		 * @private","		 */","		_afterClick: function (ev) {","			var target = ev.domEvent.target;","			if (target.hasClass(CNAMES.toggle)) {","				this.toggle();","			} else if ((target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) && this.get('root').get('toggleOnLabelClick')) {","				this.toggle();","			} else if (target.hasClass(CNAMES.selection)) {","				this.toggleSelection();","			}","		},","		/**","		 * Sugar method to toggle the selected state of a node.","		 * @method toggleSelection","		 */","		toggleSelection: function() {","			this.set('selected', (this.get('selected')?0:2));","		},","		/**","		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.","		 * @method _afterSelectedChange","		 * @param ev {EventFacade} out of which","		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'` so that propagation goes in just one direction and doesn't bounce back.","		 * @private","		 */","		_afterSelectedChange: function (ev) {","			var newVal = ev.newVal;","				","			if (!this.isRoot()) {","				Y.one('#' + this.get('id')).replaceClass('yui3-fw-treeview-selected-state-' + ev.prevVal,'yui3-fw-treeview-selected-state-' + newVal);","				if (this.get('propagateUp') && ev.src !== 'propagatingDown') {","					this.getParent()._childSelectedChange().release();","				}","			}","			if (this.get('propagateDown') && ev.src !== 'propagatingUp') {","				this.forEachChild(function(node) {","					node.set('selected' , newVal, 'propagatingDown');","				});","			}","		},","		/**","		 * When propagating selection up, it is called by a child when changing its selected state","		 * so that the parent adjusts its own state accordingly.","		 * @method _childSelectedChange","		 * @private","		 */","		_childSelectedChange: function () {","			var count = 0, selCount = 0;","			this.forEachChild(function (node) {","				count +=2;","				selCount += node.get('selected');","			});","			this.set('selected', (selCount === 0?0:(selCount === count?2:1)), {src:'propagatingUp'});","			return this;","		}","		","	},","	{","		/**","		 * Template to produce the markup for a node in the tree.","		 * @property TEMPLATE","		 * @type String","		 * @static","		 */","		TEMPLATE: Lang.sub('<li id=\"{id}\" class=\"{cname_node} {sel_prefix}-{selected}\"><div class=\"{toggle}\"></div><div class=\"{icon}\"></div><div class=\"{selection}\"></div><div class=\"{content}\">{label}</div><ul class=\"{cname_children}\">{children}</ul></li>', CNAMES),","		ATTRS: {","			/**","			 * Selected/highlighted state of the node. ","			 * It can be","			 * ","			 * - 0 not selected","			 * - 1 partially selected: some children are selected, some not or partially selected.","			 * - 2 fully selected.","			 * ","			 * The partially selected state can only be the result of selection propagating up from a child node.","			 * @attribute selected","			 * @type Integer","			 * @value 0","			 */","			selected: {","				value:0,","				validator:function (value) {","					return value === 0 || value === 1 || value === 2;","				}","			},","			/**","			 * Whether selection of one node should propagate to its parent.","			 * @attribute propagateUp","			 * @type Boolean","			 * @value true","			 */","			propagateUp: {","				value: true,","				validator: Lang.isBoolean","			},","			/**","			 * Whether selection of one node should propagate to its children.","			 * @attribute propagateDown","			 * @type Boolean","			 * @value true","			 */","			propagateDown: {","				value: true,","				validator: Lang.isBoolean","			}","		}","	}",");","","","","}, '@VERSION@', {\"requires\": [\"gallery-flyweight-tree\", \"widget\", \"base-build\"], \"skinnable\": true});"];
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].lines = {"1":0,"3":0,"5":0,"9":0,"56":0,"68":0,"69":0,"79":0,"124":0,"130":0,"131":0,"140":0,"141":0,"142":0,"143":0,"144":0,"145":0,"146":0,"154":0,"164":0,"166":0,"167":0,"168":0,"169":0,"172":0,"173":0,"174":0,"185":0,"186":0,"187":0,"188":0,"190":0,"191":0,"220":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].functions = {"cName:8":0,"initializer:67":0,"renderUI:78":0,"initializer:129":0,"_afterClick:139":0,"toggleSelection:153":0,"(anonymous 2):173":0,"_afterSelectedChange:163":0,"(anonymous 3):186":0,"_childSelectedChange:184":0,"validator:219":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredLines = 34;
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredFunctions = 12;
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
	CBX = 'contentBox';
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
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 56);
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
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 67);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 68);
this._domEvents = ['click'];
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 69);
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
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "renderUI", 78);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 79);
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
 _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 124);
Y.FWTreeNode = Y.Base.create(
	'fw-treenode',
	Y.FlyweightTreeNode,
	[],
	{
		initializer: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 129);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 130);
this.after('click', this._afterClick, this);
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 131);
this.after('selectedChange', this._afterSelectedChange, this);
		},
		/**
		 * Responds to the click event by toggling the node
		 * @method _afterClick
		 * @param ev {EventFacade}
		 * @private
		 */
		_afterClick: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterClick", 139);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 140);
var target = ev.domEvent.target;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 141);
if (target.hasClass(CNAMES.toggle)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 142);
this.toggle();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 143);
if ((target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) && this.get('root').get('toggleOnLabelClick')) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 144);
this.toggle();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 145);
if (target.hasClass(CNAMES.selection)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 146);
this.toggleSelection();
			}}}
		},
		/**
		 * Sugar method to toggle the selected state of a node.
		 * @method toggleSelection
		 */
		toggleSelection: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "toggleSelection", 153);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 154);
this.set('selected', (this.get('selected')?0:2));
		},
		/**
		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.
		 * @method _afterSelectedChange
		 * @param ev {EventFacade} out of which
		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'` so that propagation goes in just one direction and doesn't bounce back.
		 * @private
		 */
		_afterSelectedChange: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterSelectedChange", 163);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 164);
var newVal = ev.newVal;
				
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 166);
if (!this.isRoot()) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 167);
Y.one('#' + this.get('id')).replaceClass('yui3-fw-treeview-selected-state-' + ev.prevVal,'yui3-fw-treeview-selected-state-' + newVal);
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 168);
if (this.get('propagateUp') && ev.src !== 'propagatingDown') {
					_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 169);
this.getParent()._childSelectedChange().release();
				}
			}
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 172);
if (this.get('propagateDown') && ev.src !== 'propagatingUp') {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 173);
this.forEachChild(function(node) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 2)", 173);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 174);
node.set('selected' , newVal, 'propagatingDown');
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
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_childSelectedChange", 184);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 185);
var count = 0, selCount = 0;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 186);
this.forEachChild(function (node) {
				_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 3)", 186);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 187);
count +=2;
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 188);
selCount += node.get('selected');
			});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 190);
this.set('selected', (selCount === 0?0:(selCount === count?2:1)), {src:'propagatingUp'});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 191);
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
		ATTRS: {
			/**
			 * Selected/highlighted state of the node. 
			 * It can be
			 * 
			 * - 0 not selected
			 * - 1 partially selected: some children are selected, some not or partially selected.
			 * - 2 fully selected.
			 * 
			 * The partially selected state can only be the result of selection propagating up from a child node.
			 * @attribute selected
			 * @type Integer
			 * @value 0
			 */
			selected: {
				value:0,
				validator:function (value) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "validator", 219);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 220);
return value === 0 || value === 1 || value === 2;
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
