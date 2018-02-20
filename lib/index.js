'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Imports
 */
var query_selector_array_1 = require("@veams/helpers/lib/browser/query-selector-array");
var extend_1 = require("@veams/helpers/lib/object/extend");
var for_each_1 = require("@veams/helpers/lib/array/for-each");
/**
 * Lokal vars
 */
var Veams = {};
var __cache = [];
var __register = {
    modulesInRegister: [],
    modulesOnConditions: [],
    modulesOnInit: [],
    modulesInContext: []
};
/**
 * Module Class
 */
var Modules = /** @class */ (function () {
    /**
     * Constructor
     */
    function Modules(VEAMS, opts) {
        if (VEAMS === void 0) { VEAMS = window['Veams']; }
        /**
         * Generic elements
         */
        this.queryString = "[" + this.options.attrPrefix + "-" + this.options.attrName + "]";
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
    Modules.prototype.initialize = function () {
        __register.modulesInContext = query_selector_array_1.default(this.queryString);
        if (this.options.useMutationObserver) {
            this.observe(document.body);
        }
        this.bindEvents();
    };
    Modules.prototype.bindEvents = function () {
        var _this = this;
        if (!Veams.Vent && this.options.useMutationObserver === false) {
            console.info('VeamsModules :: In order to work with the the ajax handling in VeamsModulesHandler ' +
                'you need to define "useMutationObserver" or use the VeamsVent plugin!');
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
    };
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
    Modules.addToCache = function (_a) {
        var module = _a.module, element = _a.element, instance = _a.instance, namespace = _a.namespace;
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
    };
    Modules.removeFromCacheByKey = function (obj, key) {
        if (key === void 0) { key = 'element'; }
        var deleteIndex;
        for (var i = 0; i < __cache.length; i++) {
            var cacheItem = __cache[i];
            if (cacheItem[key] === obj) {
                if (cacheItem.instance.willUnmount)
                    cacheItem.instance.willUnmount();
                if (cacheItem.instance.unregisterEvents)
                    cacheItem.instance.unregisterEvents();
                if (cacheItem.instance.didUnmount)
                    cacheItem.instance.didUnmount();
                deleteIndex = i;
            }
        }
        if (deleteIndex)
            __cache.splice(deleteIndex, 1);
    };
    Modules.checkModuleInCache = function (obj, key, namespace) {
        if (key === void 0) { key = 'element'; }
        if (namespace === void 0) { namespace = undefined; }
        var state = false;
        for (var i = 0; i < __cache.length; i++) {
            var cacheItem = __cache[i];
            state = (namespace !== undefined) ? cacheItem[key] === obj && cacheItem.namespace === namespace : cacheItem[key] === obj;
            if (state)
                break;
        }
        return state;
    };
    // ------------------------
    // CONDITIONS HANDLER
    // ------------------------
    Modules.isCondition = function (_a) {
        var conditions = _a.conditions;
        return conditions && typeof conditions === 'function';
    };
    Modules.makeConditionCheck = function (_a) {
        var conditions = _a.conditions;
        if (conditions && typeof conditions === 'function') {
            return conditions();
        }
    };
    Modules.prototype.bindConditions = function () {
        var _this = this;
        __register.modulesOnConditions.forEach(function (module) {
            if (module.conditionsListenOn && module.conditionsListenOn.length) {
                _this.bindCondition(module);
            }
        });
    };
    Modules.prototype.bindCondition = function (module) {
        var _this = this;
        var globalEvts = module.conditionsListenOn.join(' ');
        if (Veams.Vent) {
            Veams.Vent.subscribe(globalEvts, function () {
                _this.registerConditionalModule(module);
            });
        }
    };
    // ------------------------
    // UN/REGISTER HANDLER
    // ------------------------
    /**
     * Split up modules depending on condition check
     */
    Modules.prototype.splitUpModules = function () {
        var _this = this;
        __register.modulesInRegister.forEach(function (obj) {
            _this.addModuleToCache(obj);
        });
    };
    /**
     * Add module to cache
     */
    Modules.prototype.addModuleToCache = function (obj) {
        if (Modules.isCondition(obj)) {
            __register.modulesOnConditions.push(obj);
        }
        else {
            __register.modulesOnInit.push(obj);
        }
    };
    /**
     * Register multiple modules.
     *
     * @param {Array} arr - Array which contains the modules as object.
     *
     * @public
     */
    Modules.prototype.register = function (arr) {
        if (!Array.isArray(arr)) {
            throw new Error('VeamsModules :: You need to pass an array to register()!');
        }
        __register.modulesInRegister = __register.modulesInRegister.concat(arr);
        this.splitUpModules();
        this.bindConditions();
        this.registerAll();
    };
    Modules.prototype.add = function () {
        var module = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            module[_i] = arguments[_i];
        }
        var args = module.slice();
        var currentModule = args[0];
        if (args.length === 1 && typeof args[0] !== 'object') {
            console.error("Veams Modules :: You have to provide an object to add a new module! Received \"" + args[0] + "\"");
            return;
        }
        if (args.length > 1) {
            console.info('Veams Modules :: Please use an object as parameter. ' +
                'The initialisation with string parameters is deprecated and will be removed in the upcoming release!');
            currentModule = {
                namespace: args[0],
                module: args[1],
                options: args[2] || {},
                render: args[3] || true
            };
        }
        if (args.length > 4) {
            console.error('Veams Modules :: Please use an object as parameter!');
            return;
        }
        __register.modulesInRegister.push(currentModule);
        if (Modules.isCondition(currentModule)) {
            if (currentModule.conditionsListenOn && currentModule.conditionsListenOn.length) {
                this.bindCondition(currentModule);
            }
            this.registerConditionalModule(currentModule);
        }
        else {
            this.registerOne(currentModule);
        }
        this.addModuleToCache(currentModule);
    };
    /**
     * Register all modules
     */
    Modules.prototype.registerAll = function () {
        if (!__register.modulesInRegister)
            return;
        this.registerInitialModules();
        this.registerConditionalModules();
    };
    /**
     * Register all initial modules
     */
    Modules.prototype.registerInitialModules = function () {
        var _this = this;
        __register.modulesOnInit.forEach(function (obj) {
            _this.registerOne(obj);
        });
    };
    /**
     * Register conditional modules
     *
     * Therefore we check the condition and
     * when true register the specific module
     * when false unregister the specific module
     */
    Modules.prototype.registerConditionalModules = function () {
        var _this = this;
        __register.modulesOnConditions.forEach(function (obj) {
            _this.registerConditionalModule(obj);
        });
    };
    Modules.prototype.registerConditionalModule = function (obj) {
        if (Modules.makeConditionCheck(obj)) {
            this.registerOne(obj);
        }
        else {
            this.unregisterOne(obj);
        }
    };
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
    Modules.prototype.registerOne = function (_a) {
        var namespace = _a.namespace, domName = _a.domName, module = _a.module, render = _a.render, cb = _a.cb, options = _a.options;
        var nameSpace = namespace ? namespace : domName;
        if (!module)
            throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');
        if (!nameSpace)
            throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');
        this.initModules({
            namespace: nameSpace,
            module: module,
            render: render,
            cb: cb,
            options: options
        });
    };
    Modules.prototype.unregisterOne = function (_a) {
        var namespace = _a.namespace;
        if (Modules.checkModuleInCache(namespace, 'namespace') === true) {
            Modules.removeFromCacheByKey(namespace, 'namespace');
        }
    };
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
    Modules.prototype.initModules = function (_a) {
        var _this = this;
        var namespace = _a.namespace, module = _a.module, _b = _a.render, render = _b === void 0 ? true : _b, _c = _a.options, options = _c === void 0 ? {} : _c, _d = _a.cb, cb = _d === void 0 ? null : _d;
        for_each_1.default(__register.modulesInContext, function (i, el) {
            _this.initModule({
                el: el,
                namespace: namespace,
                options: options,
                module: module,
                render: render,
                cb: cb
            });
        });
    };
    Modules.prototype.initModule = function (_a) {
        var el = _a.el, namespace = _a.namespace, _b = _a.options, options = _b === void 0 ? {} : _b, module = _a.module, _c = _a.render, render = _c === void 0 ? true : _c, _d = _a.cb, cb = _d === void 0 ? null : _d;
        var noRender = el.getAttribute(this.options.attrPrefix + "-no-render") || render === false || false;
        var dataModules = el.getAttribute(this.options.attrPrefix + "-" + this.options.attrName).split(' ');
        if (dataModules.indexOf(namespace) !== -1) {
            // Check init state
            if (Modules.checkModuleInCache(el, 'element', namespace) === true) {
                console.info('VeamsModules :: Element is already in cache and initialized: ');
                console.log(el);
                return;
            }
            // Go ahead when condition is true
            var attrs = el.getAttribute(this.options.attrPrefix + "-" + this.options.attrOptions);
            var mergedOptions = extend_1.default(JSON.parse(attrs), options);
            var Module = module;
            var instance = new Module({
                el: el,
                namespace: namespace,
                options: mergedOptions,
                appInstance: Veams
            });
            Modules.addToCache({
                element: el,
                module: module,
                instance: instance,
                namespace: namespace
            });
            // Mount process
            if (instance.willMount)
                instance.willMount();
            // Render after initial module loading
            if (!noRender)
                instance.render();
            // Provide callback function in which you can use module and options
            if (cb && typeof (cb) === 'function')
                cb(module, mergedOptions);
            // Mount process
            if (instance.didMount)
                instance.didMount();
        }
    };
    /**
     * Add mutation observer to observe new modules.
     *
     * @param {Object} context - Context for the mutation observer
     *
     * TODO: Improve for loops
     */
    Modules.prototype.observe = function (context) {
        var _this = this;
        var observer = new MutationObserver(function (mutations) {
            // look through all mutations that just occured
            for (var i = 0; i < mutations.length; ++i) {
                // look through all added nodes of this mutation
                for (var j = 0; j < mutations[i].addedNodes.length; ++j) {
                    var addedNode = mutations[i].addedNodes[j];
                    if (addedNode instanceof HTMLElement) {
                        if (addedNode.getAttribute(_this.options.attrPrefix + "-" + _this.options.attrName)) {
                            var namespace = addedNode.getAttribute(_this.options.attrPrefix + "-" + _this.options.attrName);
                            if (_this.options.logs) {
                                console.info("VeamsModules :: Recording a new module with the namespace " + namespace + " at: ", addedNode);
                            }
                            for (var _i = 0, _a = __register.modulesInRegister; _i < _a.length; _i++) {
                                var moduleInstance = _a[_i];
                                if (moduleInstance.namespace === namespace) {
                                    _this.initModule({
                                        el: addedNode,
                                        module: moduleInstance.module,
                                        namespace: moduleInstance.namespace
                                    });
                                    break;
                                }
                            }
                        }
                        if (_this.getModulesInContext(addedNode).length) {
                            __register.modulesInContext = _this.getModulesInContext(addedNode);
                            if (_this.options.logs) {
                                console.info('VeamsModules :: Recording new context. When available new modules will be initialised in: ', addedNode);
                            }
                            _this.registerAll();
                            __register.modulesInContext = _this.getModulesInContext(document);
                        }
                    }
                }
                for (var j = 0; j < mutations[i].removedNodes.length; ++j) {
                    var removedNode = mutations[i].removedNodes[j];
                    if (removedNode instanceof HTMLElement) {
                        if (removedNode.getAttribute(_this.options.attrPrefix + "-" + _this.options.attrName)) {
                            if (_this.options.logs) {
                                console.info('VeamsModules :: Recording deletion of module: ', removedNode);
                            }
                            Modules.removeFromCacheByKey(removedNode);
                            __register.modulesInContext = _this.getModulesInContext(document);
                        }
                        if (_this.getModulesInContext(removedNode).length) {
                            __register.modulesInContext = _this.getModulesInContext(removedNode);
                            if (_this.options.logs) {
                                console.info('VeamsModules :: Recording deletion of DOM element. When available modules will be unbound in ', removedNode);
                            }
                            __register.modulesInContext.forEach(function (node) {
                                Modules.removeFromCacheByKey(node);
                            });
                            __register.modulesInContext = _this.getModulesInContext(document);
                        }
                    }
                }
            }
        });
        observer.observe(context, {
            childList: true,
            subtree: true
        });
    };
    /**
     * Get Modules in a specific context.
     *
     * @param {Object} context - Context for query specific string
     */
    Modules.prototype.getModulesInContext = function (context) {
        return query_selector_array_1.default(this.queryString, context);
    };
    return Modules;
}());
exports.Modules = Modules;
/**
 * Plugin Object
 */
var VeamsModules = {
    options: {
        attrPrefix: 'data-js',
        attrName: 'module',
        attrOptions: 'options',
        logs: false,
        internalCacheOnly: true,
        internalRegisterOnly: false,
        useMutationObserver: false
    },
    pluginName: 'ModulesHandler',
    initialize: function (Veams, opts) {
        if (opts === void 0) { opts = {}; }
        this.options = extend_1.default(this.options, opts);
        Veams.modules = Veams.modules || new Modules(Veams, this.options);
    }
};
exports.default = VeamsModules;
//# sourceMappingURL=index.js.map