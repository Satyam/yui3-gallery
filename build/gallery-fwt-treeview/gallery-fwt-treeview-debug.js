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
		content: cName('content')
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
		}
	},
	{
		/**
		 * Template to produce the markup for a node in the tree.
		 * @property TEMPLATE
		 * @type String
		 * @static
		 */
		TEMPLATE: Lang.sub('<li id="{id}" class="{cname_node}"><div class="{toggle}"></div><div class="{icon}"></div><div class="{selection}"></div><div class="{content}">{label}</div><ul class="{cname_children}">{children}</ul></li>', CNAMES)
	}
);



}, '@VERSION@', {"requires": ["gallery-flyweight-tree", "widget", "base-build"], "skinnable": true});
