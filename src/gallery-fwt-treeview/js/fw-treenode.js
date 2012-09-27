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
		toggleSelection: function() {
			this.set('selected', (this.get('selected')?0:2));
		},
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
		_childSelectedChange: function () {
			var count = 0, selCount = 0;
			this.forEachChild(function (node) {
				console.log('nodes', node.get('label'), node.get('selected'));
				count +=2;
				selCount += node.get('selected');
			});
			console.log('counts',this.get('label'), count, selCount);
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
			selected: {
				value:0,
				validator:Lang.isNumber
			},
			propagateUp: {
				value: true,
				validator: Lang.isBoolean
			},
			propagateDown: {
				value: true,
				validator: Lang.isBoolean
			}
		}
	}
);

