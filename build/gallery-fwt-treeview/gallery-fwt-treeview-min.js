YUI.add("gallery-fwt-treeview",function(g,f){var d=g.Lang,c=g.ClassNameManager.getClassName,a=function(h){return c("fw-treeview",h);},e={toggle:a("toggle"),icon:a("icon"),selection:a("selection"),content:a("content")},b="contentBox";g.FWTreeView=g.Base.create("fw-treeview",g.Widget,[g.FlyweightTreeManager],{initializer:function(h){this._domEvents=["click"];this._loadConfig(h.tree);},renderUI:function(){this.get(b).setContent(this._getHTML());},CONTENT_TEMPLATE:"<ul></ul>"},{ATTRS:{defaultType:{value:"FWTreeNode"}}});g.FWTreeNode=g.Base.create("fw-treenode",g.FlyweightTreeNode,[],{initializer:function(){this.after("click",this._afterClick,this);},_afterClick:function(h){var i=h.domEvent.target;if(i.hasClass(e.toggle)){this.toggle();}else{if((i.hasClass(e.content)||i.hasClass(e.icon))&&this.get("root").get("toggleOnLabelClick")){this.toggle();}else{if(i.hasClass(e.selection)){this.toggleSelection();}}}}},{TEMPLATE:d.sub('<li id="{id}" class="{cname_node}"><div class="{toggle}"></div><div class="{icon}"></div><div class="{selection}"></div><div class="{content}">{label}</div><ul class="{cname_children}">{children}</ul></li>',e)});},"@VERSION@",{"requires":["gallery-flyweight-tree","widget","base-build"],"skinnable":true});