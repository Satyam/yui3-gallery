YUI.add("gallery-stdmod",function(g){var h="boundingBox",c="contentBox",a=g.WidgetStdMod,f=a.HEADER,b=a.BODY,e=a.FOOTER,d=function(){a.apply(this,arguments);this._stdModNode=this.get(h);};d.prototype={_renderUIStdMod:function(){var i=this.get(c);i.addClass(a.SECTION_CLASS_NAMES[b]);this.bodyNode=i;a.prototype._renderUIStdMod.apply(this,arguments);},_renderStdMod:function(k){var i=this.get(c),j=this._findStdModSection(k);if(!j){if(k===b){j=i;}else{j=this._getStdModTemplate(k);}}this._insertStdModSection(i,k,j);return(this[k+"Node"]=j);},_insertStdModSection:function(i,k,j){switch(k){case e:i.insert(j,"after");break;case f:i.insert(j,"before");break;}},_findStdModSection:function(i){return this.get(h).one("> ."+a.SECTION_CLASS_NAMES[i]);}};g.StdMod=g.mix(d,a,false,undefined,2);},"@VERSION@",{requires:["widget-stdmod"],skinnable:false});