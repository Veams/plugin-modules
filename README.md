# VeamsModules plugin

The VeamsModules plugin provides a whole system to initialize, render, save and destroy your modules.

It uses mutation observer to observe added and removed nodes and handles your components, as long as the component has the same API like [VeamsComponent](#veamscomponent).

__How to__

```js
import Veams from 'veams';
import VeamsModules from 'veams-plugin-modules';

// Intialize core of Veams
Veams.onInitialize(() => {
   	// Add plugins to the Veams system
	Veams.use(VeamsModules, {
	    useMutationObserver: true
	});
});
```

_API_

When enabled you can register a module like that:

```js
import CustomModule from './modules/custom';
import AnotherCustomModule from './modules/another-custom';
import ThirdCustomModule from './modules/third-custom';


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
	module: ThirdCustomModule
})
```

_Options_

- _attrPrefix_ {`String`} [`'data-js'`] - You can override the javascript module indicator in your markup which will be searched in the context.
- _attrName_ {`String`} [`'module'`] - You can override the attribute name for module identification.
- _attrOptions_ {`String`} [`'options'`] - You can override the attribute name for options identification.
- _internalCacheOnly_ {`Boolean`} [`true`] - Hold internal cache in plugin and do not expose to the Veams object.
- _internalRegisterOnly_ {`Boolean`} [`false`] - Hold internal register in plugin and do not expose to the Veams object.
- _logs_ {`Boolean`} [`false`] - Hide or print the logs to the console.
- _useMutationObserver_ {`Boolean`} [`false`] - You can set this option to true to use mutation observer for ajax handling. You can also use `Veams.EVENTS.DOMchanged` as before.