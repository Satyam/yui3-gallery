YUI.add("gallery-fwt-treeview",function(e,t){"use strict";var n=e.Lang,r=e.Array,i,s=e.ClassNameManager.getClassName,o=function(e){return s("fw-treeview",e)},u={cname_toggle:o("toggle"),cname_icon:o("icon"),cname_selection:o("selection"),cname_sel_prefix:o("selected-state"),cname_label:o("label")},a="contentBox",f="expanded",l="selected",c="Change",h=0,p=1,d=2;i=e.Base.create(t,e.FlyweightTreeManager,[],{_visibleSequence:null,_visibleIndex:null,initializer:function(e){this._domEvents=["click"],this._loadConfig(e.tree)},renderUI:function(){i.superclass.renderUI.apply(this,arguments),this.get(a).set("role","tree")},bindUI:function(){i.superclass.bindUI.apply(this,arguments),this._eventHandles.push(this.get(a).on("keydown",this._onKeyDown,this))},_onKeyDown:function(e){var t=e.charCode,n=this._focusedINode,r=this._visibleSequence,i=this._visibleIndex,s;switch(t){case 38:r||(r=this._rebuildSequence(),i=r.indexOf(n)),i-=1,i>=0?(n=r[i],this._visibleIndex=i):n=null;break;case 39:n.expanded?n.children&&n.children.length?n=n.children[0]:n=null:(this._poolReturn(this._poolFetch(n).set(f,!0)),n=null);break;case 40:r||(r=this._rebuildSequence(),i=r.indexOf(n)),i+=1,i<r.length?(n=r[i],this._visibleIndex=i):n=null;break;case 37:n.expanded&&n.children?(this._poolReturn(this._poolFetch(n).set(f,!1)),n=null):(n=n._parent,n===this._tree&&(n=null));break;case 36:n=this._tree.children&&this._tree.children[0];break;case 35:i=this._tree.children&&this._tree.children.length,i?n=this._tree.children[i-1]:n=null;break;case 13:s=this._poolFetch(n),this.fire("enterkey",{domEvent:e,node:s}),s.fire("enterkey",{domEvent:e,node:s}),this._poolReturn(s),n=null;break;case 32:s=this._poolFetch(n),this.fire("spacebar",{domEvent:e,node:s}),s.fire("spacebar",{domEvent:e,node:s}),this._poolReturn(s),n=null;break;case 106:this.expandAll();break;default:n=null}return n?(this._focusOnINode(n),e.halt(),!1):!0},_afterFocus:function(e){var t=this._findINodeByElement(e.domEvent.target);this._focusOnINode(t),this._visibleSequence&&(this._visibleIndex=this._visibleSequence.indexOf(t))},_rebuildSequence:function(){var e=[],t=function(n){r.each(n.children||[],function(n){e.push(n),n.expanded&&t(n)})};return t(this._tree),this._visibleSequence=e},CONTENT_TEMPLATE:"<ul></ul>"},{ATTRS:{defaultType:{value:"FWTreeNode"},toggleOnLabelClick:{value:!1,validator:n.isBoolean}}}),e.FWTreeView=i,e.FWTreeNode=e.Base.create("fw-treenode",e.FlyweightTreeNode,[],{initializer:function(){this._root._eventHandles.push(this.after("click",this._afterClick),this.after(l+c,this._afterSelectedChange),this.after("spacebar",this.toggleSelection),this.after(f+c,this._afterExpandedChanged))},_afterExpandedChanged:function(){this._root._visibleSequence=null},_afterClick:function(e){var t=e.domEvent.target;t.hasClass(u.cname_toggle)?this.toggle():t.hasClass(u.cname_selection)?this.toggleSelection():(t.hasClass(u.cname_content)||t.hasClass(u.cname_icon))&&this.get("root").get("toggleOnLabelClick")&&this.toggle()},toggleSelection:function(){this.set(l,this.get(l)?h:d)},_afterSelectedChange:function(t){var n=t.newVal,r=u.cname_sel_prefix+"-",i;this.isRoot()||(i=e.one("#"+this.get("id")),i.replaceClass(r+t.prevVal,r+n),i.set("aria-checked",this._ariaCheckedGetter()),this.get("propagateUp")&&t.src!=="propagatingDown"&&this.getParent()._childSelectedChange().release()),this.get("propagateDown")&&t.src!=="propagatingUp"&&this.forSomeChildren(function(e){e.set(l,n,"propagatingDown")})},_ariaCheckedGetter:function(){return["false","mixed","true"][this.get(l)]},_dynamicLoadReturn:function(){e.FWTreeNode.superclass._dynamicLoadReturn.apply(this,arguments);if(this.get("propagateDown")){var t=this.get(l);this.forSomeChildren(function(e){e.set(l,t,"propagatingDown")})}this._root._visibleSequence=null},_childSelectedChange:function(){var e=0,t=0;return this.forSomeChildren(function(n){e+=2,t+=n.get(l)}),this.set(l,t===0?h:t===e?d:p,{src:"propagatingUp"}),this}},{TEMPLATE:n.sub('<li id="{id}" class="{cname_node} {cname_sel_prefix}-{selected}" role="treeitem" aria-expanded="{expanded}" aria-checked="{_aria_checked}"><div tabIndex="{tabIndex}" class="{cname_content}"><div class="{cname_toggle}"></div><div class="{cname_icon}"></div><div class="{cname_selection}"></div><div class="{cname_label}">{label}</div></div><ul class="{cname_children}" role="group">{children}</ul></li>',u),NOT_SELECTED:h,PARTIALLY_SELECTED:p,FULLY_SELECTED:d,ATTRS:{selected:{value:h,validator:function(e){return e===h||e===d||e===p}},_aria_checked:{readOnly:!0,getter:"_ariaCheckedGetter"},propagateUp:{value:!0,validator:n.isBoolean},propagateDown:{value:!0,validator:n.isBoolean}}})},"@VERSION@",{requires:["gallery-flyweight-tree","widget","base-build"],skinnable:!0});
