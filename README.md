# Ubirch Verification Widget Example

In this example we demonstrate the different ways how you can integrate
the ubirch Web Verification Widget into your website

## How to start example

Open 

    index.html

in a web browser.

#### Test JSON verification:

1. Load test data by pressing the button 'Insert Test JSON'
2. verify test JSON by pressing the button 'Test JSON Verification'

#### Test hash verification:

1. Load test data by pressing the button 'Insert Test hash'
2. verify test hash by pressing the button 'Test hash Verification'

## How Ubirch Verification Widget works

### Prerequisites

You have anchored a JSON in the ubirch environment.

Attention:

1. be sure to use the correct <code>{{Ubirch URL}}</code>
2. params in the JSON have to be ordered alphabetically, no spaces

### Insert verification.js

Add <code>verification.js</code> script to your page:

    <script src="{{Ubirch URL}}/libs/verification/verification.js"></script>;

Attention:
1. Be sure to use the same <code>{{Ubirch URL}}</code> where you documents are anchored
2. load verification.js before using it!

### Create an <code>UbirchVerification</code> instance

    const ubirchVerification = new UbirchVerification({
        algorithm: 'sha512',
        elementSelector: '#verification-widget'
    });


Where:
* <code>algorithm</code> is hashing algorithm you need (possible values: <code>sha256</code>, <code>sha512</code> )
* <code>elementSelector</code> is widget's host element selector (id), e.g. <code>#verification-widget</code>

### Verify JSON

If you have the anchored JSON (generated yourself or by using <code>createJsonFromInputs</code>, see below)
you can verify the JSON by 

    verifyJSON( {{ your JSON }} )

Hint: the params of the JSON do not need to be alphabetically ordered here,
but before hashing the JSON they will be ordered and trimmed.

So, if you anchor a document manually be sure to ordered the params in the JSON alphabetically
and remove all spaces.

### Verify hash

You can verify the hashed JSON directly by

    verifyHash( {{ your hash }} )

Attention: use the hashing algorithm defined in the UbirchVerification constructor's <code>algorithm</code> field

### Generate JSON from input fields

If you have a form with input fields for the params of the anchored JSON and all input fields
deliver the params as strings, the helper function <code>createJsonFromInputs</code>
can generate the JSON from your input fields for you.
Then you can verify the JSON by <code>verifyJSON</code> in a separate step.

    ubirchVerification.createJsonFromInputs({{ array of input ids }}, {{ documentRef }})

* param1: array of input ids; id of input fields have to be the name of the param in the JSON
* param2: handle to the document

Example:

    ubirchVerification.createJsonFromInputs( ["pid", "td", "tid", "tr", "tt"], document);

### Generate hash from JSON

Helper function to generate hash from JSON (for debugging or testing).

Before hashing the params of the JSON will be ordered and trimmed.
Then the JSON will be hashed with the hash algorithm defined in ubirchVerification constructor's <code>algorithm</code> field
