# VeamsModules plugin

The VeamsModules plugin provides a whole system to initialize, render, save and destroy your modules.

It uses mutation observer to observe added and removed nodes and handles your components, as long as the component has the same API like [VeamsComponent](#veamscomponent).

__How to__

```js
import Veams from 'veams';
import VeamsModules from 'veams/lib/plugins/modules';

// Intialize core of Veams
Veams.initialize();

// Add plugins to the Veams system
Veams.use(VeamsModules, {
    useMutationObserver: true
});
```

_API_

When enabled you can register a module like that:

```js
import CustomModule from './modules/custom';
import AnotherCustomModule from './modules/another-custom';

Veams.modules.register([
	{
	    domName: 'custom',
	    module: CustomModule
    },
    {
    	domName: 'another-custom',
    	module: AnotherCustomModule,
    	conditions: () => {
        	return Veams.detections.width < 768;
        },
        conditionsListenOn: [
        	Veams.EVENTS.resize
        ]
    }
]);
```

_Options_

- _attrPrefix_ {`String`} [`'data-js'`] - You can override the javascript module indicator in your markup which will be searched in the context.
- _logs_ {`Boolean`} [`false`] - Hide or print the logs to the console.
- _useMutationObserver_ {`Boolean`} [`false`] - You can set this option to true to use mutation observer for ajax handling. You can also use `Veams.EVENTS.DOMchanged` as before.