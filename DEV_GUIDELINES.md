# spa-page-model-manager

The PageModelManager provides access to the model of the page

## Development

Run npm install to get all node_modules that are necessary for development.

### Build

```sh
$ npm run build
```

or

```sh
$ npm run build:production
```

### Watch to rebuild

```sh
$ npm run build -- --watch
```

### Test

```sh
$ npm run test
```

or

```sh
$ npm run test:debug
```

### Generate docs and readme

To generate the documents in the `/out` folder and pack them in the `DOCUMENTATION.md`:

```sh
$ npm run docs
```

To generate the `README.md` based on the `DOCUMENTATION.md` and `CHANGELOG.md`:

```sh
$ npm run readme
```

### Generate Changelog

```sh
$ auto-changelog
```

### Set current version

```sh
$ npm version X.Y.Z
```

This will (in order):

- `preversion`
  - run tests and check if `DOCUMENTATION.md` and `README.md` could be generated
- `version`
  - set the version to `X.Y.Z`
  - generate `DOCUMENTATION.md` and `README.md` for this version
  - commit all the files in one commit named `X.Y.Z` with a tag set to `vX.Y.Z`
- `postversion`
  - push the changes and tag

### Links and transitive dependencies

See the related [wiki page](https://wiki.corp.adobe.com/display/WEM/SPA+-+Working+with+NPM+modules+that+have+a+transitive+dependency)
