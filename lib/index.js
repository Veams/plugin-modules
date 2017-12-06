(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("index", [], factory);
	else if(typeof exports === 'object')
		exports["index"] = factory();
	else
		root["index"] = root["index"] || {}, root["index"]["index"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Veams = {};
	var __cache = [];
	var __register = {
		modulesInRegister: [],
		modulesOnConditions: [],
		modulesOnInit: [],
		modulesInContext: []
	};
	
	/**
	 * TODO: Clean up mutation observer
	 */
	
	/**
	 * - Get modules in DOM
	 * - Get classes and options from init process
	 * - Split up conditional modules from initial modules
	 * - Init other modules
	 * - Bind events when available from conditional modules
	 * -
	 */
	
	var Modules = function () {
		function Modules() {
			var VEAMS = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.Veams;
			var opts = arguments[1];
	
			_classCallCheck(this, Modules);
	
			Veams = VEAMS;
	
			this.options = opts;
	
			if (!this.options.internalCacheOnly) {
				this._cache = __cache; // Module list
			}
	
			if (!this.options.internalRegisterOnly) {
				this._register = __register;
			}
	
			this.initialize();
		}
	
		_createClass(Modules, [{
			key: 'initialize',
			value: function initialize() {
				this.queryString = '[' + this.options.attrPrefix + '-' + this.options.attrName + ']';
				__register.modulesInContext = Veams.helpers.querySelectorArray(this.queryString);
	
				if (this.options.useMutationObserver) {
					this.observe(document.body);
				}
	
				this.bindEvents();
			}
		}, {
			key: 'bindEvents',
			value: function bindEvents() {
				var _this = this;
	
				if (!Veams.Vent && this.options.useMutationObserver === false) {
					console.info('VeamsModules :: In order to work with the the ajax handling in VeamsModulesHandler ' + 'you need to define "useMutationObserver" or use the VeamsVent plugin!');
	
					return;
				}
	
				if (Veams.Vent && this.options.useMutationObserver === false) {
					Veams.Vent.on(Veams.EVENTS.DOMchanged, function (e, context) {
						__register.modulesInContext = _this.getModulesInContext(context);
	
						if (_this.options.logs) {
							console.info('VeamsModules :: Recording new context. When available new modules will be initialised in: ', context);
						}
	
						_this.registerAll();
					});
				}
			}
	
			// ------------------------
			// STATIC CACHE HANDLER
			// ------------------------
	
			/**
	   * Save the module in __cache.
	   *
	   * @param {Object} module - module metadata object (@see VeamsComponent.metaData())
	   * @param {Object} element - module element (this.el)
	   * @param {Object} instance - module instance
	   * @param {String} namespace - module namespace
	   */
	
		}, {
			key: 'bindConditions',
			value: function bindConditions() {
				var _this2 = this;
	
				__register.modulesOnConditions.forEach(function (module) {
					if (module.conditionsListenOn && module.conditionsListenOn.length) {
						_this2.bindCondition(module);
					}
				});
			}
		}, {
			key: 'bindCondition',
			value: function bindCondition(module) {
				var _this3 = this;
	
				var globalEvts = module.conditionsListenOn.join(' ');
	
				if (Veams.Vent) {
					Veams.Vent.subscribe(globalEvts, function () {
						_this3.registerConditionalModule(module);
					});
				}
			}
	
			// ------------------------
			// UN/REGISTER HANDLER
			// ------------------------
	
			/**
	   * Split up modules depending on condition check
	   */
	
		}, {
			key: 'splitUpModules',
			value: function splitUpModules() {
				var _this4 = this;
	
				__register.modulesInRegister.forEach(function (obj) {
					if (_this4.constructor.isCondition(obj)) {
						__register.modulesOnConditions.push(obj);
					} else {
						__register.modulesOnInit.push(obj);
					}
				});
			}
	
			/**
	   * Register multiple modules.
	   *
	   * @param {Array} arr - Array which contains the modules as object.
	   *
	   * @public
	   */
	
		}, {
			key: 'register',
			value: function register(arr) {
				if (!Array.isArray(arr)) {
					throw new Error('VeamsModules :: You need to pass an array to register()!');
				}
	
				__register.modulesInRegister = __register.modulesInRegister.concat(arr);
	
				this.splitUpModules();
				this.bindConditions();
				this.registerAll();
			}
		}, {
			key: 'add',
			value: function add() {
				for (var _len = arguments.length, module = Array(_len), _key = 0; _key < _len; _key++) {
					module[_key] = arguments[_key];
				}
	
				var args = [].concat(module);
				var currentModule = args[0];
	
				if (args.length === 1 && _typeof(args[0]) !== 'object') {
					console.error('Veams Modules :: You have to provide an object to add a new module! Received "' + args[0] + '"');
					return;
				}
	
				if (args.length > 1) {
					console.info('Veams Modules :: Please use an object as parameter. ' + 'The initialisation with string parameters is deprecated and will be removed in the upcoming release!');
	
					currentModule = {
						namespace: args[0],
						module: args[1],
						options: args[2] || {},
						render: args[3] || false
					};
				}
	
				if (args.length > 4) {
					console.error('Veams Modules :: Please use an object as parameter!');
					return;
				}
	
				__register.modulesInRegister.push(currentModule);
	
				if (this.constructor.isCondition(currentModule)) {
					if (currentModule.conditionsListenOn && currentModule.conditionsListenOn.length) {
						this.bindCondition(currentModule);
					}
					this.registerConditionalModule(currentModule);
				} else {
					this.registerOne(currentModule);
				}
			}
	
			/**
	   * Register all modules
	   */
	
		}, {
			key: 'registerAll',
			value: function registerAll() {
				if (!__register.modulesInRegister) return;
	
				this.registerInitialModules();
				this.registerConditionalModules();
			}
	
			/**
	   * Register all initial modules
	   */
	
		}, {
			key: 'registerInitialModules',
			value: function registerInitialModules() {
				var _this5 = this;
	
				__register.modulesOnInit.forEach(function (obj) {
					_this5.registerOne(obj);
				});
			}
	
			/**
	   * Register conditional modules
	   *
	   * Therefore we check the condition and
	   * when true register the specific module
	   * when false unregister the specific module
	   */
	
		}, {
			key: 'registerConditionalModules',
			value: function registerConditionalModules() {
				var _this6 = this;
	
				__register.modulesOnConditions.forEach(function (obj) {
					_this6.registerConditionalModule(obj);
				});
			}
		}, {
			key: 'registerConditionalModule',
			value: function registerConditionalModule(obj) {
				if (this.constructor.makeConditionCheck(obj)) {
					this.registerOne(obj);
				} else {
					this.unregisterOne(obj);
				}
			}
	
			/**
	   * Register one module and init the elements in the specific context
	   *
	   * @param {String} namespace - Required: element name in DOM
	   * @param {String} domName - Required: element name in DOM
	   * @param {Object} module - Required: class which will be used to render your module
	   * @param {boolean} [render=true] - Optional: render the class, if false the class will only be initialized
	   * @param {function} [cb] - Optional: provide a function which will be executed after initialisation
	   * @param {Object} [options] - Optional: You can pass options to the module via JS (Useful for DOMChanged)
	   *
	   */
	
		}, {
			key: 'registerOne',
			value: function registerOne(_ref) {
				var namespace = _ref.namespace,
				    domName = _ref.domName,
				    module = _ref.module,
				    render = _ref.render,
				    cb = _ref.cb,
				    options = _ref.options;
	
				var nameSpace = namespace ? namespace : domName;
	
				if (!module) throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');
				if (!nameSpace) throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');
	
				this.initModules({
					namespace: nameSpace,
					module: module,
					render: render,
					cb: cb,
					options: options
				});
			}
		}, {
			key: 'unregisterOne',
			value: function unregisterOne(_ref2) {
				var namespace = _ref2.namespace;
	
				if (this.constructor.checkModuleInCache(namespace, 'namespace') === true) {
					this.constructor.removeFromCacheByKey(namespace, 'namespace');
				}
			}
	
			// ------------------------
			// INIT HANDLER
			// ------------------------
	
			/**
	   * Initialize a module and render it and/or provide a callback function
	   *
	   * @param {string} namespace - Required: dom name of the element
	   * @param {Object} module - Required: class which will be used to render your module
	   * @param {boolean} [render=true] - Optional: render the class, if false the class will only be initialized
	   * @param {Object} [options] - Optional: You can pass options to the module via JS (Useful for DOMChanged)
	   * @param {function} [cb] - Optional: provide a function which will be executed after initialisation
	   *
	   */
	
		}, {
			key: 'initModules',
			value: function initModules(_ref3) {
				var _this7 = this;
	
				var namespace = _ref3.namespace,
				    module = _ref3.module,
				    render = _ref3.render,
				    options = _ref3.options,
				    cb = _ref3.cb;
	
				Veams.helpers.forEach(__register.modulesInContext, function (i, el) {
					_this7.initModule({
						el: el,
						namespace: namespace,
						options: options,
						module: module,
						render: render,
						cb: cb
					});
				});
			}
		}, {
			key: 'initModule',
			value: function initModule(_ref4) {
				var el = _ref4.el,
				    namespace = _ref4.namespace,
				    options = _ref4.options,
				    module = _ref4.module,
				    render = _ref4.render,
				    cb = _ref4.cb;
	
				var noRender = el.getAttribute(this.options.attrPrefix + '-no-render') || render === false || false;
				var dataModules = el.getAttribute(this.options.attrPrefix + '-' + this.options.attrName).split(' ');
	
				if (dataModules.indexOf(namespace) !== -1) {
					// Check init state
					if (this.constructor.checkModuleInCache(el, 'element', namespace) === true) {
						console.info('VeamsModules :: Element is already in cache and initialized: ');
						console.log(el);
						return;
					}
	
					// Go ahead when condition is true
					var attrs = el.getAttribute(this.options.attrPrefix + '-' + this.options.attrOptions);
					var mergedOptions = Veams.helpers.extend(JSON.parse(attrs), options || {});
					var Module = module;
					var instance = new Module({
						el: el,
						namespace: namespace,
						options: mergedOptions,
						appInstance: Veams
					});
	
					this.constructor.addToCache({
						element: el,
						module: module,
						instance: instance,
						namespace: namespace
					});
	
					// Mount process
					if (instance.willMount) instance.willMount();
	
					// Render after initial module loading
					if (!noRender) instance.render();
	
					// Provide callback function in which you can use module and options
					if (cb && typeof cb === 'function') cb(module, mergedOptions);
	
					// Mount process
					if (instance.didMount) instance.didMount();
				}
			}
	
			/**
	   * Add mutation observer to observe new modules.
	   *
	   * @param {Object} context - Context for the mutation observer
	   *
	   * TODO: Improve for loops
	   */
	
		}, {
			key: 'observe',
			value: function observe(context) {
				var _this8 = this;
	
				var observer = new MutationObserver(function (mutations) {
					// look through all mutations that just occured
					for (var i = 0; i < mutations.length; ++i) {
						// look through all added nodes of this mutation
	
						for (var j = 0; j < mutations[i].addedNodes.length; ++j) {
							var addedNode = mutations[i].addedNodes[j];
	
							if (addedNode instanceof HTMLElement) {
								if (addedNode.getAttribute(_this8.options.attrPrefix + '-' + _this8.options.attrName)) {
									var namespace = addedNode.getAttribute(_this8.options.attrPrefix + '-' + _this8.options.attrName);
	
									if (_this8.options.logs) {
										console.info('VeamsModules :: Recording a new module with the namespace ' + namespace + ' at: ', addedNode);
									}
	
									var _iteratorNormalCompletion = true;
									var _didIteratorError = false;
									var _iteratorError = undefined;
	
									try {
										for (var _iterator = __register.modulesInRegister[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
											var _module = _step.value;
	
											if (_module.namespace === namespace) {
												_this8.initModule({
													el: addedNode,
													module: _module.module,
													namespace: _module.namespace
												});
	
												break;
											}
										}
									} catch (err) {
										_didIteratorError = true;
										_iteratorError = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion && _iterator.return) {
												_iterator.return();
											}
										} finally {
											if (_didIteratorError) {
												throw _iteratorError;
											}
										}
									}
								}
	
								if (_this8.getModulesInContext(addedNode).length) {
									__register.modulesInContext = _this8.getModulesInContext(addedNode);
	
									if (_this8.options.logs) {
										console.info('VeamsModules :: Recording new context. When available new modules will be initialised in: ', addedNode);
									}
	
									_this8.registerAll();
	
									__register.modulesInContext = _this8.getModulesInContext(document);
								}
							}
						}
	
						for (var _j = 0; _j < mutations[i].removedNodes.length; ++_j) {
							var removedNode = mutations[i].removedNodes[_j];
	
							if (removedNode instanceof HTMLElement) {
								if (removedNode.getAttribute(_this8.options.attrPrefix + '-' + _this8.options.attrName)) {
	
									if (_this8.options.logs) {
										console.info('VeamsModules :: Recording deletion of module: ', removedNode);
									}
	
									_this8.constructor.removeFromCacheByKey(removedNode);
	
									__register.modulesInContext = _this8.getModulesInContext(document);
								}
	
								if (_this8.getModulesInContext(removedNode).length) {
									__register.modulesInContext = _this8.getModulesInContext(removedNode);
	
									if (_this8.options.logs) {
										console.info('VeamsModules :: Recording deletion of DOM element. When available modules will be unbound in ', removedNode);
									}
	
									__register.modulesInContext.forEach(function (node) {
										_this8.constructor.removeFromCacheByKey(node);
									});
	
									__register.modulesInContext = _this8.getModulesInContext(document);
								}
							}
						}
					}
				});
	
				observer.observe(context, {
					childList: true,
					subtree: true
				});
			}
	
			/**
	   * Get Modules in a specific context.
	   *
	   * @param {Object} context - Context for query specific string
	   */
	
		}, {
			key: 'getModulesInContext',
			value: function getModulesInContext(context) {
				return Veams.helpers.querySelectorArray(this.queryString, context);
			}
		}], [{
			key: 'addToCache',
			value: function addToCache(_ref5) {
				var module = _ref5.module,
				    element = _ref5.element,
				    instance = _ref5.instance,
				    namespace = _ref5.namespace;
	
				__cache.push({
					module: module,
					element: element,
					instance: instance,
					namespace: namespace
				});
	
				if (Veams.Vent && Veams.EVENTS.moduleCached) {
					Veams.Vent.trigger(Veams.EVENTS.moduleCached, {
						module: module,
						element: element
					});
				}
			}
		}, {
			key: 'removeFromCacheByKey',
			value: function removeFromCacheByKey(obj) {
				var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'element';
	
				var deleteIndex = void 0;
	
				for (var i = 0; i < __cache.length; i++) {
					var cacheItem = __cache[i];
	
					if (cacheItem[key] === obj) {
						if (cacheItem.instance.willUnmount) cacheItem.instance.willUnmount();
						if (cacheItem.instance.unregisterEvents) cacheItem.instance.unregisterEvents();
						if (cacheItem.instance.didUnmount) cacheItem.instance.didUnmount();
	
						deleteIndex = i;
					}
				}
	
				if (deleteIndex) __cache.splice(deleteIndex, 1);
			}
		}, {
			key: 'checkModuleInCache',
			value: function checkModuleInCache(obj) {
				var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'element';
				var namespace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
	
				var state = false;
	
				for (var i = 0; i < __cache.length; i++) {
					var cacheItem = __cache[i];
	
					state = namespace !== undefined ? cacheItem[key] === obj && cacheItem.namespace === namespace : cacheItem[key] === obj;
	
					if (state) break;
				}
	
				return state;
			}
	
			// ------------------------
			// CONDITIONS HANDLER
			// ------------------------
	
		}, {
			key: 'isCondition',
			value: function isCondition(_ref6) {
				var conditions = _ref6.conditions;
	
				return conditions && typeof conditions === 'function';
			}
		}, {
			key: 'makeConditionCheck',
			value: function makeConditionCheck(_ref7) {
				var conditions = _ref7.conditions;
	
				if (conditions && typeof conditions === 'function') {
					return conditions();
				}
			}
		}]);
	
		return Modules;
	}();
	
	/**
	 * Plugin object
	 */
	
	
	var VeamsModules = {
		options: {
			DEBUG: false,
			attrPrefix: 'data-js',
			attrName: 'module',
			attrOptions: 'options',
			logs: false,
			internalCacheOnly: true,
			internalRegisterOnly: false,
			useMutationObserver: false
		},
		pluginName: 'ModulesHandler',
		initialize: function initialize(Veams, opts) {
			this.options = Veams.helpers.extend(this.options, opts || {});
			Veams.modules = Veams.modules || new Modules(Veams, this.options);
		}
	};
	
	exports.default = VeamsModules;
	exports.Modules = Modules;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map