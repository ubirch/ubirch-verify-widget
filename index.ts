// **********************************
// this is an UNUSED EXAMPLE file!!!!
// **********************************

import { UbirchVerificationWidget, UbirchFormUtils, EUbirchHashAlgorithms, EUbirchStages } from "./node_modules/@ubirch/ubirch-verification-js";

// document.addEventListener('DOMContentLoaded', verifyForm);

// verify FORM button click listener
document.getElementById('verify-form-button').addEventListener('click', function () {
  verifyForm();
});

// verify JSON button click listener
document.getElementById('verify-json-button').addEventListener('click', function () {
  verifyJSON(testJSON);
});

const formToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw";
const formStage = EUbirchStages.dev;
const formAlgorithm = EUbirchHashAlgorithms.SHA256;
const formResultSector = '#widget-root';
const formIds = ["f", "g", "b", "p", "i", "d", "t", "r", "s"];
const testJSON = '{"b":"19111111","d":["20210104","20210127"],"f":"\\\\nNewline\\\\\\\\n\\\\\\\\\\\\n","g":"<p>Hällo</p>","i":"Altötting","p":"#%;,.<>-+*\\"\'?$&:*","r":"BioNTech / Pfizer Corminaty®","s":"2kmsq5fzqiu","t":"vaccination"}';

function verifyForm() {

  // create ubirchVerificationWidget instance
 const ubirchVerificationWidget = new UbirchVerificationWidget({
    algorithm: formAlgorithm,
    stage: formStage,
    accessToken: formToken,
    hostSelector: formResultSector,
  });

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

function verifyJSON(json: string) {

  // create ubirchVerificationWidget instance
  const ubirchVerificationWidget = new UbirchVerificationWidget({
    algorithm: formAlgorithm,
    stage: formStage,
    accessToken: formToken,
    hostSelector: formResultSector,
  });

  try {
    const hash = ubirchVerificationWidget.createHash(JSON.stringify(json));
    ubirchVerificationWidget.verifyHash(hash);
  } catch (e) {
    console.log('Fehler! ' + e);
  }

}
