YUI.add("gallery-md-button-group",function(d){var c=d.Lang,e="boundingBox",a="press",b="label";d.ButtonSeparator=d.Base.create("buttonSeparator",d.Widget,[],{BOUNDING_TEMPLATE:"<span />"},{});d.ButtonGroup=d.Base.create("buttonGroup",d.Widget,[d.WidgetParent,d.MakeNode],{BOUNDING_TEMPLATE:"<fieldset />",initializer:function(){this.on("addChild",function(f){var h=f.child,g=d.WidgetChild;if(h){if(h instanceof d.Button||h instanceof d.ButtonSeparator){if(!h.ancestor){d.augment(h,g);h.addAttrs(h._protectAttrs(g.ATTRS));g.constructor.apply(h);}}else{f.preventDefault();}}});},bindUI:function(){this.on(["button:press","button-toggle:press"],this._onButtonPress,this);},_onButtonPress:function(h){if(this.get("alwaysSelected")){var g=this.get("selection"),f=h.target;if(g===f||(g instanceof d.ArrayList&&g.size()===1&&g.item(0)===f)){h.preventDefault();return;}}this.fire(a,{pressed:h.target});},_uiSetLabel:function(f){if(!this._labelNode){this.get(e).prepend(this._makeNode());this._locateNodes();}this._labelNode.setContent(f);}},{_TEMPLATE:'<legend class="{c label}">{@ label}</legend>',_CLASS_NAMES:[b],_ATTRS_2_UI:{BIND:b,SYNC:b},_PUBLISH:{press:null},ATTRS:{label:{value:"",validator:c.isString},defaultChildType:{value:d.Button},alwaysSelected:{value:false,validator:c.isBoolean}}});},"@VERSION@",{skinnable:true,requires:["base-base","widget-parent","widget-child","gallery-makenode","gallery-md-button"]});