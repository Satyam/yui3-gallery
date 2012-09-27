YUI.add('gallery-fwt-treeview', function (Y, NAME) {

'use strict';
/*jslint white: true */
var Lang = Y.Lang,
	// DOT = '.',
	getCName = Y.ClassNameManager.getClassName,
	cName = function (name) {
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
			this._domEvents = ['click'];
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
 Y.FWTreeNode = Y.Base.create(
	'fw-treenode',
	Y.FlyweightTreeNode,
	[],
	{
		initializer: function() {
			this.after('click', this._afterClick, this);
			this.after('selectedChange', this._afterSelectedChange, this);
		},
		/**
		 * Responds to the click event by toggling the node
		 * @method _afterClick
		 * @param ev {EventFacade}
		 * @private
		 */
		_afterClick: function (ev) {
			var target = ev.domEvent.target;
			if (target.hasClass(CNAMES.toggle)) {
				this.toggle();
			} else if ((target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) && this.get('root').get('toggleOnLabelClick')) {
				this.toggle();
			} else if (target.hasClass(CNAMES.selection)) {
				this.toggleSelection();
			}
		},
		/**
		 * Sugar method to toggle the selected state of a node.
		 * @method toggleSelection
		 */
		toggleSelection: function() {
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
			var newVal = ev.newVal;
				
			if (!this.isRoot()) {
				Y.one('#' + this.get('id')).replaceClass('yui3-fw-treeview-selected-state-' + ev.prevVal,'yui3-fw-treeview-selected-state-' + newVal);
				if (this.get('propagateUp') && ev.src !== 'propagatingDown') {
					this.getParent()._childSelectedChange().release();
				}
			}
			if (this.get('propagateDown') && ev.src !== 'propagatingUp') {
				this.forEachChild(function(node) {
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
			var count = 0, selCount = 0;
			this.forEachChild(function (node) {
				count +=2;
				selCount += node.get('selected');
			});
			this.set('selected', (selCount === 0?0:(selCount === count?2:1)), {src:'propagatingUp'});
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
