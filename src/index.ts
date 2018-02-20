'use strict';

/**
 * Imports
 */
import querySelectorArray from "@veams/helpers/lib/browser/query-selector-array";
import extend from "@veams/helpers/lib/object/extend";
import forEach from "@veams/helpers/lib/array/for-each";

/**
 * Lokal vars
 */
let Veams: any = {};
let __cache = [];
let __register = {
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

/**
 * Interface
 */
export interface PluginOptions {
	attrPrefix?: string,
	attrName?: string,
	attrOptions?: string,
	logs?: boolean,
	internalCacheOnly?: boolean,
	internalRegisterOnly?: boolean,
	useMutationObserver?: boolean
}

/**
 * Module Class
 */
class Modules {
	/**
	 * Options
	 */
	options: PluginOptions;

	/**
	 * Private Props
	 */
	private _cache: Array<object>;
	private _register: Object;

	/**
	 * Generic elements
	 */
	queryString = `[${this.options.attrPrefix}-${this.options.attrName}]`;

	/**
	 * Constructor
	 */
	constructor(VEAMS = window['Veams'], opts) {
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

	initialize() {
		__register.modulesInContext = querySelectorArray(this.queryString);

		if (this.options.useMutationObserver) {
			this.observe(document.body);
		}

		this.bindEvents();
	}

	bindEvents() {
		if (!Veams.Vent && this.options.useMutationObserver === false) {
			console.info('VeamsModules :: In order to work with the the ajax handling in VeamsModulesHandler ' +
				'you need to define "useMutationObserver" or use the VeamsVent plugin!');

			return;
		}

		if (Veams.Vent && this.options.useMutationObserver === false) {
			Veams.Vent.on(Veams.EVENTS.DOMchanged, (e, context) => {
				__register.modulesInContext = this.getModulesInContext(context);

				if (this.options.logs) {
					console.info('VeamsModules :: Recording new context. When available new modules will be initialised in: ', context);
				}

				this.registerAll();
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
	static addToCache({module, element, instance, namespace}) {
		__cache.push({
			module,
			element,
			instance,
			namespace
		});

		if (Veams.Vent && Veams.EVENTS.moduleCached) {
			Veams.Vent.trigger(Veams.EVENTS.moduleCached, {
				module,
				element
			});
		}
	}

	static removeFromCacheByKey(obj, key = 'element') {
		let deleteIndex;

		for (let i = 0; i < __cache.length; i++) {
			let cacheItem = __cache[i];

			if (cacheItem[key] === obj) {
				if (cacheItem.instance.willUnmount) cacheItem.instance.willUnmount();
				if (cacheItem.instance.unregisterEvents) cacheItem.instance.unregisterEvents();
				if (cacheItem.instance.didUnmount) cacheItem.instance.didUnmount();

				deleteIndex = i;
			}
		}

		if (deleteIndex) __cache.splice(deleteIndex, 1);
	}

	static checkModuleInCache(obj, key = 'element', namespace = undefined) {
		let state = false;

		for (let i = 0; i < __cache.length; i++) {
			let cacheItem = __cache[i];

			state = (namespace !== undefined) ? cacheItem[key] === obj && cacheItem.namespace === namespace : cacheItem[key] === obj;

			if (state) break;
		}

		return state;
	}

	// ------------------------
	// CONDITIONS HANDLER
	// ------------------------

	static isCondition({conditions}): boolean {
		return conditions && typeof conditions === 'function';
	}

	static makeConditionCheck({conditions}): boolean {
		if (conditions && typeof conditions === 'function') {
			return conditions();
		}
	}

	bindConditions() {
		__register.modulesOnConditions.forEach((module) => {
			if (module.conditionsListenOn && module.conditionsListenOn.length) {
				this.bindCondition(module);
			}
		});
	}

	bindCondition(module) {
		let globalEvts = module.conditionsListenOn.join(' ');

		if (Veams.Vent) {
			Veams.Vent.subscribe(globalEvts, () => {
				this.registerConditionalModule(module);
			});
		}
	}

	// ------------------------
	// UN/REGISTER HANDLER
	// ------------------------

	/**
	 * Split up modules depending on condition check
	 */
	splitUpModules() {
		__register.modulesInRegister.forEach((obj) => {
			this.addModuleToCache(obj);
		});
	}

	/**
	 * Add module to cache
	 */
	addModuleToCache(obj) {
		if (Modules.isCondition(obj)) {
			__register.modulesOnConditions.push(obj);
		} else {
			__register.modulesOnInit.push(obj);
		}
	}

	/**
	 * Register multiple modules.
	 *
	 * @param {Array} arr - Array which contains the modules as object.
	 *
	 * @public
	 */
	register(arr: Array<object>) {
		if (!Array.isArray(arr)) {
			throw new Error('VeamsModules :: You need to pass an array to register()!');
		}

		__register.modulesInRegister = __register.modulesInRegister.concat(arr);

		this.splitUpModules();
		this.bindConditions();
		this.registerAll();
	}

	add(...module) {
		const args = [...module];
		let currentModule = args[0];

		if (args.length === 1 && typeof args[0] !== 'object') {
			console.error(
				`Veams Modules :: You have to provide an object to add a new module! Received "${args[0]}"`
			);
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
		} else {
			this.registerOne(currentModule);
		}

		this.addModuleToCache(currentModule);
	}

	/**
	 * Register all modules
	 */
	registerAll() {
		if (!__register.modulesInRegister) return;

		this.registerInitialModules();
		this.registerConditionalModules();
	}

	/**
	 * Register all initial modules
	 */
	registerInitialModules() {
		__register.modulesOnInit.forEach((obj) => {
			this.registerOne(obj);
		});
	}

	/**
	 * Register conditional modules
	 *
	 * Therefore we check the condition and
	 * when true register the specific module
	 * when false unregister the specific module
	 */
	registerConditionalModules() {
		__register.modulesOnConditions.forEach((obj) => {
			this.registerConditionalModule(obj);
		});
	}

	registerConditionalModule(obj) {
		if (Modules.makeConditionCheck(obj)) {
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
	registerOne({namespace, domName, module, render, cb, options}): void {
		let nameSpace = namespace ? namespace : domName;

		if (!module) throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');
		if (!nameSpace) throw new Error('VeamsModules :: In order to work with register() or add() you need to define a module!');

		this.initModules({
			namespace: nameSpace,
			module,
			render,
			cb,
			options
		});
	}

	unregisterOne({namespace}): void {
		if (Modules.checkModuleInCache(namespace, 'namespace') === true) {
			Modules.removeFromCacheByKey(namespace, 'namespace');
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
	initModules({namespace, module, render = true, options = {}, cb = null}): void {
		forEach(__register.modulesInContext, (i, el) => {
			this.initModule({
				el,
				namespace,
				options,
				module,
				render,
				cb
			});
		});
	}

	initModule({el, namespace, options = {}, module, render = true, cb = null}): void {
		let noRender = el.getAttribute(`${this.options.attrPrefix}-no-render`) || render === false || false;
		let dataModules = el.getAttribute(`${this.options.attrPrefix}-${this.options.attrName}`).split(' ');

		if (dataModules.indexOf(namespace) !== -1) {
			// Check init state
			if (Modules.checkModuleInCache(el, 'element', namespace) === true) {
				console.info('VeamsModules :: Element is already in cache and initialized: ');
				console.log(el);
				return;
			}

			// Go ahead when condition is true
			let attrs = el.getAttribute(`${this.options.attrPrefix}-${this.options.attrOptions}`);
			let mergedOptions = extend(JSON.parse(attrs), options);
			let Module = module;
			let instance = new Module({
				el,
				namespace,
				options: mergedOptions,
				appInstance: Veams
			});

			Modules.addToCache({
				element: el,
				module,
				instance,
				namespace
			});

			// Mount process
			if (instance.willMount) instance.willMount();

			// Render after initial module loading
			if (!noRender) instance.render();

			// Provide callback function in which you can use module and options
			if (cb && typeof (cb) === 'function') cb(module, mergedOptions);

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
	observe(context) {
		let observer = new MutationObserver((mutations) => {
			// look through all mutations that just occured
			for (let i = 0; i < mutations.length; ++i) {
				// look through all added nodes of this mutation

				for (let j = 0; j < mutations[i].addedNodes.length; ++j) {
					let addedNode = mutations[i].addedNodes[j];

					if (addedNode instanceof HTMLElement) {
						if (addedNode.getAttribute(`${this.options.attrPrefix}-${this.options.attrName}`)) {
							let namespace = addedNode.getAttribute(`${this.options.attrPrefix}-${this.options.attrName}`);

							if (this.options.logs) {
								console.info(`VeamsModules :: Recording a new module with the namespace ${namespace} at: `, addedNode);
							}

							for (let moduleInstance of __register.modulesInRegister) {
								if (moduleInstance.namespace === namespace) {
									this.initModule({
										el: addedNode,
										module: moduleInstance.module,
										namespace: moduleInstance.namespace
									});

									break;
								}
							}
						}

						if (this.getModulesInContext(addedNode).length) {
							__register.modulesInContext = this.getModulesInContext(addedNode);

							if (this.options.logs) {
								console.info('VeamsModules :: Recording new context. When available new modules will be initialised in: ', addedNode);
							}

							this.registerAll();

							__register.modulesInContext = this.getModulesInContext(document);
						}
					}
				}

				for (let j = 0; j < mutations[i].removedNodes.length; ++j) {
					let removedNode = mutations[i].removedNodes[j];

					if (removedNode instanceof HTMLElement) {
						if (removedNode.getAttribute(`${this.options.attrPrefix}-${this.options.attrName}`)) {

							if (this.options.logs) {
								console.info('VeamsModules :: Recording deletion of module: ', removedNode);
							}

							Modules.removeFromCacheByKey(removedNode);

							__register.modulesInContext = this.getModulesInContext(document);
						}

						if (this.getModulesInContext(removedNode).length) {
							__register.modulesInContext = this.getModulesInContext(removedNode);

							if (this.options.logs) {
								console.info('VeamsModules :: Recording deletion of DOM element. When available modules will be unbound in ', removedNode);
							}

							__register.modulesInContext.forEach((node) => {
								Modules.removeFromCacheByKey(node);
							});

							__register.modulesInContext = this.getModulesInContext(document);
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
	getModulesInContext(context): Array<any> {
		return querySelectorArray(this.queryString, context);
	}
}

/**
 * Plugin Object
 */
const VeamsModules = {
	options: <PluginOptions>{
		attrPrefix: 'data-js',
		attrName: 'module',
		attrOptions: 'options',
		logs: false,
		internalCacheOnly: true,
		internalRegisterOnly: false,
		useMutationObserver: false
	},
	pluginName: <String>'ModulesHandler',
	initialize: function (Veams, opts: PluginOptions = {}) {
		this.options = extend(this.options, opts);
		Veams.modules = Veams.modules || new Modules(Veams, this.options);
	}
};

export default VeamsModules;

export { Modules };