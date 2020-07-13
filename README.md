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

### widget's host element

Add a div tag to your html page in which the widget / the result of the verification will be displayed.
Specify id of that div and push that selector to the <code>elementSelector</code>
of the <code>UbirchVerification</code> constructor.

    <div id="verification-widget"></div>
    ...
    <script>
        const ubirchVerification = new UbirchVerification({
            ...
            elementSelector: '#verification-widget'
        });
        ...
    </script>

### Insert verification.js

Add <code>verification.js</code> script to your page:

    <script src="{{Ubirch URL}}/libs/verification/verification.js"></script>;

Attention:
1. Be sure to use the same <code>{{Ubirch URL}}</code> where you documents are anchored
2. load verification.js before using it!

### Create a <code>UbirchVerification</code> instance

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

### Generate hash from JSON

Helper function to generate hash from JSON (for debugging or testing).

Before hashing the params of the JSON will be ordered and trimmed.
Then the JSON will be hashed with the hash algorithm defined in ubirchVerification constructor's <code>algorithm</code> field

## Ubirch Form Verification

There is a convenient SubClass ubirchFormVerification for a verification based on a form with input fields.
It's also part of the verification.js lib.
It provides following functionality:

   * get params as string from fragment OR - if no fragment set - from query of url
   * insert params into form fields
   * check if form fields are filled
   * Create JSON certificate from form fields

### Insert verification.js

Same as for UbirchVerification widget

### Create a <code>UbirchFormVerification</code> instance

    const ubirchFormVerification = new UbirchFormVerification({
      algorithm: 'sha512',
      elementSelector: '#verification-widget',
      formIds: ["pid", "tid", "td", "tt", "tr"]
    });

Params:

Same as for UbirchVerification widget. Additional:

* <code>formIds</code> string array with param ids used in the anchored JSON
    - here the id's can be added in any order; attention: in the anchored JSON document the id's have to be in alphabetical order!
    - attention: you must not use id "id" (TYPO3 uses this id for routing and ignores query string if it contains an id "id")
* <code>missingFieldErrorMessages</code> string array of error message for each formId in the same order;
 will be displayed if form is not filled completely when user tries to verify

### create form

Create a form on the page with input fields for the params of the verification document.
For every required param define an input field; set the param id as id of the input:

Example:

    {"did":"1a0dca1f-caf8-4776-bda9-909b4d9b6b1f","fn":"Max","ln":"Mustermann","d":"2019-06-12","v":"3.25"}


    <div class="input-field">
      <input type="text" id="did">
      <label for="did">DocumentID:</label>
    </div>
    <div class="input-field">
      <input type="text" id="fn">
      <label for="fn">Firstname:</label>
    </div>
    <div class="input-field">
      <input type="text" id="ln">
      <label for="ln">Lastname:</label>
    </div>
    ...

### get params from fragment OR query of url (optional)

* Tries to read params from curl as a string
* IF fragment is given the params are read from fragment
* IF NO fragment is given the params are tried be read from query string
* pattern:
    <code>IDNAME1=PARAMVALUE1&IDNAME2=PARAMVALUE2&...</code>
 
 Call:
 
        var paramStr = ubirchFormVerification.getFormParamsFromUrl(window);

### Insert params into form (optional)

If you want to insert given params (test data as string OR read from url) into form fields you can call <code>setDataIntoForm</code>:

    const paramStr = "pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1&tid=FGXC-CL11-KDKC-P9XC-74MM&td=2020-06-12&tt=11:00:00&tr=negativ";
    ubirchFormVerification.setDataIntoForm(paramStr, document);

### Generate JSON from input fields

If you have a form with input fields for all params you can create the JSON document by calling
<code>getJsonFromInputs</code>.

* in the created JSON all params are put together that are defined in constructors
<code>formIds</code> parameter
* the values are taken from the input fields with the same id
* checks if form is filled completely; throws an <code>IUbirchFormError</code>, if any fields are empty
* <code>IUbirchFormError.missingIds</code> contains a list of all missing ids
* handle the error yourself and inform user about the missing fields
* if no error occurs the created JSON is returned;
then you can verify the JSON by <code>verifyJSON</code> in a separate step.


        try {

          const genJson = ubirchFormVerification.getJsonFromInputs(document);
          ubirchFormVerification.verifyJSON( genJson );

        } catch (e) {
            e.missingIds.forEach( 
                id => // handle missing field
            );
        }
