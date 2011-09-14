YUI.add("gallery-md-inputfield",function(d){var e=d.Lang,c="boundingBox",m="contentBox",h="ui",n="idInput",p="label",f="value",i="type",o="formatter",l="parser",q="validator",b="input",k="errorMsg",g="error",r="error-panel",j="title",a=function(s){return e.isString(s)||e.isNull(s);};d.InputField=d.Base.create("input-field",d.Widget,[d.MakeNode,d.WidgetChild],{renderUI:function(){this.get(m).append(this._makeNode());this._locateNodes();if(!this.get(n)){this.set(n,this._inputNode._yuid);}},bindUI:function(){this._eventHandles.push(this._inputNode.after("valueChange",this._afterInputValueChange,this));},_uiSetIdInput:function(s){this._inputNode.set("id",s);this._labelNode.set("for",s);},_uiSetLabel:function(s){this._labelNode.setContent(s);},_uiSetValue:function(s,t){if(t===h){return;}this._inputNode.set(f,this.get(o)(s)||"");},_uiSetErrorMsg:function(u){var s=this._labelNode,t=this.get(c);if(u){t.addClass(this._classNames[g]);s.set(j,u);this._inputNode.focus();}else{t.removeClass(this._classNames[g]);s.set(j,"");}},_uiSetType:function(s){if(d.DataTypes&&d.DataTypes[s]){this.setAttrs(d.DataTypes[s].UI||{});}},_afterInputValueChange:function(s){this.set(f,this.get(l)(s.target.get(f)),{src:h});},_afterLabelClick:function(){var t=this.get(k),s=d.InputField._errorPanel;if(t&&d.Panel){if(!s){s=d.InputField._errorPanel=new d.Panel({hideOn:[{eventName:"clickoutside"}]}).render(d.config.doc.body);s.getStdModNode(d.WidgetStdMod.HEADER).insert("<span></span>",0);s.get(c).addClass(this._classNames[r]);}s.setAttrs({bodyContent:t,align:{node:this._labelNode,points:[d.WidgetPositionAlign.TL,d.WidgetPositionAlign.BR]},visible:true});s.get(m).one("span").setContent(this.get(p));}},_afterInputBlur:function(s){this.set(k,this.get(q)(s));},_fnIfNull:function(s){if(e.isFunction(s)){return s;}if(e.isNull(s)){return function(t){return t;};}return d.Attribute.INVALID_VALUE;},_validatorSetter:function(s){if(e.isFunction(s)){return s;}if(e.isNull(s)){return function(){return null;};}return d.Attribute.INVALID_VALUE;}},{_errorPanel:null,_CLASS_NAMES:[p,b,g,r],_TEMPLATE:'<label class="{c label}">{@ label}</label><input type="text" class="{c input}"  />',_ATTRS_2_UI:{SYNC:[n,i,f,k],BIND:[n,i,f,p,k]},_EVENTS:{label:"click",input:"blur"},ATTRS:{idInput:{validator:e.isString,value:null},label:{validator:e.isString,value:""},value:{value:""},type:{value:null,validator:a},parser:{setter:"_fnIfNull",value:null},formatter:{setter:"_fnIfNull",value:null},validator:{setter:"_validatorSetter",value:null},errorMsg:{value:null,validator:a}}});},"@VERSION@",{requires:["base-build","widget","widget-child","gallery-makenode","event-valuechange"],optional:["panel"],skinnable:true});