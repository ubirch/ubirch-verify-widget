// **********************************
// this is an UNUSED EXAMPLE file!!!!
// **********************************

import { UbirchVerificationWidget, UbirchFormUtils } from "./node_modules/@ubirch/ubirch-verification-js";

document.addEventListener('DOMContentLoaded', verifyForm);

function verifyForm() {

  const formToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmRldi51YmlyY2guY29tIiwic3ViIjoiYzBiNTc3ZmItMWNlZi00YzZmLThjNTAtOGQzYTFlNmVhNzUzIiwiYXVkIjoiaHR0cHM6Ly92ZXJpZnkuZGV2LnViaXJjaC5jb20iLCJleHAiOjE2NzI1MDQxNTgsImlhdCI6MTYzNzU5ODYzMSwianRpIjoiYTlmNTFmYzUtZTgyZi00MDczLTlhYTYtZmI3Yjk3NGViYTIzIiwic2NwIjpbInVwcDp2ZXJpZnkiXSwicHVyIjoiMjAyMiBERVYgV2lsZGNhcmQgVGVzdCBUb2tlbiIsInRncCI6W10sInRpZCI6WyIqIl0sIm9yZCI6W119.gnzzkp7eO4HtaLOG9Df7ll3-UT9Yo-pXmeRUI21e3lkJan_ju_0mC6FdDHLLgiI9nsYlQ7rmyvKHzbyaLMLYGw";
  const formStage = 'dev';
  const formAlgorithm = 'sha256';
  const formResultSector = '#widget-root';
  const formIds = ["f", "g", "b", "p", "i", "d", "t", "r", "s"];

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
