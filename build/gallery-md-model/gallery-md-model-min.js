YUI.add("gallery-md-model",function(c){var f=c.Lang,j=c.Array,e=c.Object,k="change",n="loaded",b="error",h="saved",g="reset",r="isModified",t="isNew",p=".",m="Change";c.GalleryModel=c.Base.create("gallery-md-model",c.Base,[],{_values:null,_loadedValues:null,_primaryKeys:null,initializer:function(u){this._values={};this._loadedValues={};this.publish(k,{defaultFn:this._defSetValue});this.publish(n,{defaultFn:this._defDataLoaded});this.publish(h,{preventable:false});u=u||{};if(f.isObject(u.values)){this.setValues(u.values,"init");this._set(r,false);this._set(t,true);this._loadedValues=c.clone(this._values);}},destroy:function(v,x){if(typeof v==="function"){x=v;v={};}else{if(!v){v={};}}var u=this,w=function(y){if(!y){j.each(u.lists.concat(),function(z){z.remove(u,v);});c.GalleryModel.superclass.destroy.call(u);}x&&x.apply(null,arguments);};if(x||v){this.sync("delete",v,w);}else{w();}return this;},getValue:function(u){return this._values[u];},getValues:function(){return c.clone(this._values);},setValue:function(u,v,w){var x=this._values[u];if(x!==v&&(this._primaryKeys.indexOf(u)===-1||f.isUndefined(x))){this.fire(k,{name:u,newVal:v,prevVal:x,src:w});}},_defSetValue:function(v){var u=this;if(v.name){u._values[v.name]=v.newVal;u._set(r,true);}else{e.each(v.newVals,function(x,w){u.setValue(w,x,v.src);});}},setValues:function(w,x){var v=this,u={};e.each(w,function(z,y){u[y]=v.getValue(y);});this.fire(k,{newVals:w,prevVals:u,src:x});},getChangedValues:function(){var w={},v,u=this._loadedValues;e.each(this._values,function(y,x){v=u[x];if(v!==y){w[x]={prevVal:v,newVal:y};}});return w;},getPKValues:function(){var v={},u=this;j.each(u.get("primaryKeys"),function(w){v[w]=u._values[w];});return v;},getAsHTML:function(u){var v=this.getValue(u);return c.Escape.html(f.isValue(v)?String(v):"");},getAsURL:function(v){var w=this.getValue(v),u=[];if(v){return encodeURIComponent(f.isValue(w)?String(w):"");}else{e.each(w,function(y,x){if(f.isValue(y)){u.push(encodeURIComponent(x)+"="+encodeURIComponent(y));}});return u.join("&");}},_defDataLoaded:function(v){var u=this;u.setValues(v.parsed,v.src);u._set(r,false);u._set(t,false);u._loadedValues=c.clone(u._values);},load:function(v,w){var u=this;if(typeof v==="function"){w=v;v={};}else{if(!v){v={};}}u.sync("read",v,function(z,x){var y={options:v,response:x,src:"load"};if(z){y.error=z;u.fire(b,y);}else{u._values={};y.parsed=u.parse(x);u.fire(n,y);}w&&w.apply(null,arguments);});return u;},parse:function(u){if(typeof u==="string"){try{return c.JSON.parse(u);}catch(v){this.fire(b,{error:v,response:u,src:"parse"});return null;}}return u;},save:function(v,w){var u=this;if(typeof v==="function"){w=v;v={};}else{if(!v){v={};}}u._validate(u.getValues(),function(x){if(x){w&&w.call(null,x);return;}u.sync(u.get(t)?"create":"update",v,function(A,y){var z={options:v,response:y,src:"save"};if(A){z.error=A;u.fire(b,z);}else{z.parsed=u.parse(y);u._set(r,false);u._set(t,false);u._loadedValues=c.clone(u._values);u.fire(h,z);if(z.parsed){u.fire(n,z);}}w&&w.apply(null,arguments);});});return u;},reset:function(){this._values=c.clone(this._loadedValues);this.fire(g);return this;},sync:function(v,u,w){if(typeof w==="function"){w();}},validate:function(u,v){v&&v();},_validate:function(v,w){var u=this;u.validate(v,function(x){if(f.isValue(x)){u.fire(b,{attributes:v,error:x,src:"validate"});w(x);return;}w();});},toJSON:function(){return this.getValue();},_isModifiedGetter:function(w,v){v=v.split(p);if(v.length>1){v=v[1];var u={};u[v]=this._values[v]!==this._loadedValues[v];return u;}else{return w;}},_isNewGetter:function(w,v){v=v.split(p);if(v.length>1){v=v[1];var u={};u[v]=!this._loadedValues.hasOwnProperty(v);return u;}else{return w;}},_primaryKeysSetter:function(u){if(this._primaryKeys&&this._primaryKeys.length){return c.Attribute.INVALID_VALUE;}u=new j(u);this._primaryKeys=u;return u;},_primaryKeysGetter:function(w,v){v=v.split(p);if(v.length>1){v=v[1];var u={};u[v]=w.indexOf(v)!==-1;return u;}else{return(w||[]).concat();}}},{ATTRS:{isModified:{readOnly:true,value:false,validator:f.isBoolean,getter:"_isModifiedGetter"},isNew:{readOnly:true,value:true,validator:f.isBoolean,getter:"_isNewGetter"},primaryKeys:{setter:"_primaryKeysSetter",getter:"_primaryKeysGetter",lazyAdd:false,value:[]}}});c.GalleryModelSimpleUndo=function(){};c.GalleryModelSimpleUndo.prototype={initializer:function(){this._lastChange={};this._preserve=(this._preserve||[]).concat("_lastChange");this.after(k,this._trackChange);this.after([n,h,g],this._resetUndo);},_trackChange:function(u){if(u.name&&u.src!=="undo"){this._lastChange[u.name]=u.prevVal;}},_resetUndo:function(){this._lastChange={};},undo:function(v){var u=this;if(v){if(u._lastChange[v]!==undefined){u.setValue(v,u._lastChange[v],"undo");delete u._lastChange[v];}}else{u.setValues(this._lastChange,"undo");u._lastChange={};}}};c.GalleryModelChronologicalUndo=function(){};c.GalleryModelChronologicalUndo.prototype={initializer:function(){this._changes=[];this._preserve=(this._preserve||[]).concat("_changes");this.after(k,this._trackChange);this.after([n,h,g],this._resetUndo);},_trackChange:function(u){if(u.src!=="undo"){this._changes.push(u.details);}},_resetUndo:function(){this._changes=[];},undo:function(){var u=this._changes.pop();if(u){if(u.name){this.setValue(u.name,u.prevVal,"undo");}else{this.setValues(u.prevVals,"undo");}}if(this._changes.length===0){this._set(r,false);}}};var s="index",l=function(){this._shelves=[];};l.prototype={initializer:function(){this._shelves=[];this._currentIndex=0;this.on(n,this._batchLoad);},_currentIndex:0,_shelves:null,_shelve:function(v){if(v===undefined){v=this._currentIndex;}var u=this,w={_values:u._values,_loadedValues:u._loadedValues,isNew:u.get(t),isModified:u.get(r)};j.each(u._preserve,function(x){w[x]=u[x];});u._shelves[v]=w;},_fetch:function(v){if(v===undefined){v=this._currentIndex;}var u=this,w=u._shelves[v];u._values=w._values;u._loadedValues=w._loadedValues;u._set(t,w.isNew);u._set(r,w.isModified);j.each(u._preserve,function(x){u[x]=w[x];
});},_initNew:function(){this._values={};this._loadedValues={};this._set(t,true);this._set(r,false);},add:function(u,v){if(this.get(r)||!this.get(t)){this._shelve();}if(arguments.length===2){this._shelves.splice(v,1);}else{v=this._shelves.length;}this._currentIndex=v;this._initNew();this.setValues(u,"add");},each:function(x){var w,u,v=this;this._shelve();for(w=0,u=this._shelves.length;w<u;w+=1){this._currentIndex=w;this._fetch(w);if(x.call(v,w)!==false){this._shelve(w);}}},eachModified:function(x){var w,u,v=this;this._shelve();for(w=0,u=this._shelves.length;w<u;w+=1){if(this._shelves[w][r]){this._currentIndex=w;this._fetch(w);if(x.call(v,w)!==false){this._shelve(w);}}}},saveAllModified:function(){this.eachModified(this.save);},_batchLoad:function(v){var u=this;if(v.src==="load"&&v.Lang.isArray(v.parsed)){v.halt();j.each(v.parsed,function(w){u.add(w);});}},size:function(){return this._shelves.length;},empty:function(){this._shelves=[];this._currentIndex=0;this.reset();},_indexSetter:function(u){if(f.isNumber(u)&&u>=0&&u<this._shelves.length){this._shelve(this._currentIndex);this._currentIndex=u=parseInt(u,10);this._fetch(u);return u;}else{return c.Attribute.INVALID_VALUE;}},_indexGetter:function(u){return this._currentIndex;}};l.ATTRS={index:{value:0,setter:"_indexSetter",getter:"_indexGetter"}};c.GalleryModelMultiRecord=l;var o="sortField",a="sortDir",q="asc",d="desc",i=function(){};i.prototype={_compare:null,initializer:function(){if(this.get(o)===undefined){this._set(o,this.get("primaryKeys")[0]);}this._setCompare();this.after([o+m,a+m],this._sort);this.after("change",this._afterChange);},_setCompare:function(){var v=this.get(o),w=this.get(a)===q?1:-1,u=(f.isFunction(v)?v:function(x){return x[v];});this._compare=function(y,x){var A=u(y._values),z=u(x._values);return(A<z?-1:(A>z?1:0))*w;};},_sort:function(){this._setCompare();this._shelve();this._shelves.sort(this._compare);this._fetch();},_afterChange:function(x){var A=x.name,u=this.get(o),w,v=this._currentIndex,z=this._shelves,y;if(A&&x.src!=="add"&&(f.isFunction(u)||A===u)){y=z.splice(v,1)[0];w=this._findIndex(y._values);z.splice(w,0,y);this._currentIndex=w;}},_findIndex:function(v){var A=this._shelves,u=0,z=A.length,w=0,x=this._compare,y={_values:v};while(u<z){w=(z+u)>>1;switch(x(y,A[w])){case 1:u=w+1;break;case -1:z=w;break;default:u=z=w;}}return u;},add:function(u){var w=this._shelves,v=0;v=this._findIndex(u);this._currentIndex=v;w.splice(v,0,{});this._initNew();this.setValues(u,"add");this._shelve(v);}};i.ATTRS={sortField:{validator:function(u){return f.isString(u)||f.isFunction(u);}},sortDir:{validator:function(u){return u===d||u===q;},value:q}};c.GalleryModelSortedMultiRecord=i;},"@VERSION@",{requires:["base"],skinnable:false});