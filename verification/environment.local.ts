import {IUbirchVerificationEnvConfig} from './models';
// TODO: copy settings from resources/constants
export default {
//  verify_api_url: 'https://verify.dev.ubirch.com/api/upp/verify/anchor?blockchain_info=ext',
  verify_api_url: 'https://verify.dev.ubirch.com/api/upp/verify/record?response_form=anchors_with_path&blockchain_info=ext',
  console_verify_url: 'http://localhost:9101/verification',
  assets_url_prefix: 'http://localhost:9101/libs/verification/'
} as IUbirchVerificationEnvConfig;
