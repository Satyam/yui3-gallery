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
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].code=["YUI.add('gallery-fwt-treeview', function (Y, NAME) {","","'use strict';","/*jslint white: true */","var Lang = Y.Lang,","	YArray = Y.Array,","	// DOT = '.',","	getCName = Y.ClassNameManager.getClassName,","	cName = function (name) {","		return getCName('fw-treeview', name);","	},","	CNAMES = {","		cname_toggle: cName('toggle'),","		cname_icon: cName('icon'),","		cname_selection: cName('selection'),","		// cname_content: cName('content'),","		cname_sel_prefix: cName('selected-state'),","        cname_label: cName('label')","	},","	CBX = 'contentBox',","    EXPANDED = 'expanded',","    SELECTED = 'selected',","    CHANGE = 'Change',","	NOT_SELECTED = 0,","	PARTIALLY_SELECTED = 1,","	FULLY_SELECTED = 2;","/** Creates a Treeview using the FlyweightTreeManager extension to handle its nodes."," * It creates the tree based on an object passed as the `tree` attribute in the constructor."," * @example"," *","	var tv = new Y.FWTreeView({tree: [","		{","			label:'label 0',","			children: [","				{","					label: 'label 0-0',","					children: [","						{label: 'label 0-0-0'},","						{label: 'label 0-0-1'}","					]","				},","				{label: 'label 0-1'}","			]","		},","		{label: 'label 1'}","","	]});","	tv.render('#container');",""," * @module gallery-fwt-treeview"," */","/**"," * @class FWTreeView"," * @extends Widget"," * @uses FlyweightTreeManager"," * @constructor"," * @param config {Object} Configuration attributes, amongst them:"," * @param config.tree {Array} Array of objects defining the first level of nodes."," * @param config.tree.label {String} Text of HTML markup to be shown in the node"," * @param [config.tree.expanded=true] {Boolean} Whether the children of this node should be visible."," * @param [config.tree.children] {Array} Further definitions for the children of this node"," * @param [config.tree.type=FWTreeNode] {FWTreeNode | String} Class used to create instances for this node."," * It can be a reference to an object or a name that can be resolved as `Y[name]`."," * @param [config.tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node."," * @param [config.tree.template] {String} Template for this particular node."," */","Y.FWTreeView = Y.Base.create(","	'fw-treeview',","	Y.Widget,","	[Y.FlyweightTreeManager],","	{","        /**","         * Array of iNodes containing a flat list of all nodes visible regardless","         * of their depth in the tree.","         * Used to handle keyboard navigation.","         * @property _visibleSequence","         * @type Array or null","         * @default null","         * @private","         */","        _visibleSequence: null,","        /**","         * Index, within {{#crossLink \"_visibleSequence\"}}{{/crossLink}}, of the iNode having the focus.","         * Used for keyboard navigation.","         * @property _visibleIndex","         * @type Integer","         * @default null","         * @private","         */","        _visibleIndex: null,","		/**","		 * Widget lifecycle method","		 * @method initializer","		 * @param config {object} configuration object of which","		 * `tree` contains the tree configuration.","		 */","		initializer: function (config) {","			this._domEvents = ['click'];","			this._loadConfig(config.tree);","		},","		/**","		 * Widget lifecyle method","		 * I opted for not including this method in FlyweightTreeManager so that","		 * it can be used to extend Base, not just Widget","		 * @method renderUI","		 * @protected","		 */","		renderUI: function () {","			var cbx = this.get(CBX);","            cbx.setContent(this._getHTML());","            cbx.set('role','tree');","		},","		/**","		 * Widget lifecyle method","		 * I opted for not including this method in FlyweightTreeManager so that","		 * it can be used to extend Base, not just Widget","		 * @method renderUI","		 * @protected","		 */","        bindUI: function () {","            this.get(CBX).on('keydown', this._onKeyDown, this);","        },","        /**","         * Listener for keyboard events to handle keyboard navigation","         * @method _onKeyDown","         * @param ev {EventFacade} Standard YUI key facade","         * @private","         */","        _onKeyDown: function (ev) {","            var ch = ev.charCode,","                iNode = this._focusedINode,","                seq = this._visibleSequence,","                index = this._visibleIndex,","                fwNode;","","            switch (ch) {","                case 38: // up","                    if (!seq) {","                        seq = this._rebuildSequence();","                        index = seq.indexOf(iNode);","                    }","                    index -=1;","                    if (index >= 0) {","                        iNode = seq[index];","                        this._visibleIndex = index;","                    } else {","                        iNode = null;","                    }","                    break;","                case 39: // right","                    if (iNode.expanded) {","                        if (iNode.children && iNode.children.length) {","                            iNode = iNode.children[0];","                        } else {","                            iNode = null;","                        }","                    } else {","                        this._poolReturn(this._poolFetch(iNode).set(EXPANDED, true));","                        iNode = null;","                    }","","                    break;","                case 40: // down","                    if (!seq) {","                        seq = this._rebuildSequence();","                        index = seq.indexOf(iNode);","                    }","                    index +=1;","                    if (index < seq.length) {","                        iNode = seq[index];","                        this._visibleIndex = index;","                    } else {","                        iNode = null;","                    }","                    break;","                case 37: // left","                    if (iNode.expanded && iNode.children) {","                        this._poolReturn(this._poolFetch(iNode).set(EXPANDED, false));","                        iNode = null;","                    } else {","                        iNode = iNode._parent;","                        if (iNode === this._tree) {","                            iNode = null;","                        }","                    }","","                    break;","                case 36: // home","                    iNode = this._tree.children && this._tree.children[0];","                    break;","                case 35: // end","                    index = this._tree.children && this._tree.children.length;","                    if (index) {","                        iNode = this._tree.children[index -1];","                    } else {","                        iNode = null;","                    }","                    break;","                case 13: // enter","                    fwNode = this._poolFetch(iNode);","                    fwNode.fire('enterkey', {domEvent:ev});","                    this._poolReturn(fwNode);","                    iNode = null;","                    break;","                case 32: // spacebar","                    fwNode = this._poolFetch(iNode);","                    fwNode.fire('spacebar', {domEvent:ev});","                    this._poolReturn(fwNode);","                    iNode = null;","                    break;","                case 106: // asterisk on the numeric keypad","                    this.expandAll();","                    break;","                default: // initial","                    iNode = null;","                    break;","            }","            if (iNode) {","                this._focusOnINode(iNode);","                ev.halt();","                return false;","            }","            return true;","        },","        /**","         * Listener for the focus event.","         * Updates the node receiving the focus when the widget gets the focus.","         * @method _aferFocus","         * @param ev {EventFacade} Standard event facade","         * @private","         */","        _afterFocus: function (ev) {","            var iNode = this._findINodeByElement(ev.domEvent.target);","            this._focusOnINode(iNode);","            if (this._visibleSequence) {","                this._visibleIndex = this._visibleSequence.indexOf(iNode);","            }","        },","        /**","         * Rebuilds the array of {{#crossLink \"_visibleSequence\"}}{{/crossLink}} that can be traversed with the up/down arrow keys","         * @method _rebuildSequence","         * @private","         */","        _rebuildSequence: function () {","            var seq = [],","                loop = function(iNode) {","                    YArray.each(iNode.children || [], function(childINode) {","                        seq.push(childINode);","                        if (childINode.expanded) {","                            loop(childINode);","                        }","                    });","                };","            loop(this._tree);","            return (this._visibleSequence = seq);","","        },","		/**","		 * Overrides the default CONTENT_TEMPLATE to make it an unordered list instead of a div","		 * @property CONTENT_TEMPLATE","		 * @type String","		 */","		CONTENT_TEMPLATE: '<ul></ul>'","","	},","	{","		ATTRS: {","			/**","			 * Override for the `defaultType` value of FlyweightTreeManager","			 * so it creates FWTreeNode instances instead of the default.","			 * @attribute defaultType","			 * @type String","			 * @default 'FWTreeNode'","			 */","			defaultType: {","				value: 'FWTreeNode'","			},","			/**","			 * Enables toggling by clicking on the label item instead of just the toggle icon.","			 * @attribute toggleOnLabelClick","			 * @type Boolean","			 * @value false","			 */","			toggleOnLabelClick: {","				value:false,","				validator:Lang.isBoolean","			}","","","		}","","	}",");","/** This class must not be generated directly."," *  Instances of it will be provided by FWTreeView as required."," *"," *  Subclasses might be defined based on it."," *  Usually, they will add further attributes and redefine the TEMPLATE to"," *  show those extra attributes."," *"," *  @module gallery-fwt-treeview"," */","/**"," *"," *  @class FWTreeNode"," *  @extends FlyweightTreeNode"," *  @constructor"," */"," Y.FWTreeNode = Y.Base.create(","	'fw-treenode',","	Y.FlyweightTreeNode,","	[],","	{","		initializer: function() {","			this.after('click', this._afterClick);","			this.after(SELECTED + CHANGE, this._afterSelectedChange);","            this.after('spacebar', this.toggleSelection);","            this.after(EXPANDED + CHANGE, this._afterExpandedChanged);","		},","        /**","         * Listens to changes in the expanded attribute to invalidate and force","         * a rebuild of the list of visible nodes","         * the user can navigate through via the keyboard.","         * @method _afterExpandedChanged","         * @protected","         */","        _afterExpandedChanged: function () {","            this._root._visibleSequence = null;","        },","		/**","		 * Responds to the click event by toggling the node","		 * @method _afterClick","		 * @param ev {EventFacade}","		 * @private","		 */","		_afterClick: function (ev) {","			var target = ev.domEvent.target;","			if (target.hasClass(CNAMES.cname_toggle)) {","				this.toggle();","			} else if (target.hasClass(CNAMES.cname_selection)) {","				this.toggleSelection();","			} else if (target.hasClass(CNAMES.cname_content) || target.hasClass(CNAMES.cname_icon)) {","				if (this.get('root').get('toggleOnLabelClick')) {","					this.toggle();","				}","			}","		},","		/**","		 * Sugar method to toggle the selected state of a node.","         * See {{#crossLink \"selected:attribute\"}}{{/crossLink}}.","		 * @method toggleSelection","		 */","		toggleSelection: function() {","			this.set(SELECTED, (this.get(SELECTED)?NOT_SELECTED:FULLY_SELECTED));","		},","		/**","		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.","		 * @method _afterSelectedChange","		 * @param ev {EventFacade} out of which","		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'`","         * so that propagation goes in just one direction and doesn't bounce back.","		 * @private","		 */","		_afterSelectedChange: function (ev) {","			var selected = ev.newVal,","                prefix = CNAMES.cname_sel_prefix + '-',","                el;","","			if (!this.isRoot()) {","				el = Y.one('#' + this.get('id'));","                el.replaceClass(prefix + ev.prevVal, prefix + selected);","                el.set('aria-checked', this._ariaCheckedGetter());","				if (this.get('propagateUp') && ev.src !== 'propagatingDown') {","					this.getParent()._childSelectedChange().release();","				}","			}","			if (this.get('propagateDown') && ev.src !== 'propagatingUp') {","				this.forSomeChildren(function(node) {","					node.set(SELECTED , selected, 'propagatingDown');","				});","			}","		},","        /**","         * Getter for the {{#crossLink \"_aria_checked:attribute\"}}{{/crossLink}}.","         * Translate the internal {{#crossLink \"selected:attribute\"}}{{/crossLink}}","         * to the strings the `aria_checked` attribute expects","         * @method _ariaCheckedGetter","         * @return {String} One of 'false', 'true' or 'mixed'","         * @private","         */","        _ariaCheckedGetter: function () {","            return ['false','mixed','true'][this.get(SELECTED)];","        },","		/**","		 * Overrides the original in FlyweightTreeNode so as to propagate the selected state","		 * on dynamically loaded nodes.","		 * @method _dynamicLoadReturn","		 * @private","		 */","		_dynamicLoadReturn: function () {","            Y.FWTreeNode.superclass._dynamicLoadReturn.apply(this, arguments);","			if (this.get('propagateDown')) {","				var selected = this.get(SELECTED);","				this.forSomeChildren(function(node) {","					node.set(SELECTED , selected, 'propagatingDown');","				});","			}","            this._root._visibleSequence = null;","","		},","		/**","		 * When propagating selection up, it is called by a child when changing its selected state","		 * so that the parent adjusts its own state accordingly.","		 * @method _childSelectedChange","		 * @private","		 */","		_childSelectedChange: function () {","			var count = 0, selCount = 0;","			this.forSomeChildren(function (node) {","				count +=2;","				selCount += node.get(SELECTED);","			});","			this.set(SELECTED, (selCount === 0?NOT_SELECTED:(selCount === count?FULLY_SELECTED:PARTIALLY_SELECTED)), {src:'propagatingUp'});","			return this;","		}","","	},","	{","		/**","		 * Template to produce the markup for a node in the tree.","		 * @property TEMPLATE","		 * @type String","		 * @static","		 */","		TEMPLATE: Lang.sub(","            '<li id=\"{id}\" class=\"{cname_node} {cname_sel_prefix}-{selected}\" ' +","                'role=\"treeitem\" aria-expanded=\"{expanded}\" aria-checked=\"{_aria_checked}\">' +","            '<div tabIndex=\"{tabIndex}\" class=\"{cname_content}\"><div class=\"{cname_toggle}\"></div>' +","            '<div class=\"{cname_icon}\"></div><div class=\"{cname_selection}\"></div><div class=\"{cname_label}\">{label}</div></div>' +","            '<ul class=\"{cname_children}\" role=\"group\">{children}</ul></li>', CNAMES),","		/**","		 * Constant to use with the `selected` attribute to indicate the node is not selected.","		 * @property NOT_SELECTED","		 * @type integer","		 * @value 0","		 * @static","		 * @final","		 */","		NOT_SELECTED:NOT_SELECTED,","		/**","		 * Constant to use with the `selected` attribute to indicate some","		 * but not all of the children of this node are selected.","		 * This state should only be acquired by upward propagation from descendants.","		 * @property PARTIALLY_SELECTED","		 * @type integer","		 * @value 1","		 * @static","		 * @final","		 */","		PARTIALLY_SELECTED:PARTIALLY_SELECTED,","		/**","		 * Constant to use with the `selected` attribute to indicate the node is selected.","		 * @property FULLY_SELECTED","		 * @type integer","		 * @value 2","		 * @static","		 * @final","		 */","		FULLY_SELECTED:FULLY_SELECTED,","		ATTRS: {","			/**","			 * Selected/highlighted state of the node.","             *","             * The node selection mechanism is always enabled though it might not be visible.","             * It only sets a suitable className on the tree node.","             * The module is provided with a default CSS style that makes node selection visible.","             * To enable it, add the `yui3-fw-treeview-checkbox` className to the container of the tree.","             *","			 * `selected` can be","			 *","			 * - Y.FWTreeNode.NOT_SELECTED (0) not selected","			 * - Y.FWTreeNode.PARTIALLY_SELECTED (1) partially selected: some children are selected, some not or partially selected.","			 * - Y.FWTreeNode.FULLY_SELECTED (2) fully selected.","			 *","			 * The partially selected state can only be the result of selection propagating up from a child node.","			 * The attribute might return PARTIALLY_SELECTED but the developer should never set that value.","			 * @attribute selected","			 * @type Integer","			 * @value NOT_SELECTED","			 */","			selected: {","				value:NOT_SELECTED,","				validator:function (value) {","					return value === NOT_SELECTED || value === FULLY_SELECTED || value === PARTIALLY_SELECTED;","				}","			},","            /**","             * String value equivalent to the {{#crossLink \"selected:attribute\"}}{{/#crossLink}}","             * for use in template expansion.","             * @attribute _aria_checked","             * @type String","             * @default false","             * @readonly","             * @protected","             */","            _aria_checked: {","                readOnly: true,","                getter: '_ariaCheckedGetter'","            },","			/**","			 * Whether selection of one node should propagate to its parent.","             * See {{#crossLink \"selected:attribute\"}}{{/crossLink}}.","			 * @attribute propagateUp","			 * @type Boolean","			 * @value true","			 */","			propagateUp: {","				value: true,","				validator: Lang.isBoolean","			},","			/**","			 * Whether selection of one node should propagate to its children.","             * See {{#crossLink \"selected:attribute\"}}{{/crossLink}}.","             * @attribute propagateDown","			 * @type Boolean","			 * @value true","			 */","			propagateDown: {","				value: true,","				validator: Lang.isBoolean","			}","		}","	}",");","","/**"," * Fires when the space bar is pressed."," * Used internally to toggle node selection."," * @event spacebar"," * @param ev {EventFacade} Standard YUI event facade for keyboard events."," */","/**"," * Fires when the enter key is pressed."," * @event enterkey"," * @param ev {EventFacade} Standard YUI event facade for keyboard events."," */","/**"," * Fires when this node is clicked."," * Used internally to toggle expansion or selection when clicked"," * on the corresponding icons."," * @event click"," * @param ev {EventFacade} Standard YUI event facade for mouse events."," */","","}, '@VERSION@', {\"requires\": [\"gallery-flyweight-tree\", \"widget\", \"base-build\"], \"skinnable\": true});"];
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].lines = {"1":0,"3":0,"5":0,"10":0,"67":0,"98":0,"99":0,"109":0,"110":0,"111":0,"121":0,"130":0,"136":0,"138":0,"139":0,"140":0,"142":0,"143":0,"144":0,"145":0,"147":0,"149":0,"151":0,"152":0,"153":0,"155":0,"158":0,"159":0,"162":0,"164":0,"165":0,"166":0,"168":0,"169":0,"170":0,"171":0,"173":0,"175":0,"177":0,"178":0,"179":0,"181":0,"182":0,"183":0,"187":0,"189":0,"190":0,"192":0,"193":0,"194":0,"196":0,"198":0,"200":0,"201":0,"202":0,"203":0,"204":0,"206":0,"207":0,"208":0,"209":0,"210":0,"212":0,"213":0,"215":0,"216":0,"218":0,"219":0,"220":0,"221":0,"223":0,"233":0,"234":0,"235":0,"236":0,"245":0,"247":0,"248":0,"249":0,"250":0,"254":0,"255":0,"309":0,"315":0,"316":0,"317":0,"318":0,"328":0,"337":0,"338":0,"339":0,"340":0,"341":0,"342":0,"343":0,"344":0,"354":0,"365":0,"369":0,"370":0,"371":0,"372":0,"373":0,"374":0,"377":0,"378":0,"379":0,"392":0,"401":0,"402":0,"403":0,"404":0,"405":0,"408":0,"418":0,"419":0,"420":0,"421":0,"423":0,"424":0,"494":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].functions = {"cName:9":0,"initializer:97":0,"renderUI:108":0,"bindUI:120":0,"_onKeyDown:129":0,"_afterFocus:232":0,"(anonymous 2):247":0,"loop:246":0,"_rebuildSequence:244":0,"initializer:314":0,"_afterExpandedChanged:327":0,"_afterClick:336":0,"toggleSelection:353":0,"(anonymous 3):378":0,"_afterSelectedChange:364":0,"_ariaCheckedGetter:391":0,"(anonymous 4):404":0,"_dynamicLoadReturn:400":0,"(anonymous 5):419":0,"_childSelectedChange:417":0,"validator:493":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredLines = 121;
_yuitest_coverage["build/gallery-fwt-treeview/gallery-fwt-treeview.js"].coveredFunctions = 22;
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 1);
YUI.add('gallery-fwt-treeview', function (Y, NAME) {

_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 3);
'use strict';
/*jslint white: true */
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 5);
var Lang = Y.Lang,
	YArray = Y.Array,
	// DOT = '.',
	getCName = Y.ClassNameManager.getClassName,
	cName = function (name) {
		_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "cName", 9);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 10);
return getCName('fw-treeview', name);
	},
	CNAMES = {
		cname_toggle: cName('toggle'),
		cname_icon: cName('icon'),
		cname_selection: cName('selection'),
		// cname_content: cName('content'),
		cname_sel_prefix: cName('selected-state'),
        cname_label: cName('label')
	},
	CBX = 'contentBox',
    EXPANDED = 'expanded',
    SELECTED = 'selected',
    CHANGE = 'Change',
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
 */
/**
 * @class FWTreeView
 * @extends Widget
 * @uses FlyweightTreeManager
 * @constructor
 * @param config {Object} Configuration attributes, amongst them:
 * @param config.tree {Array} Array of objects defining the first level of nodes.
 * @param config.tree.label {String} Text of HTML markup to be shown in the node
 * @param [config.tree.expanded=true] {Boolean} Whether the children of this node should be visible.
 * @param [config.tree.children] {Array} Further definitions for the children of this node
 * @param [config.tree.type=FWTreeNode] {FWTreeNode | String} Class used to create instances for this node.
 * It can be a reference to an object or a name that can be resolved as `Y[name]`.
 * @param [config.tree.id=Y.guid()] {String} Identifier to assign to the DOM element containing this node.
 * @param [config.tree.template] {String} Template for this particular node.
 */
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 67);
Y.FWTreeView = Y.Base.create(
	'fw-treeview',
	Y.Widget,
	[Y.FlyweightTreeManager],
	{
        /**
         * Array of iNodes containing a flat list of all nodes visible regardless
         * of their depth in the tree.
         * Used to handle keyboard navigation.
         * @property _visibleSequence
         * @type Array or null
         * @default null
         * @private
         */
        _visibleSequence: null,
        /**
         * Index, within {{#crossLink "_visibleSequence"}}{{/crossLink}}, of the iNode having the focus.
         * Used for keyboard navigation.
         * @property _visibleIndex
         * @type Integer
         * @default null
         * @private
         */
        _visibleIndex: null,
		/**
		 * Widget lifecycle method
		 * @method initializer
		 * @param config {object} configuration object of which
		 * `tree` contains the tree configuration.
		 */
		initializer: function (config) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 97);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 98);
this._domEvents = ['click'];
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 99);
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
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "renderUI", 108);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 109);
var cbx = this.get(CBX);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 110);
cbx.setContent(this._getHTML());
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 111);
cbx.set('role','tree');
		},
		/**
		 * Widget lifecyle method
		 * I opted for not including this method in FlyweightTreeManager so that
		 * it can be used to extend Base, not just Widget
		 * @method renderUI
		 * @protected
		 */
        bindUI: function () {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "bindUI", 120);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 121);
this.get(CBX).on('keydown', this._onKeyDown, this);
        },
        /**
         * Listener for keyboard events to handle keyboard navigation
         * @method _onKeyDown
         * @param ev {EventFacade} Standard YUI key facade
         * @private
         */
        _onKeyDown: function (ev) {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_onKeyDown", 129);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 130);
var ch = ev.charCode,
                iNode = this._focusedINode,
                seq = this._visibleSequence,
                index = this._visibleIndex,
                fwNode;

            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 136);
switch (ch) {
                case 38: // up
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 138);
if (!seq) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 139);
seq = this._rebuildSequence();
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 140);
index = seq.indexOf(iNode);
                    }
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 142);
index -=1;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 143);
if (index >= 0) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 144);
iNode = seq[index];
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 145);
this._visibleIndex = index;
                    } else {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 147);
iNode = null;
                    }
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 149);
break;
                case 39: // right
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 151);
if (iNode.expanded) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 152);
if (iNode.children && iNode.children.length) {
                            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 153);
iNode = iNode.children[0];
                        } else {
                            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 155);
iNode = null;
                        }
                    } else {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 158);
this._poolReturn(this._poolFetch(iNode).set(EXPANDED, true));
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 159);
iNode = null;
                    }

                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 162);
break;
                case 40: // down
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 164);
if (!seq) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 165);
seq = this._rebuildSequence();
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 166);
index = seq.indexOf(iNode);
                    }
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 168);
index +=1;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 169);
if (index < seq.length) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 170);
iNode = seq[index];
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 171);
this._visibleIndex = index;
                    } else {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 173);
iNode = null;
                    }
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 175);
break;
                case 37: // left
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 177);
if (iNode.expanded && iNode.children) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 178);
this._poolReturn(this._poolFetch(iNode).set(EXPANDED, false));
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 179);
iNode = null;
                    } else {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 181);
iNode = iNode._parent;
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 182);
if (iNode === this._tree) {
                            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 183);
iNode = null;
                        }
                    }

                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 187);
break;
                case 36: // home
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 189);
iNode = this._tree.children && this._tree.children[0];
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 190);
break;
                case 35: // end
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 192);
index = this._tree.children && this._tree.children.length;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 193);
if (index) {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 194);
iNode = this._tree.children[index -1];
                    } else {
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 196);
iNode = null;
                    }
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 198);
break;
                case 13: // enter
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 200);
fwNode = this._poolFetch(iNode);
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 201);
fwNode.fire('enterkey', {domEvent:ev});
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 202);
this._poolReturn(fwNode);
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 203);
iNode = null;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 204);
break;
                case 32: // spacebar
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 206);
fwNode = this._poolFetch(iNode);
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 207);
fwNode.fire('spacebar', {domEvent:ev});
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 208);
this._poolReturn(fwNode);
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 209);
iNode = null;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 210);
break;
                case 106: // asterisk on the numeric keypad
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 212);
this.expandAll();
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 213);
break;
                default: // initial
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 215);
iNode = null;
                    _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 216);
break;
            }
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 218);
if (iNode) {
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 219);
this._focusOnINode(iNode);
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 220);
ev.halt();
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 221);
return false;
            }
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 223);
return true;
        },
        /**
         * Listener for the focus event.
         * Updates the node receiving the focus when the widget gets the focus.
         * @method _aferFocus
         * @param ev {EventFacade} Standard event facade
         * @private
         */
        _afterFocus: function (ev) {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterFocus", 232);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 233);
var iNode = this._findINodeByElement(ev.domEvent.target);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 234);
this._focusOnINode(iNode);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 235);
if (this._visibleSequence) {
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 236);
this._visibleIndex = this._visibleSequence.indexOf(iNode);
            }
        },
        /**
         * Rebuilds the array of {{#crossLink "_visibleSequence"}}{{/crossLink}} that can be traversed with the up/down arrow keys
         * @method _rebuildSequence
         * @private
         */
        _rebuildSequence: function () {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_rebuildSequence", 244);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 245);
var seq = [],
                loop = function(iNode) {
                    _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "loop", 246);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 247);
YArray.each(iNode.children || [], function(childINode) {
                        _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 2)", 247);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 248);
seq.push(childINode);
                        _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 249);
if (childINode.expanded) {
                            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 250);
loop(childINode);
                        }
                    });
                };
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 254);
loop(this._tree);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 255);
return (this._visibleSequence = seq);

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
 *  Instances of it will be provided by FWTreeView as required.
 *
 *  Subclasses might be defined based on it.
 *  Usually, they will add further attributes and redefine the TEMPLATE to
 *  show those extra attributes.
 *
 *  @module gallery-fwt-treeview
 */
/**
 *
 *  @class FWTreeNode
 *  @extends FlyweightTreeNode
 *  @constructor
 */
 _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 309);
Y.FWTreeNode = Y.Base.create(
	'fw-treenode',
	Y.FlyweightTreeNode,
	[],
	{
		initializer: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "initializer", 314);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 315);
this.after('click', this._afterClick);
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 316);
this.after(SELECTED + CHANGE, this._afterSelectedChange);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 317);
this.after('spacebar', this.toggleSelection);
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 318);
this.after(EXPANDED + CHANGE, this._afterExpandedChanged);
		},
        /**
         * Listens to changes in the expanded attribute to invalidate and force
         * a rebuild of the list of visible nodes
         * the user can navigate through via the keyboard.
         * @method _afterExpandedChanged
         * @protected
         */
        _afterExpandedChanged: function () {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterExpandedChanged", 327);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 328);
this._root._visibleSequence = null;
        },
		/**
		 * Responds to the click event by toggling the node
		 * @method _afterClick
		 * @param ev {EventFacade}
		 * @private
		 */
		_afterClick: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterClick", 336);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 337);
var target = ev.domEvent.target;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 338);
if (target.hasClass(CNAMES.cname_toggle)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 339);
this.toggle();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 340);
if (target.hasClass(CNAMES.cname_selection)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 341);
this.toggleSelection();
			} else {_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 342);
if (target.hasClass(CNAMES.cname_content) || target.hasClass(CNAMES.cname_icon)) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 343);
if (this.get('root').get('toggleOnLabelClick')) {
					_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 344);
this.toggle();
				}
			}}}
		},
		/**
		 * Sugar method to toggle the selected state of a node.
         * See {{#crossLink "selected:attribute"}}{{/crossLink}}.
		 * @method toggleSelection
		 */
		toggleSelection: function() {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "toggleSelection", 353);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 354);
this.set(SELECTED, (this.get(SELECTED)?NOT_SELECTED:FULLY_SELECTED));
		},
		/**
		 * Changes the UI to reflect the selected state and propagates the selection up and/or down.
		 * @method _afterSelectedChange
		 * @param ev {EventFacade} out of which
		 * @param ev.src {String} if not undefined it can be `'propagateUp'` or `'propagateDown'`
         * so that propagation goes in just one direction and doesn't bounce back.
		 * @private
		 */
		_afterSelectedChange: function (ev) {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_afterSelectedChange", 364);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 365);
var selected = ev.newVal,
                prefix = CNAMES.cname_sel_prefix + '-',
                el;

			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 369);
if (!this.isRoot()) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 370);
el = Y.one('#' + this.get('id'));
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 371);
el.replaceClass(prefix + ev.prevVal, prefix + selected);
                _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 372);
el.set('aria-checked', this._ariaCheckedGetter());
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 373);
if (this.get('propagateUp') && ev.src !== 'propagatingDown') {
					_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 374);
this.getParent()._childSelectedChange().release();
				}
			}
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 377);
if (this.get('propagateDown') && ev.src !== 'propagatingUp') {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 378);
this.forSomeChildren(function(node) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 3)", 378);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 379);
node.set(SELECTED , selected, 'propagatingDown');
				});
			}
		},
        /**
         * Getter for the {{#crossLink "_aria_checked:attribute"}}{{/crossLink}}.
         * Translate the internal {{#crossLink "selected:attribute"}}{{/crossLink}}
         * to the strings the `aria_checked` attribute expects
         * @method _ariaCheckedGetter
         * @return {String} One of 'false', 'true' or 'mixed'
         * @private
         */
        _ariaCheckedGetter: function () {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_ariaCheckedGetter", 391);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 392);
return ['false','mixed','true'][this.get(SELECTED)];
        },
		/**
		 * Overrides the original in FlyweightTreeNode so as to propagate the selected state
		 * on dynamically loaded nodes.
		 * @method _dynamicLoadReturn
		 * @private
		 */
		_dynamicLoadReturn: function () {
            _yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_dynamicLoadReturn", 400);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 401);
Y.FWTreeNode.superclass._dynamicLoadReturn.apply(this, arguments);
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 402);
if (this.get('propagateDown')) {
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 403);
var selected = this.get(SELECTED);
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 404);
this.forSomeChildren(function(node) {
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 4)", 404);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 405);
node.set(SELECTED , selected, 'propagatingDown');
				});
			}
            _yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 408);
this._root._visibleSequence = null;

		},
		/**
		 * When propagating selection up, it is called by a child when changing its selected state
		 * so that the parent adjusts its own state accordingly.
		 * @method _childSelectedChange
		 * @private
		 */
		_childSelectedChange: function () {
			_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "_childSelectedChange", 417);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 418);
var count = 0, selCount = 0;
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 419);
this.forSomeChildren(function (node) {
				_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "(anonymous 5)", 419);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 420);
count +=2;
				_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 421);
selCount += node.get(SELECTED);
			});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 423);
this.set(SELECTED, (selCount === 0?NOT_SELECTED:(selCount === count?FULLY_SELECTED:PARTIALLY_SELECTED)), {src:'propagatingUp'});
			_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 424);
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
		TEMPLATE: Lang.sub(
            '<li id="{id}" class="{cname_node} {cname_sel_prefix}-{selected}" ' +
                'role="treeitem" aria-expanded="{expanded}" aria-checked="{_aria_checked}">' +
            '<div tabIndex="{tabIndex}" class="{cname_content}"><div class="{cname_toggle}"></div>' +
            '<div class="{cname_icon}"></div><div class="{cname_selection}"></div><div class="{cname_label}">{label}</div></div>' +
            '<ul class="{cname_children}" role="group">{children}</ul></li>', CNAMES),
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
             *
             * The node selection mechanism is always enabled though it might not be visible.
             * It only sets a suitable className on the tree node.
             * The module is provided with a default CSS style that makes node selection visible.
             * To enable it, add the `yui3-fw-treeview-checkbox` className to the container of the tree.
             *
			 * `selected` can be
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
					_yuitest_coverfunc("build/gallery-fwt-treeview/gallery-fwt-treeview.js", "validator", 493);
_yuitest_coverline("build/gallery-fwt-treeview/gallery-fwt-treeview.js", 494);
return value === NOT_SELECTED || value === FULLY_SELECTED || value === PARTIALLY_SELECTED;
				}
			},
            /**
             * String value equivalent to the {{#crossLink "selected:attribute"}}{{/#crossLink}}
             * for use in template expansion.
             * @attribute _aria_checked
             * @type String
             * @default false
             * @readonly
             * @protected
             */
            _aria_checked: {
                readOnly: true,
                getter: '_ariaCheckedGetter'
            },
			/**
			 * Whether selection of one node should propagate to its parent.
             * See {{#crossLink "selected:attribute"}}{{/crossLink}}.
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
             * See {{#crossLink "selected:attribute"}}{{/crossLink}}.
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

/**
 * Fires when the space bar is pressed.
 * Used internally to toggle node selection.
 * @event spacebar
 * @param ev {EventFacade} Standard YUI event facade for keyboard events.
 */
/**
 * Fires when the enter key is pressed.
 * @event enterkey
 * @param ev {EventFacade} Standard YUI event facade for keyboard events.
 */
/**
 * Fires when this node is clicked.
 * Used internally to toggle expansion or selection when clicked
 * on the corresponding icons.
 * @event click
 * @param ev {EventFacade} Standard YUI event facade for mouse events.
 */

}, '@VERSION@', {"requires": ["gallery-flyweight-tree", "widget", "base-build"], "skinnable": true});
