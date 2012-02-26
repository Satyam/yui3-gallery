/**
Record-based data model with APIs for getting, setting, validating, and
syncing attribute values, as well as events for being notified of model changes.
 
@module gallery-md-model
**/
 
/**
Record-based data model with APIs for getting, setting, validating, and
syncing attribute values, as well as events for being notified of model changes.
 
In most cases, you'll want to create your own subclass of Y.GalleryModel and
customize it to meet your needs. In particular, the sync() and validate()
methods are meant to be overridden by custom implementations. You may also want
to override the parse() method to parse non-generic server responses.
 
@class Y.GalleryModel
@constructor
@extends Base
**/
	"use strict";
	
	var Lang = Y.Lang,
		YArray = Y.Array,
		YObject = Y.Object,
		EVT_CHANGE = 'change',
		EVT_LOADED = 'loaded',
		EVT_ERROR = 'error',
		EVT_SAVED = 'saved',
		IS_MODIFIED = 'isModified',
		IS_NEW = 'isNew',
		DOT = '.';
	

	Y.GalleryModel = Y.Base.create(
		'gallery-md-model',
		Y.Base, 
		[],
		{
			/**
			 * Hash of values indexed by field name
			 * @property _values
			 * @type Object
			 * @private
			 */
			_values: null,
			/**
			 * Hash of values as loaded from the remote source, 
			 * presumed to be the current value there.
			 * @property _loadedValues
			 * @type Object
			 * @private
			 */
			_loadedValues: null,
			/**
			 * Array of field names that make up the primary key for this record
			 * @property _primaryKeys
			 * @type Array
			 * @private
			 */
			_primaryKeys: null,
			/*
			 * Y.Base lifecycle method
			 */
			initializer: function  () {
				this._values = {};
				this._loadedValues = {};
				/**
				 * Fired whenever a data value is changed.
				 * @event change
				 * @param {String} ev.name Name of the field changed
				 * @param {Any} ev.newVal New value of the field.
				 * @param {Any} ev.prevVal Previous value of the field.
				 * @param {String|null} ev.src Source of the change event, if any.
				 */
				this.publish(EVT_CHANGE, {
					defaultFn: this._defSetValue
				});
				/**
				 * Fired when new data has been received from the remote source.  
				 * It will be fired even on a save operation if the response contains values.
				 * The parsed values can be altered on the before (on) listener.
				 * @event loaded
				 * @param {Object} ev.response Response data as received from the remote source
				 * @param {Object} ev.parsed Data as returned from the parse method.
				 */
				this.publish(EVT_LOADED, {
					defaultFn:this._defDataLoaded
				});
				/**
				 * Fired when the data has been saved to the remote source
				 * The event cannot be prevented.
				 * @event saved
				 */
				this.publish(EVT_SAVED, {
					preventable: false
				});
			},
			/**
			 * Destroys this model instance and removes it from its containing lists, if
			 * any.

			 * If there are any arguments then this method also delegates to the
			 * sync() method to delete the model from the persistence layer, which is an
			 * asynchronous action and thus requires at least a callback
			 * otherwise, it returns immediately.

			 * @method destroy
			 * @param [options] {Object} Options passed on to the sync method, if required.
			 * @param [callback] {function} function to be called when the sync operation finishes.
			 *		@param callback.err {string|null} Error message, if any or null.
			 *		@param callback.response {Any} The server response as received by sync(),
			 * @chainable
			 */
			destroy: function (options, callback) {
				if (typeof options === 'function') {
					callback = options;
					options = {};
				} else if (!options) {
					options = {};
				}
				var self = this,
					finish = function (err) {
						if (!err) {
							YArray.each(self.lists.concat(), function (list) {
								list.remove(self, options);
							});

							Y.GalleryModel.superclass.destroy.call(self);
						}

						callback && callback.apply(null, arguments);
					};

				if (callback || options) {
					this.sync('delete', options, finish);
				} else {
					finish();
				}

				return this;
			},
			/**
			 * Returns the value of the field named or a hash with all values using the field names as keys
			 * @method getValue
			 * @param [name] {string}  Name of the field to return or all fields if omitted.
			 * @return {Any|Object} If name is provided, the value of the field requested.  
			 * If not, a hash with all the fields with the field names as keys.
			 */ 
			getValue: function (name) {
				return (name?this._values[name]:Y.clone(this._values));
			},
			/**
			 * Returns a hash with all values using the field names as keys.
			 * It is an alias for getValue() with no arguments.
			 * @method getValues
			 * @return {Object} a hash with all the fields with the field names as keys.
			 */ 
			getValues: function() {
				return this.getValue();
			},
			/**
			 * Sets the value of the named field. 
			 * Fires the change event if the value is different from the current one.
			 * Primary key fields cannot be changed unless still undefined.
			 * @method setValue
			 * @param name {string} Name of the field to be set
			 * @param value {Any} Value to be assigned to the field
			 * @param [src] {Any} Source of the change in the value.
			 */
			setValue: function (name, value, src) {
				var prevVal = this._values[name];
				if (prevVal !== value && (this._primaryKeys.indexOf(name) === -1 || Lang.isUndefined(prevVal))) {
					this.fire(EVT_CHANGE, {
						name:name,
						newVal:value,
						prevVal:prevVal,
						src: src
					});
				}
			},
			/**
			 * Default function for the change event, sets the value and marks the model as modified.
			 * @method _defSetValue
			 * @param ev {EventFacade} (see change event)
			 * @private
			 */
			_defSetValue: function (ev) {
				this._values[ev.name] = ev.newVal;
				this._set(IS_MODIFIED, true);
			},
			/**
			 * Sets a series of values.   It simply loops over the hash of values provided calling setValue on each.
			 * @method setValues
			 * @param values {Object} hash of values to change
			 * @param [src] {Any} Source of the changes
			 */
			setValues: function (values, src) {
				var self = this;
				YObject.each(values, function (value, name) {
					self.setValue(name, value, src);
				});
			},
			/**
			 * Returns a hash indexed by field name, of all the values in the model that have changed since the last time
			 * they were synchornized with the remote source.   Each entry has a prevVal and newVal entry.
			 * @method getChangedValues
			 * @return {Object} Has of all entries changed since last synched, each entry has a newVal and prevVal property contaning original and changed values.
			 */
			getChangedValues: function() {
				var changed = {}, 
					prev, 
					loaded = this._loadedValues;

				YObject.each(this._values, function (value, name) {
					prev = loaded[name];
					if (prev !== value) {
						changed[name] = {prevVal:prev, newVal: value};
					}
				});
				return changed;
			},
			/**
			 * Returns a hash with the values of the primary key fields, indexed by their field names
			 * @method getPKValues
			 * @return {Object} Hash with the primary key values, indexed by their field names
			 */
			getPKValues: function () {
				var pkValues = {},
					self = this;
				YArray.each(self.get('primaryKeys'), function (name) {
					pkValues[name] = self._values[name];
				});
				return pkValues;
			},
			/**
				Returns an HTML-escaped version of the value of the specified string
				attribute. The value is escaped using Y.Escape.html().

				@method getAsHTML
				@param {String} name Attribute name or object property path.
				@return {String} HTML-escaped attribute value.
			**/
			getAsHTML: function (name) {
				var value = this.getValue(name);
				return Y.Escape.html(Lang.isValue(value) ? String(value) : '');
			},

			/**
			 * Returns a URL-encoded version of the value of the specified field,
			 * or a full URL with name=value sets for all fields if no name is given.
			 * The names and values are encoded using the native encodeURIComponent()
			 * function.

			 * @method getAsURL
			 * @param [name] {String}  Field name.
			 * @return {String} URL-encoded field value if name is given or URL encoded set of name=value pairs for all fields.
			 */
			getAsURL: function (name) {
				var value = this.getValue(name),
					url = [];
				if (name) {
					return encodeURIComponent(Lang.isValue(value) ? String(value) : '');
				} else {
					YObject.each(value, function (value, name) {
						if (Lang.isValue(value)) {
							url.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
						}
					});
					return url.join('&');
				}
			},

			/**
			 * Default function for the loaded event. Does the actual setting of the values just loaded.
			 * @method _defDataLoaded
			 * @param ev {EventFacade} see loaded event
			 * @private
			 */
			_defDataLoaded: function (ev) {
				var self = this;
				self.setValues(ev.parsed, ev.src);
				self._set(IS_MODIFIED, false);
				self._set(IS_NEW, false);
				self._loadedValues = Y.clone(self._values);
			},
			/**
				Loads this model from the server.

				This method delegates to the sync() method to perform the actual load
				operation, which is an asynchronous action. Specify a _callback_ function to
				be notified of success or failure.

				A successful load operation will fire a loaded event, while an unsuccessful
				load operation will fire an error event with the src value "load".

				@method load
				@param options {Object} Options to be passed to sync().
					Usually these will be or will include the keys used by the remote source 
					to locate the data to be loaded.
					They will be passed on unmodified to the sync method.
					It is up to sync to determine what they mean.
				@param [callback] {callback}  Called when the sync operation finishes. Callback will receive:
					@param callback.err {string|null} Error message, if any or null.
					@param callback.response {Any} The server response as received by sync(),
				@chainable
			**/
			load: function (options, callback) {
				var self = this;

				if (typeof options === 'function') {
					callback = options;
					options = {};
				} else if (!options) {
					options = {};
				}

				self.sync('read', options, function (err, response) {
					var facade = {
							options : options,
							response: response
						};

					if (err) {
						facade.error = err;
						facade.src = 'load';

						self.fire(EVT_ERROR, facade);
					} else {

						facade.parsed = self.parse(response);
						self.fire(EVT_LOADED, facade);
					}

					callback && callback.apply(null, arguments);
				});

				return self;
			},

			/**
				Called to parse the _response_ when a response is received from the server.
				This method receives a server _response_ and is expected to return a
				value hash.

				The default implementation assumes that _response_ is either an attribute
				hash or a JSON string that can be parsed into an attribute hash. If
				_response_ is a JSON string and either Y.JSON or the native JSON object
				are available, it will be parsed automatically. If a parse error occurs, an
				error event will be fired and the model will not be updated.

				You may override this method to implement custom parsing logic if necessary.

				@method parse
				@param {Any} response Server response.
				@return {Object} Values hash.
			**/
			parse: function (response) {
				if (typeof response === 'string') {
					try {
						return Y.JSON.parse(response);
					} catch (ex) {
						this.fire(EVT_ERROR, {
							error : ex,
							response: response,
							src : 'parse'
						});

						return null;
					}
				}

				return response;
			},



			/**
				Saves this model to the server.

				This method delegates to the sync() method to perform the actual save
				operation, which is an asynchronous action. Specify a _callback_ function to
				be notified of success or failure.

				A successful save operation will fire a saved event, while an unsuccessful
				load operation will fire an error event with the src value "save".

				If the save operation succeeds and the parse method returns non-empty values
				within the response	a loaded event will also be fired to read those values.

				@method save
				@param {Object} [options] Options to be passed to sync() and to set()
					when setting synced attributes. It's up to the custom sync implementation
					to determine what options it supports or requires, if any.
				@param {Function} [callback] Called when the sync operation finishes.
					@param callback.err {string|null} Error message, if any or null.
					@param callback.response {Any} The server response as received by sync(),
				@chainable
			**/
			save: function (options, callback) {
				var self = this;

				if (typeof options === 'function') {
					callback = options;
					options = {};
				} else if (!options) {
					options = {};
				}

				self._validate(self.getValues(), function (err) {
					if (err) {
						callback && callback.call(null, err);
						return;
					}

					self.sync(self.get(IS_NEW) ? 'create' : 'update', options, function (err, response) {
						var facade = {
								options : options,
								response: response
							};

						if (err) {
							facade.error = err;
							facade.src = 'save';

							self.fire(EVT_ERROR, facade);
						} else {
							facade.parsed = self.parse(response);
							if (facade.parsed) {
								self.fire(EVT_LOADED, facade);
							}

							self._set(IS_MODIFIED, false);
							self._set(IS_NEW, false);
							self._loadedValues = Y.clone(self._values);
							self.fire(EVT_SAVED, facade);
						}

						callback && callback.apply(null, arguments);
					});
				});

				return self;
			},
			reset: function(name) {
				if (name) {
					this._values[name] = this._loadedValues[name];
				} else {
					this._values = Y.clone(this._loadedValues);
				}
				return this;
			},
			/**
				Override this method to provide a custom persistence implementation for this
				model. The default just calls the callback without actually doing anything.

				This method is called internally by load(), save(), and destroy().

				@method sync
				@param {String} action Sync action to perform. May be one of the following:

					* create: Store a newly-created model for the first time.
					* read  : Load an existing model.
					* update: Update an existing model.
					* delete: Delete an existing model.

				@param {Object} [options] Sync options. It's up to the custom sync
					implementation to determine what options it supports or requires, if any.
				@param {Function} [callback] Called when the sync operation finishes.
					@param {Error|null} callback.err If an error occurred, this parameter will
						contain the error. If the sync operation succeeded, _err_ will be
						falsy.
					@param {Any} [callback.response] The server's response. This value will
						be passed to the parse() method, which is expected to parse it and
						return an attribute hash.
			**/
			sync: function (action, options, callback) {

				if (typeof callback === 'function') {
					callback();
				}
			},
			/**
				Override this method to provide custom validation logic for this model.

				While attribute-specific validators can be used to validate individual
				attributes, this method gives you a hook to validate a hash of all
				attributes before the model is saved. This method is called automatically
				before save() takes any action. If validation fails, the save() call
				will be aborted.

				In your validation method, call the provided callback function with no
				arguments to indicate success. To indicate failure, pass a single argument,
				which may contain an error message, an array of error messages, or any other
				value. This value will be passed along to the error event.

				@example

				model.validate = function (attrs, callback) {
				if (attrs.pie !== true) {
				// No pie?! Invalid!
				callback('Must provide pie.');
				return;
				}

				// Success!
				callback();
				};

				@method validate
				@param {Object} attrs Attribute hash containing all model attributes to
				be validated.
				@param {Function} callback Validation callback. Call this function when your
				validation logic finishes. To trigger a validation failure, pass any
				value as the first argument to the callback (ideally a meaningful
				validation error of some kind).

				@param {Any} [callback.err] Validation error. Don't provide this
				argument if validation succeeds. If validation fails, set this to an
				error message or some other meaningful value. It will be passed
				along to the resulting error event.
			**/
			validate: function (attrs, callback) {
				callback && callback();
			},
			/**
				Calls the public, overridable validate() method and fires an error event
				if validation fails.

				@method _validate
				@param {Object} attributes Attribute hash.
				@param {Function} callback Validation callback.
				@param {Any} [callback.err] Value on failure, non-value on success.
				@protected
			**/
			_validate: function (attributes, callback) {
				var self = this;

				self.validate(attributes, function (err) {
					if (Lang.isValue(err)) {
						// Validation failed. Fire an error.
						self.fire(EVT_ERROR, {
							attributes: attributes,
							error : err,
							src : 'validate'
						});

						callback(err);
						return;
					}

					callback();
				});

			},
			/**
				Returns a copy of this model's attributes that can be passed to
				Y.JSON.stringify() or used for other nefarious purposes.

				The clientId attribute is not included in the returned object.

				If you've specified a custom attribute name in the idAttribute property,
				the default id attribute will not be included in the returned object.

				@method toJSON
				@return {Object} Copy of this model's attributes.
			**/
			toJSON: function () {
				return this.getValue();
			},
			_isModifiedGetter: function (value, name) {
				name = name.split(DOT);
				if (name.length > 1) {
					name = name[1];
					var ret = {};
					ret[name] = this._values[name] !== this._loadedValues[name];
					return ret;
				} else {
					return value;
				}

			},
			_isNewGetter: function (value, name) {
				name = name.split(DOT);
				if (name.length > 1) {
					name = name[1];
					var ret = {};
					ret[name] = !this._loadedValues.hasOwnProperty(name);
					return ret;
				} else {
					return value;
				}
			},
			_primaryKeysSetter: function (value) {
				if (this._primaryKeys && this._primaryKeys.length) {
					return Y.Attribute.INVALID_VALUE;
				}
				value = new YArray(value);
				this._primaryKeys = value;
				return value;
			},
			_primaryKeysGetter: function (value, name) {
				name = name.split(DOT);
				if (name.length > 1) {
					name = name[1];
					var ret = {};
					ret[name] = value.indexOf(name) !== -1;
					return ret;
				} else {
					return (value || []).concat();  // makes sure to return a copy, not the original.
				}
			}
		},
		{
			ATTRS: {
				/**
				 * Indicates whether any of the fields has been changed since created or loaded.
				 * Field names can be given as sub-attributes to indicate if any particular field has beeen changed.
				 * model.get('isModified.name') returns true if the field _name_ has been modified.
				 * <b>Note:</b> contrary to common practice in Attributes with sub-attributes, 
				 * requesting the state of the record does not
				 * return an object with the state of each individual field keyed by field name,
				 * but the state of the record as a whole, which is far more useful.
				 * @attribute isModified
				 * @type Boolean
				 * @default false
				 */
				isModified: {
					readOnly: true,
					value:false,
					validator:Lang.isBoolean,
					getter: '_isModifiedGetter'
				},
				/**
				 * Indicates that the model is new and has not been modified since creation.
				 * Field names can be given as sub-attributes to indicate if any particular field is new.
				 * model.get('isNew.name') returns true if the field _name_ is new.
				 * <b>Note:</b> contrary to common practice in Attributes with sub-attributes, 
				 * requesting the state of the record does not
				 * return an object with the state of each individual field keyed by field name,
				 * but the state of the record as a whole, which is far more useful.
				 * @attribute isNew
				 * @type Boolean
				 * @default true
				 */
				isNew: {
					readOnly: true,
					value:true,
					validator:Lang.isBoolean,
					getter: '_isNewGetter'
				},
				/**
				 * List of fields making the primary key of this model. 
				 * Primary Key fields cannot be modified once initially loaded.
				 * It can be set as an array of field names or, if the key is made of a single field, a string with the name of that field.
				 * It will always be returned as an array.
				 * Field names can be given as a sub-attribute to ask whether a particular field is a primary key, thus:
				 * model.get('primaryKeys.name') returns true of the field name is a primary key.
				 * It can only be set once.
				 * @attribute primaryKeys
				 * @writeonce
				 * @type array
				 * @default []
				 */
				primaryKeys: {
					setter:'_primaryKeysSetter',
					getter:'_primaryKeysGetter',
					lazyAdd: false,
					value: []
				}
			}

		}
	);
	Y.GalleryModelSimpleUndo = function () {
		this._lastChange = {};
		this.after(EVT_CHANGE, this._trackChange);
	};
	
	Y.GalleryModelSimpleUndo.prototype = {
		_trackChange: function (ev) {
			this._lastChange[ev.name] = ev.prevVal;
		},
		undo: function (name) {
			var self = this;
			if (name) {
				self._set(name, self._lastChange[name], {src:'undo'});
			} else {
				YObject.each(this._lastChange, function (value, name) {
					self._set(name, value, {src:'undo'});
				});
			}
		}
	};
	

