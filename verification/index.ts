import {sha256} from 'js-sha256';
import {sha512} from 'js-sha512';
import {
  EError,
  EInfo, IUbirchBlockchain, IUbirchBlockchainNet,
  IUbirchFormError,
  IUbirchFormVerificationConfig,
  IUbirchVerificationAnchorProperties,
  IUbirchVerificationConfig,
  IUbirchVerificationResponse,
  UbirchHashAlgorithm,
} from './models';
import environment from './environment.dev';
// assets
import './style.scss';
import '../blockchain-icons/Ethereum_verify_right.png';
import '../blockchain-icons/Ethereum-Classic_verify_right.png';
import '../blockchain-icons/IOTA_verify_right.png';
import '../blockchain-icons/GovDigital_Icon_verify_right.png';
import '../blockchain-icons/bloxberg_verify_right.png';
import '../blockchain-icons/ubirch_verify_right.png';
import '../blockchain-icons/ubirch_verify_wrong.png';
import * as BlockchainSettings from '../blockchain-settings/blockchain-settings.json';

const LANGUAGE_MESSAGE_STRINGS = {
  de: {
    PENDING: {
      info: '...Verifikation wird durchgeführt....'
    },
    SUCCESS: {
      headline: 'Verifikation erfolgreich!',
      info: 'Für zusätzliche Informationen zur Verankerung klicken Sie auf das ubirch Icon um die Details der Verifikation in der ' +
        'ubirch Konsole anzuzeigen oder auf die Blockchain Icons um den jeweiligen Blockchain-Explorer zu öffnen'
    },
    FAIL: {
      headline: 'Verifikation fehlgeschlagen!',
      info: 'Zu den eingegebenen Daten gibt es keine Blockchain-Verankerung'
    },
    CERTIFICATE_DATA_MISSING: {
      info: 'Zertifikatsdaten fehlen - bitte füllen Sie das Formular aus oder scannen Sie Ihren QR-Code!!!'
    },
    VERIFICATION_FAILED: {
      info: 'Verifikation fehlgeschlagen!'
    },
    CERTIFICATE_ID_CANNOT_BE_FOUND: {
      info: 'Zertifikat konnte nicht gefunden werden!!!!!'
    },
    VERIFICATION_FAILED_EMPTY_RESPONSE: {
      info: 'Verifikation fehlgeschlagen!! Zertifikat ist leer oder enthält kein Siegel'
    },
    VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE: {
      info: 'Verifikation fehlgeschlagen!! Zertifikat ist leer oder enthält kein Siegel'
    },
    UNKNOWN_ERROR: {
      info: 'Problem!!! Ein unerwarteter Fehler ist aufgetreten....!'
    }
  },
  en: {
    PENDING: {
      info: '...verification pending....'
    },
    SUCCESS: {
      headline: 'Verification Successful!',
      info: 'For more information about anchoring click the ubirch icon to open verification details in ubirch console ' +
        'or click the blockchain icons to open corresponding blockchain explorer'
    },
    FAIL: {
      headline: 'Verification Failed!',
      info: 'No blockchain anchor for given data'
    },
    CERTIFICATE_DATA_MISSING: {
      info: 'Missing data - please fill out form completely or scan your QR code!!!'
    },
    VERIFICATION_FAILED: {
      info: 'Verification Failed!'
    },
    CERTIFICATE_ID_CANNOT_BE_FOUND: {
      info: 'Cannot find certificate!!!!!'
    },
    VERIFICATION_FAILED_EMPTY_RESPONSE: {
      info: 'Verification Failed!! Empty certificate or missing seal'
    },
    VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE: {
      info: 'Verification Failed!! Empty certificate or missing seal'
    },
    UNKNOWN_ERROR: {
      info: 'An unexpected error occurred....!'
    }
  }
};

const DEFAULT_CONFIG: IUbirchVerificationConfig = {
  algorithm: 'sha512',
  elementSelector: null,
};
const DEFAULT_FORM_CONFIG: IUbirchFormVerificationConfig = {
  algorithm: 'sha512',
  elementSelector: null,
  formIds: ['created', 'name', 'workshop'],
};
let MESSAGE_STRINGS: any;
let HIGHLIGHT_PAGE_AFTER_VERIFICATION = false;

class UbirchVerification {
  private responseHandler: ResponseHandler = new ResponseHandler();
  private view: View;
  private algorithm: UbirchHashAlgorithm;
  private elementSelector: string;
  private openConsoleInSameTarget = false;
  private noLinkToConsole = false;

  constructor(config: IUbirchVerificationConfig = DEFAULT_CONFIG) {
    MESSAGE_STRINGS = config.language && LANGUAGE_MESSAGE_STRINGS[config.language] ?
      LANGUAGE_MESSAGE_STRINGS[config.language] : LANGUAGE_MESSAGE_STRINGS.de;

    if (config.HIGHLIGHT_PAGE_AFTER_VERIFICATION !== undefined) {
      HIGHLIGHT_PAGE_AFTER_VERIFICATION = config.HIGHLIGHT_PAGE_AFTER_VERIFICATION;
    }

    if (!config.elementSelector) {
      throw new Error('Please, provide the `elementSelector` to UbirchVerification or UbirchFormVerification instance');
    }

    this.algorithm = config.algorithm;
    this.elementSelector = config.elementSelector;

    if (config.OPEN_CONSOLE_IN_SAME_TARGET) {
      this.openConsoleInSameTarget = config.OPEN_CONSOLE_IN_SAME_TARGET;
    }

    if (config.NO_LINK_TO_CONSOLE !== undefined) {
      this.noLinkToConsole = config.NO_LINK_TO_CONSOLE;
    }

    this.view = new View(this.elementSelector, this.openConsoleInSameTarget);
  }

  public setMessageString(key, info, headline?) {
    if (!MESSAGE_STRINGS[key]) {
      console.warn('Tried to set non existing message string with key ' + key);
    } else {
      MESSAGE_STRINGS[key].info = info;
      if (headline) {
        MESSAGE_STRINGS[key].headline = headline;
      }
    }
  }

  public verifyJSON(json: string, sort: boolean = true): void {
    const formattedJSON = this.formatJSON(json, sort);
    const hash = this.createHash(formattedJSON);

    this.verifyHash(hash);
  }

  public verifyHash(hash: string): void {
    this.sendVerificationRequest(hash);
  }

  public createHash(json: string): string {
    let transIdAB: ArrayBuffer;

    switch (this.algorithm) {
      case 'sha256': {
        transIdAB = sha256.arrayBuffer(json);
        break;
      }
      case 'sha512': {
        transIdAB = sha512.arrayBuffer(json);
        break;
      }
    }

    const transId: string = btoa(new Uint8Array(transIdAB).reduce((data, byte) => data + String.fromCharCode(byte), ''));

    return transId;
  }

  private handleInfo(info: EInfo, hash?: string): void {
    this.view.cleanupIcons();

    switch (info) {
      case EInfo.PROCESSING_VERIFICATION_CALL:
        this.view.addHeadlineAndInfotext(undefined);
        break;
      case EInfo.VERIFICATION_SUCCESSFUL:
        this.view.showSeal(true, hash, this.noLinkToConsole);
        this.view.addHeadlineAndInfotext(true);
        break;
    }
  }

  private handleError(error: EError, hash: string): void {
    let showNonSeal = true;

    if (error === EError.NO_ERROR) {
      showNonSeal = false;
    }

    if (showNonSeal) {
      this.view.cleanupIcons();
      this.view.showSeal(false, hash, this.noLinkToConsole);
      this.view.addHeadlineAndInfotext(false);
    }

    logError(this.responseHandler.handleError(error));
  }

  private sendVerificationRequest(hash: string): void {
    const xhttp: XMLHttpRequest = new XMLHttpRequest();
    const self = this;

    xhttp.onreadystatechange = function() {
      if (this.readyState < 4) {
        self.handleInfo(EInfo.PROCESSING_VERIFICATION_CALL);
      } else {
        switch (this.status) {
          case 200: {
            self.checkResponse(this.responseText, hash);
            break;
          }
          case 404: {
            self.handleError(EError.CERTIFICATE_ID_CANNOT_BE_FOUND, hash);
            break;
          }
          default: {
            self.handleError(EError.UNKNOWN_ERROR, hash);
            break;
          }
        }
      }
    };

    xhttp.open('POST', environment.verify_api_url, true);
    xhttp.setRequestHeader('Content-type', 'text/plain');
    xhttp.send(hash);
  }

  private checkResponse(result: string, hash: string): void {
    this.view.cleanupIcons();
    // Success IF
    // 1. HTTP Status 200 -> if this fkt is called and result isn't empty
    // 2. Key Seal != ''

    if (!result) {
      this.view.showError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE);
      return;
    }

    const resultObj: IUbirchVerificationResponse = JSON.parse(result);

    if (!resultObj) {
      this.view.showError(EError.VERIFICATION_FAILED_EMPTY_RESPONSE);
      return;
    }

    const seal = resultObj.upp;

    if (!seal || !seal.length) {
      this.view.showError(EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE);
      return;
    }

    this.handleInfo(EInfo.VERIFICATION_SUCCESSFUL, hash);

    const blockchainTX = resultObj.anchors.upper_blockchains;

    if (!blockchainTX || !blockchainTX.length) {
      return;
    }

    // add info text that blockchain icons are clickable
    this.view.showSuccess();

    // show it for each item in array
    blockchainTX.forEach((item, index) => {
      if (!item || !item.properties) {
        return;
      }

      this.view.showBloxTXIcon(item.properties, index);
    });
  }

  public formatJSON(json: string, sort: boolean = true): string {
    const object: object = JSON.parse(json);
    const trimmedObject: object = this.sortObjectRecursive(object, sort);

    return JSON.stringify(trimmedObject);
  }

  private sortObjectRecursive(object: any, sort: boolean): object {
    // recursive termination condition
    if (typeof(object) !== 'object' ) {
      return object;
    } else {
      const objectSorted: { [key: string]: any } = {};
      const keysOrdered: { [key: string]: any } = sort ? Object.keys(object).sort() : Object.keys(object);

      keysOrdered.forEach((key: string) => {
          const subObject: object = this.sortObjectRecursive(object[key], sort);
          objectSorted[key] = subObject;
        }
      );

      return objectSorted;
    }
  }
}

/**
 * special class for widget which is filled by a form
 */
class UbirchFormVerification extends UbirchVerification {
  private formIds: string[];
  private paramsFormIdsMapping: string[];
  private CHECK_FORM_FILLED = true;

  constructor(config: IUbirchFormVerificationConfig = DEFAULT_FORM_CONFIG) {
    super(config);
    if (!config.formIds) {
      throw new Error('Please, provide a string array with param ids');
    }
    this.formIds = config.formIds;
    if (config.paramsFormIdsMapping) {
      if (config.paramsFormIdsMapping.length !== this.formIds.length) {
        throw new Error('If you provide paramsFormIdsMapping define a mapping for each formId; they need to be in the same order');
      }
      this.paramsFormIdsMapping = config.paramsFormIdsMapping;
    }
    if (config.CHECK_FORM_FILLED !== undefined) {
      this.CHECK_FORM_FILLED = config.CHECK_FORM_FILLED;
    }
  }

  /**
   * get params of form fields as string from fragment OR - if no fragment set - from query of url
   * @param windowRef Reference to window
   */
  public getFormParamsFromUrl(windowRef): string {
    const hash = windowRef.location.hash;
    if (hash) {
      return hash.slice(1);
    }
    const query = windowRef.location.search;
    if (query.length > 0) {
      return query.substr(1);
    }

    return undefined;
  }

  /**
   * put params into form fields
   * @param dataP string that contains field params in a form like:
   *    pid=9ceb5551-d006-4648-8cf7-c7b1a1ddccb1&tid=FGXC-CL11-KDKC-P9XC-74MM&td=2020-06-12&tt=11:00:00&tr=negativ
   * @param documentRef Reference to document
   * @param separatorP optional param to define paramString separator e.g. when params are read from fragment;
   * the whole string is searched in the paramStr, so you can e.g. define "%SEP%" as the separator between params;
   * default is "&" which is the normal separator for query params
   */
  public setDataIntoForm(dataP, documentRef, separatorP?) {
    const separator = separatorP || '&';
    const allParams = dataP.split(separator).map((value: string) => {
      const data = value.split('=');
      return {
        key: data[0],
        value: decodeURIComponent(data[1])
      };
    });
    allParams.forEach(param => {
      if (param.key) {
        let key = param.key;
        if (this.paramsFormIdsMapping && this.paramsFormIdsMapping.length > 0) {
          const idIndex = this.paramsFormIdsMapping.indexOf(key);
          if (idIndex < 0) {
            console.warn('No mapping defined for ' + key);
          } else {
            key = this.formIds[idIndex];
          }
        }
        if (documentRef.getElementById(key) && documentRef.getElementById(key) !== null) {
          documentRef.getElementById(key).value = param.value;
        }
      }
    });
  }

  /**
   * Creates JSON certificate from form fields if form is filled completely
   * @param documentRef Reference to document
   */
  public getJsonFromInputs(documentRef): string {
    const formFilled = [];

    if (this.CHECK_FORM_FILLED) {
      this.formIds.forEach((formId, index) => {
        if (!this.check(index, documentRef)) {
          formFilled.push(formId);
        }
      });
    }

    if (formFilled.length > 0) {
      const err: IUbirchFormError = {
        msg: 'form fields not set',
        missingIds: formFilled
      };
      throw err;
    } else {
      // helper to generate correct JSON from input fields
      // attention: ids of input fields have to be same as field names in anchored JSON
      const genJson = this.createJsonFromInputs(this.formIds, documentRef);
      return genJson;
    }
  }

  public createJsonFromInputs(labels, documentRef) {
    let certJson = '{';
    labels.forEach((label, index) => {
      certJson += index > 0 ? ',' : '';
      certJson += '"' + label + '":"' + this.getInputStr(label, documentRef) + '"';
    });
    certJson += '}';

    console.log('certificate: ' + certJson);

    return certJson;
  }

  private getInputStr(inputId, documentRef) {
    if (documentRef.getElementById(inputId) +
      documentRef.getElementById(inputId).value) {
      const doc = new
      DOMParser().parseFromString(documentRef.getElementById(inputId).value,
        'text/html');
      return doc.documentElement.textContent;
    } else {
      console.warn('Missing documentElement with id ' + inputId);
      return '';
    }
  }

  // helper to check that ubirchVerification instance is initialized and required input field are set
  private check(index, documentRef) {
    if (this.formIds && this.formIds.length > index) {
      const elemId = this.formIds[index];
      if (documentRef.getElementById(elemId).value !== undefined &&
        documentRef.getElementById(elemId).value !== '') {
        return true;
      }
    }
    return false;
  }

}

class ResponseHandler {
  handleError(error: EError): string {
    switch (error) {
      case EError.CERTIFICATE_DATA_MISSING:
        return MESSAGE_STRINGS.CERTIFICATE_DATA_MISSING.info;
      case EError.VERIFICATION_FAILED:
        return MESSAGE_STRINGS.VERIFICATION_FAILED.info;
      case EError.CERTIFICATE_ID_CANNOT_BE_FOUND:
        return MESSAGE_STRINGS.CERTIFICATE_ID_CANNOT_BE_FOUND.info;
      case EError.VERIFICATION_FAILED_EMPTY_RESPONSE:
        return MESSAGE_STRINGS.VERIFICATION_FAILED_EMPTY_RESPONSE.info;
      case EError.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE:
        return MESSAGE_STRINGS.VERIFICATION_FAILED_MISSING_SEAL_IN_RESPONSE.info;
      case EError.UNKNOWN_ERROR:
      default:
        return MESSAGE_STRINGS.UNKNOWN_ERROR.info;
    }
  }
}

class View {
  private host: HTMLElement;
  private sealInfoText: HTMLElement = document.createElement('div');
  private sealOutput: HTMLElement = document.createElement('div');
  private resultOutput: HTMLElement = document.createElement('div');
  private errorOutput: HTMLElement = document.createElement('div');
  private openConsoleInSameTarget = false;

  constructor(
    private elementSelectorP,
    private openConsoleInSameTargetP) {
    const host: HTMLElement = document.querySelector(this.elementSelectorP);
    this.openConsoleInSameTarget = openConsoleInSameTargetP;

    if (!host) {
      throw new Error(`Element by selector '${this.elementSelectorP}' not found`);
    }

    this.host = host;

    this.sealInfoText.classList.add('ubirch-info-text');
    this.sealOutput.classList.add('ubirch-seal-output');
    this.resultOutput.classList.add('ubirch-result-output');
    this.errorOutput.classList.add('ubirch-error-output');

    this.host.appendChild(this.sealInfoText);
    this.host.appendChild(this.sealOutput);
    this.host.appendChild(this.resultOutput);
    this.host.appendChild(this.errorOutput);
  }

  public showError(error: any): void {
    this.errorOutput.innerHTML = '';
    this.resultOutput.innerHTML = error;
  }

  public cleanupIcons(): void {
    // remove seal and transaction_check icons IF exist
    this.cleanAllChilds(this.resultOutput);
    this.cleanAllChilds(this.sealOutput);
    this.cleanAllChilds(this.sealInfoText);
  }

  public showSeal(successful: boolean, hash: string, nolink: boolean = false): void {
    let icon: HTMLElement;

    if (successful) {
      icon = this.createIconTag(environment.assets_url_prefix + BlockchainSettings.ubirchIcons.seal,
        'ubirch-verification-seal-img');
    } else {
      icon = this.createIconTag(environment.assets_url_prefix + BlockchainSettings.ubirchIcons.no_seal,
        'ubirch-verification-no-seal-img');
    }

    if (nolink) {
      this.sealOutput.appendChild(icon);
    } else {
      const link: HTMLElement = document.createElement('a');

      const encodedHash: string = encodeURIComponent(hash);

      link.setAttribute('href', `${environment.console_verify_url}?hash=${encodedHash}`);
      if (!this.openConsoleInSameTarget) {
        link.setAttribute('target', '_blank');
      }

      link.appendChild(icon);

      this.sealOutput.appendChild(link);
    }
  }

  public showSuccess(): void {
    this.resultOutput.innerHTML = '';
    this.errorOutput.innerHTML = '';

    this.resultOutput.appendChild(document.createElement('br'));
    this.resultOutput.appendChild(this.createTxtTag(MESSAGE_STRINGS.SUCCESS.info, 'ubirch-verification-success'));
    this.resultOutput.appendChild(document.createElement('br'));
  }

  public showBloxTXIcon(bloxTX: IUbirchVerificationAnchorProperties, index: number): void {
    if (!bloxTX) {
      return;
    }

    const blockchain: string = bloxTX.blockchain;
    const networkType: string = bloxTX.network_type;

    if (!blockchain || !networkType) {
      return;
    }

    const blox: IUbirchBlockchain =
      BlockchainSettings.blockchainSettings ? BlockchainSettings.blockchainSettings[blockchain] : undefined;

    if (!blox || !bloxTX.txid) {
      return;
    }

    const bloxTXData: IUbirchBlockchainNet =
      blox.explorerUrl[networkType];


    const linkTag: HTMLElement = document.createElement('a');

    // add transactionId to url
    if (bloxTXData.url) {
      linkTag.setAttribute('href', bloxTXData.url + bloxTX.txid);
    }

    const titleStr: string = bloxTX.network_info ? bloxTX.network_info : bloxTX.blockchain;

    linkTag.setAttribute('title', titleStr);
    linkTag.setAttribute('target', '_blanc');

    // if icon url is given add img, otherwise add text
    if (blox.nodeIcon) {
      const iconId = `blockchain_transid_check${index === undefined ? '' : '_' + index}`;
      linkTag.appendChild(this.createIconTag(environment.assets_url_prefix + blox.nodeIcon, iconId));
    } else {
      linkTag.innerHTML = titleStr;
    }

    this.resultOutput.appendChild(linkTag);
  }

  public addHeadlineAndInfotext(successful: true | false | undefined): void {
    if (successful === undefined) {
      this.resultOutput.appendChild(this.createTxtTag(MESSAGE_STRINGS.PENDING.info, 'ubirch-verification-info'));
    } else {
      if (successful) {
        this.sealInfoText.appendChild(this.createTxtTag(MESSAGE_STRINGS.SUCCESS.headline,
          'ubirch-verification-success ubirch-verification-headline'));
      } else {
        this.sealInfoText.appendChild(this.createTxtTag(MESSAGE_STRINGS.FAIL.headline,
          'ubirch-verification-fail ubirch-verification-headline'));
        this.resultOutput.appendChild(this.createTxtTag(MESSAGE_STRINGS.FAIL.info,
          'ubirch-verification-fail'));
      }
      // if HIGHLIGHT_PAGE_AFTER_VERIFICATION is set the whole page is flashed in green, if verification returned successful,
      // or red, if verification failed
      this.highlightPage(successful);
    }
  }

  public createTxtTag(txt: string, className: string): HTMLElement {
    const txtTag: HTMLElement = document.createElement('div');
    txtTag.innerHTML = txt;
    txtTag.setAttribute('class', className);

    return txtTag;
  }

  private cleanAllChilds(element: HTMLElement): void {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  private createIconTag(src: string, imgTagId: string, width?: string, height?: string): HTMLElement {
    const imgTag: HTMLElement = document.createElement('img');
    imgTag.setAttribute('width', width ? width : '50');
    imgTag.setAttribute('height', height ? height : '50');
    imgTag.setAttribute('src', src);

    if (imgTagId) {
      imgTag.setAttribute('id', imgTagId);
    }
    return imgTag;
  }

  private highlightPage(successful: boolean) {
    if (HIGHLIGHT_PAGE_AFTER_VERIFICATION) {
      const highlightClass = successful ? 'flashgreen' : 'flashred';
      const mainElement = document.getElementsByTagName('main')[0];
      setTimeout(_ => {
        mainElement.classList.toggle(highlightClass);
      }, 100);
      setTimeout(_ => {
        mainElement.classList.toggle(highlightClass);
      }, 2400);

    }
  }
}

function logError(errorStr: string): void {
  console.log(errorStr);
}

window['UbirchVerification'] = UbirchVerification;
window['UbirchFormVerification'] = UbirchFormVerification;
