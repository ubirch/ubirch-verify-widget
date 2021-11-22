# Ubirch Verification Widget Example Page

This is a collection of ubirch verification widget example pages.

It uses [@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js)
to verify that data has been anchored by UBIRCH in a trustworthy way. It checks that the data has been anchored as a
UPP (UBIRCH Package Protocol) in the UBIRCH Verification System.

## Run this project

### Run NPM project locally with Webpack Dev Server

You need [Node and NPM been installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on your system.

Clone this project and call from root directory

    npm install

To start the example call

    npm run serve

Open your web browser on

    http://localhost:9102/

#### `http://localhost:9102/json-hash-verification.html`
here you can test example JSON data with a working development verification token (until 2022-12-31) by clicking:

* `Set UBIRCH verification token` to activate the inserted token and selected UBIRCH stage
(the stages are encapsulated: only hashes anchored on a specific stage - dev, demo, qa, prod - can be verified on the same stage successfully)
* `test data` insert an example JSON data verifiable on dev
* `trim and sort JSON`
* `Get hash from JSON` with `sha256` selected as hash algorithm
* `VERIFY: HASH` OR `VERIFY: JSON` verifies the data against the UBIRCH System on the selected stage (dev)
and displays the result in the area below  <br> `<div id="widget-root"></div>`

#### `http://localhost:9102/form-verification.html`
here you can test example form data with a working development verification token (until 2022-12-31) on stage dev by clicking:

* `Verify Data` -> the steps processed are displayed and the verification result will be displayed in the area below  <br> `<div id="widget-root"></div>`

### Build

Run

```
npm run build
```

or

```
npm run build:dev
```

Pages will be build into the `./dist` folder. This folder can be safely moved to any other location after the build, accordingly to project needs.

## How to build your own verification pages

Detailed documentation how to build your own verification page for UBIRCH UPPs can be found in the
[documentation of the ubirch-verification-js](http://developer.ubirch.com/ubirch-verification-js/) of the used
[@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js).

## Troubleshooting

If you have any problems compiling or executing this widget examples, try to solve any problems in the main project first by:

- calling `npm install` in the root directory
