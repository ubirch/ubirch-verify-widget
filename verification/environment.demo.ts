import { IUbirchVerificationEnvConfig } from './models';

export default {
    verify_api_url: '@@UBIRCH_WIDGET_VERIFY_URL@@', // 'https://verify.demo.ubirch.com/api/upp/verify/anchor?blockchain_info=ext'
    console_verify_url: '@@UBIRCH_CONSOLE_VERIFICATION_URL@@', // 'https://console.demo.ubirch.com/verification'
    assets_url_prefix: '@@UBIRCH_WIDGET_ASSETS_PREFIX@@' // 'https://console.demo.ubirch.com/libs/verification/'
} as IUbirchVerificationEnvConfig;
