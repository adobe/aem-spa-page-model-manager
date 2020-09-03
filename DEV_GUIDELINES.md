
# Development

Run npm install to get all node_modules that are necessary for development.

## Build

```sh
$ npm run build
```


## Test

```sh
$ npm run test
```

## Usage example

This module provides the API to manage the model representation of the pages that are composing a SPA.

```
// index.html

<head>
...
    <meta property="cq:pagemodel_root_url" content="... .model.json"/>
...
</head>
...

// Bootstrap: index.js
import { ModelManager } from '@adobe/aem-spa-page-model-manager';

ModelManager.initialize().then((model) => {
    // Render the App content using the provided model
    render(model);
});

// Loading a specific portion of model
ModelManager.getData("/content/site/page/jcr:content/path/to/component").then(...); 
```