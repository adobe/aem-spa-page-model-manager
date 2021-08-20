# [1.4.0](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.12...v1.4.0) (2021-08-20)


### Features

* **errorpages:** Make it possible to load in a fallback error page for every statusCode (404, 500, etc) ([cdf31ee](https://github.com/adobe/aem-spa-page-model-manager/commit/cdf31eea1b94475e4b62d4ab0435567bfe25f43f))

## [1.3.12](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.11...v1.3.12) (2021-07-14)


### Bug Fixes

* fix html extension regex ([ee2f71a](https://github.com/adobe/aem-spa-page-model-manager/commit/ee2f71aefc5328685e85e607712cf2a5491370da)), closes [#64](https://github.com/adobe/aem-spa-page-model-manager/issues/64)

## [1.3.11](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.10...v1.3.11) (2021-04-15)


### Bug Fixes

* handle excluded route path on ModelManager initialize ([#57](https://github.com/adobe/aem-spa-page-model-manager/issues/57)) ([6568032](https://github.com/adobe/aem-spa-page-model-manager/commit/65680321b09833e9e12ff5975129e09bd8ac4ea7))

## [1.3.10](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.9...v1.3.10) (2021-03-30)


### Bug Fixes

* Hardening PathUtils.addExtension ([#55](https://github.com/adobe/aem-spa-page-model-manager/issues/55)) ([643f882](https://github.com/adobe/aem-spa-page-model-manager/commit/643f8823d65273aaaf16d519d2b38731f666ae7d))

## [1.3.9](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.8...v1.3.9) (2021-03-29)


### Bug Fixes

* Return correct model path for a URL with query parameters that include dot character on route change ([#54](https://github.com/adobe/aem-spa-page-model-manager/issues/54)) ([f5cba58](https://github.com/adobe/aem-spa-page-model-manager/commit/f5cba58b3e59d77db7c58e52d8efc84f0081317c))

## [1.3.8](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.7...v1.3.8) (2021-03-02)


### Bug Fixes

* allow fragment part in the url ([#52](https://github.com/adobe/aem-spa-page-model-manager/issues/52)) ([28811af](https://github.com/adobe/aem-spa-page-model-manager/commit/28811af4c66c885f94482e575a7df69c65b9ff2f))

## [1.3.7](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.6...v1.3.7) (2021-03-01)


### Bug Fixes

* wait for dynamic editor libs to load in editor mode ([#51](https://github.com/adobe/aem-spa-page-model-manager/issues/51)) ([0d39dbd](https://github.com/adobe/aem-spa-page-model-manager/commit/0d39dbd737bbc8917dc02724e73cd90e592793d8))

## [1.3.6](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.5...v1.3.6) (2021-02-10)


### Bug Fixes

* Exporting AuthoringUtils required for remote app ([#47](https://github.com/adobe/aem-spa-page-model-manager/issues/47)) ([05c7483](https://github.com/adobe/aem-spa-page-model-manager/commit/05c74839796f390b7e52571c9c141352169fa7f2))

## [1.3.5](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.4...v1.3.5) (2021-02-04)


### Bug Fixes

* update regex for remote app routing transform ([fb26df1](https://github.com/adobe/aem-spa-page-model-manager/commit/fb26df1fe346278304a499ce9f35608766f2e537))
* updated regex for sanitizing url ([195dd31](https://github.com/adobe/aem-spa-page-model-manager/commit/195dd31e046367825444f137bb3e3a1cd7208581))

## [1.3.4](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.3...v1.3.4) (2021-01-30)


### Bug Fixes

* load scripts in desired order ([#45](https://github.com/adobe/aem-spa-page-model-manager/issues/45)) ([9a74655](https://github.com/adobe/aem-spa-page-model-manager/commit/9a7465503a3cc5b38b4bee7c838b67e8a7a5990f))

## [1.3.3](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.2...v1.3.3) (2021-01-12)


### Bug Fixes

* **bugfix:** make ssr work ([cbda406](https://github.com/adobe/aem-spa-page-model-manager/commit/cbda4062608e5c81120e3ab5a7d599a2db5b3da5))

## [1.3.2](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.1...v1.3.2) (2021-01-11)


### Bug Fixes

* remove runtime script attach in ssr ([2dfd1ef](https://github.com/adobe/aem-spa-page-model-manager/commit/2dfd1ef5ea5c8e581d8b9a535e20fc6e7d778443))

## [1.3.1](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.3.0...v1.3.1) (2021-01-05)


### Bug Fixes

* **docs:** remove --mode from docs build after a typedoc breaking change ([5cee6bd](https://github.com/adobe/aem-spa-page-model-manager/commit/5cee6bd7abecf7f83a808231752554b705a83d82))

# [1.3.0](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.2.4...v1.3.0) (2021-01-05)


### Features

* **authoringutils:** generate Document fragment to be added to enable AEM Editing capabilities ([3b1786e](https://github.com/adobe/aem-spa-page-model-manager/commit/3b1786e0004514c5ead21ddf85e4a62d456bf22b))

## [1.2.4](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.2.3...v1.2.4) (2020-12-04)


### Bug Fixes

* enable edit of remote app components in AEM ([264e8a3](https://github.com/adobe/aem-spa-page-model-manager/commit/264e8a3cc55b9ba00e7560766edd3c5ced67ea3b))

## [1.2.3](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.2.2...v1.2.3) (2020-10-14)


### Bug Fixes

* add check to handle removed properties ([#32](https://github.com/adobe/aem-spa-page-model-manager/issues/32)) ([eac9733](https://github.com/adobe/aem-spa-page-model-manager/commit/eac9733072e9fb2d2ce39bcccff28578e6ca408e))

## [1.2.2](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.2.1...v1.2.2) (2020-10-08)


### Bug Fixes

* **package.json:** update engine targets ([#31](https://github.com/adobe/aem-spa-page-model-manager/issues/31)) ([a6bbf45](https://github.com/adobe/aem-spa-page-model-manager/commit/a6bbf455a32f97b72120bd999d027a45f4d57006))

## [1.2.1](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.2.0...v1.2.1) (2020-10-07)


### Bug Fixes

* fetch page model on back nav ([fb1bcd5](https://github.com/adobe/aem-spa-page-model-manager/commit/fb1bcd54fbf05115d1cb35da304a013f6e53d23b)), closes [#28](https://github.com/adobe/aem-spa-page-model-manager/issues/28)

# [1.2.0](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.1.0...v1.2.0) (2020-10-07)


### Bug Fixes

* fix to insert data on async initialization ([8d3ff59](https://github.com/adobe/aem-spa-page-model-manager/commit/8d3ff5973ddd7fac5b44a9c815c93132d8a39170))
* sonar quality gate issue fix ([43333fa](https://github.com/adobe/aem-spa-page-model-manager/commit/43333facde9eb5fc171f79155a26475e5e83e257))


### Features

* **modelmanager:** initializeAsync - enables asynchronous initialization of modelmanager ([227cbbe](https://github.com/adobe/aem-spa-page-model-manager/commit/227cbbe78e83cef13282151a0259080828ce93bc))

# [1.1.0](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.0.3...v1.1.0) (2020-09-22)


### Features

* conditionally add async tag in page editor clientlibs ([#19](https://github.com/adobe/aem-spa-page-model-manager/issues/19)) ([9c3e86b](https://github.com/adobe/aem-spa-page-model-manager/commit/9c3e86b2ac5c55a71ec2ff2bb65d44dc9fa4994d))

## [1.0.3](https://github.com/adobe/aem-spa-page-model-manager/compare/v1.0.2...v1.0.3) (2020-08-30)


### Bug Fixes

* **ci:** attach assets on release ([#10](https://github.com/adobe/aem-spa-page-model-manager/issues/10)) ([e9e1a69](https://github.com/adobe/aem-spa-page-model-manager/commit/e9e1a69ddcb5842a7763971e483770279310e387))

## [1.0.0](https://github.com/adobe/aem-spa-page-model-manager/releases/tag/v1.0.0) (2020-08-24)


### Changes

Initial public release of `aem-spa-page-model-manager`. Renamed from cq-spa-page-model-manager.
