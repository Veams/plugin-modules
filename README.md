# Veams Modules Plugin (`@veams/plugin-modules`)

The Veams Modules Plugin provides a whole system to initialize, render, save and destroy your modules.

It uses mutation observer to observe added and removed nodes and handles your components, as long as the component has the same API like [VeamsComponent](https://github.com/Veams/component).

TypeScript is supported. 

## Installation

### NPM

``` bash 
npm install @veams/plugin-modules --save
```

### Yarn 

``` bash 
yarn add @veams/plugin-modules
```

## Usage

``` js
import Veams from '@veams/core';
import VeamsModules from '@veams/plugin-modules';

// Intialize core of Veams
Veams.onInitialize(() => {
   	// Add plugins to the Veams system
	Veams.use(VeamsModules, {
		// my custom options can be placed here
	});
});
```

### Options

- _attrPrefix_ {`String`} [`'data-js'`] - You can override the javascript module indicator in your markup which will be searched in the context.
- _attrName_ {`String`} [`'module'`] - You can override the attribute name for module identification.
- _attrOptions_ {`String`} [`'options'`] - You can override the attribute name for options identification.
- _internalCacheOnly_ {`Boolean`} [`true`] - Hold internal cache in plugin and do not expose to the Veams object.
- _internalRegisterOnly_ {`Boolean`} [`false`] - Hold internal register in plugin and do not expose to the Veams object.
- _logs_ {`Boolean`} [`false`] - Hide or print the logs to the console.
- _useMutationObserver_ {`Boolean`} [`true`] - You can set this option to true to use mutation observer for ajax handling. You can also use `Veams.EVENTS.DOMchanged` as before.

### API

When enabled you can register a module/component like that:

``` js
import CustomModule from './modules/custom';
import AnotherCustomModule from './modules/another-custom';
import ThirdCustomComponent from './components/third-custom';


// Register all at once
Veams.modules.register([
	{
        namespace: 'custom',
        module: CustomModule
    },
    {
        namespace: 'another-custom',
        module: AnotherCustomModule,
        conditions: () => {
            return Veams.detections.width < 768;
        },
        conditionsListenOn: [
            Veams.EVENTS.resize
        ]
    }
]);

// Or register single module 
Veams.modules.add({
	namespace: 'third-custom',
	module: ThirdCustomComponent
})
```

### Parameters provided by Plugin

The plugin initializes your module and provides parameters to it: 

1. `obj` - Generic Object which contains
    - `el` - Node/element which is found by the plugin.
    - `namespace` - Namespace which is associated with the module. 
    - `options` - Options object which is defined in the register process (also called default module options).
    - `context` - The context object is your custom Veams object.
2. `options` - Markup Options which are read out by this plugin