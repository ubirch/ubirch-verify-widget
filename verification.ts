import { UbirchVerificationWidget, UbirchFormUtils, EUbirchHashAlgorithms, EUbirchStages } from "./node_modules/@ubirch/ubirch-verification-js";
let ubirchVerificationWidget;
let subscription = null;
let initialized = false;
const hashAlgo = {
  sha256: EUbirchHashAlgorithms.SHA256,
  sha512: EUbirchHashAlgorithms.SHA512
};
let selectedHashAlgo = hashAlgo.sha256;
const devStage = {
  dev: EUbirchStages.dev,
  demo: EUbirchStages.demo,
  qa: EUbirchStages.qa,
  prod: EUbirchStages.prod
}
let selectedStage = devStage.dev;
const testJSON = '{"b":"19111111","d":["20210104","20210127"],"f":"\\\\nNewline\\\\\\\\n\\\\\\\\\\\\n","g":"<p>Hällo</p>","i":"Altötting","p":"#%;,.<>-+*\\"\'?$&:*","r":"BioNTech / Pfizer Corminaty®","s":"2kmsq5fzqiu","t":"vaccination"}';

if (document.getElementById('verification-form-test-page')) {
  document.addEventListener('DOMContentLoaded', verifyForm);
}


if (document.getElementById('verification-test-page')) {
  setFormVisibility(initialized);

// verify JSON button click listener
  document.getElementById('set-token').addEventListener('click', function () {
    setupVerificationWidget();
  });
// verify JSON button click listener
  document.getElementById('verify-json').addEventListener('click', function () {
    if (!ubirchVerificationWidget) {
      // handle the error yourself and inform user about the missing token
      const msg = 'Verification Widget not initialized propertly - did you set a token?\n';
      window.alert(msg);
    } else {
      const json = (document.getElementById('json-input') as HTMLInputElement).value;
      if (!json) {
        // handle the error yourself and inform user about the missing JSON
        const msg = 'Please add a JSON to be verified\n';
        window.alert(msg);
      }
      try {
        const hash = ubirchVerificationWidget.createHash(json);
        ubirchVerificationWidget
          .verifyHash(hash)
          .then((response) => {
            const msg = 'Verification Result:\n' + JSON.stringify(response, null, 2);
            (document.getElementById('output') as HTMLInputElement).value = msg;
            console.log(response);
          })
          .catch((errResponse) => {
            const msg =
              'Verification failed!!\n\nErrorResponse:\n' + JSON.stringify(errResponse, null, 2);
            (document.getElementById('output') as HTMLInputElement).value = msg;
            console.log(errResponse);
          });
      } catch (e) {
        // handle the error yourself and inform user about the missing fields
        const msg = 'JSON Verification failed!\n';
        window.alert(msg);
      }
    }
  });
// insert JSON test data button click listener
  document.getElementById('insert-test-json').addEventListener('click', function() {
    setTestJSON();
  });
// insert trim and sort JSON button click listener
  document.getElementById('trim-sort-json').addEventListener('click', function() {
    const jsonStr = (document.getElementById('json-input') as HTMLInputElement).value;
    const trimmedSortedJson = ubirchVerificationWidget.formatJSON(jsonStr, true);
    (document.getElementById('trimmed-json-input') as HTMLInputElement).value = trimmedSortedJson;
  });

// get hash from JSON button click listener
  document.getElementById('hash-from-json').addEventListener('click', function() {
    const genHash = generateHashFromJSONWithParams();
    (document.getElementById('hash-input') as HTMLInputElement).value = genHash;
  });

// test hash button click listener
  document.getElementById('hash-test').addEventListener('click', function() {
    ubirchVerificationWidget.verifyHash((document.getElementById('hash-input') as HTMLInputElement).value);
  });

// sort json checkbox click listener
  document.getElementById('sort-json').addEventListener('click', function() {
    changeSortOption((document.getElementById('sort-json') as HTMLInputElement).checked);
  });

  document.getElementsByName('stage').forEach(function(e: HTMLInputElement) {
    e.addEventListener("click", function() {
      changeStage(e.value);
    });
  });

  document.getElementsByName('hashalgo').forEach(function(e: HTMLInputElement) {
    e.addEventListener("click", function() {
      changeHashAlgo(e.value);
    });
  });
}

function updateLog (msg) {
  console.log(msg);

  (document.getElementById('log') as HTMLInputElement).value += JSON.stringify(msg, null, 2) + '\n\n';
}


function setupVerificationWidget() {
  const token = (document.getElementById('token-input') as HTMLInputElement).value;
  if (token) {
    // create ubirchVerificationWidget instance
    ubirchVerificationWidget = new UbirchVerificationWidget({
      algorithm: selectedHashAlgo,
      stage: selectedStage,
      accessToken: token,
      hostSelector: '#widget-root',
    });
    (document.getElementById('log') as HTMLInputElement).value = '';
    if (!subscription) subscription = ubirchVerificationWidget.messenger.subscribe(updateLog);
    setFormVisibility(true);
  } else {
    // handle the error yourself and inform user about the missing token
    setFormVisibility(false);
    const msg = 'Token input is empty!\n';
    window.alert(msg);
  }
}

function generateHashFromJSONWithParams() {
  const sort_json = (document.getElementById('sort-json') as HTMLInputElement).checked;

  const genHash = sort_json ?
    ubirchVerificationWidget.createHash((document.getElementById('json-input') as HTMLInputElement).value) :
    ubirchVerificationWidget.createHash(
      (document.getElementById('json-input') as HTMLInputElement).value,
      selectedHashAlgo,
      sort_json);
  return genHash;
}

function changeHashAlgo(elem: string) {
  console.log(elem);
  selectedHashAlgo = hashAlgo[elem];
  setupVerificationWidget();
}
function changeStage(elem: string) {
  console.log(elem);
  selectedStage = devStage[elem];
  setupVerificationWidget();
}
function changeSortOption(sort: boolean) {
  const elems = document.getElementsByClassName("for-sort");
  for (let i = 0; i < elems.length; i++) {
    if (sort) {
      elems[ i ].classList.remove("hidden");
    } else {
      elems[ i ].classList.add("hidden");
    }
  }
}

function setFormVisibility(visible) {
  initialized = visible;
  if (initialized) {
    document.getElementById("form-area").className = "";
  } else {
    document.getElementById("form-area").className = "hidden";
  }
}
function setTestJSON() {
  (document.getElementById('json-input') as HTMLInputElement).value = testJSON;
}

function verifyForm() {

  const formToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw";
  const formStage = EUbirchStages.dev;
  const formAlgorithm = EUbirchHashAlgorithms.SHA256;
  const formResultSector = '#widget-root';
  const formIds = ["f", "g", "b", "p", "i", "d", "t", "r", "s"];

  // create ubirchVerificationWidget instance
  ubirchVerificationWidget = new UbirchVerificationWidget({
    algorithm: formAlgorithm,
    stage: formStage,
    accessToken: formToken,
    hostSelector: formResultSector,
  });
  (document.getElementById('log') as HTMLInputElement).value = '';
  if (!subscription) subscription = ubirchVerificationWidget.messenger.subscribe(updateLog);

  try {
    const formUtils = new UbirchFormUtils({
      formIds
    });

    const jsonFromFormData = formUtils.getFormParamsFromUrl(window, ';');

    formUtils.setDataIntoForm(jsonFromFormData, window.document);

    const hash = ubirchVerificationWidget.createHash(JSON.stringify(jsonFromFormData));
    ubirchVerificationWidget.verifyHash(hash);

  } catch (e) {
    console.log('Fehler! ' + e);
  }
}
