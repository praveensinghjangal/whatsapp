module.exports = {
    verificationCodeTemplate: (code, firstName) => {
        return `hello ${firstName}
              <br/>following is your one time code for email verification
              <br/> <h3>${code}</h3>`
    },
    passwordReset: (url, firstName) => {
        return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!--[if gte mso 15]><xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml><![endif]--><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Password Reset | Helo Whatsapp</title><style type="text/css">p{margin:10px 0;padding:0}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0}a img,img{border:0;height:auto;outline:0;text-decoration:none}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}.mcnPreviewText{display:none!important}#outlook a{padding:0}img{-ms-interpolation-mode:bicubic}table{mso-table-lspace:0;mso-table-rspace:0}.ReadMsgBody{width:100%}.ExternalClass{width:100%}a,blockquote,li,p,td{mso-line-height-rule:exactly}a[href^=sms],a[href^=tel]{color:inherit;cursor:default;text-decoration:none}a,blockquote,body,li,p,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}.templateContainer{max-width:600px!important}a.mcnButton{display:block}.mcnImage,.mcnRetinaImage{vertical-align:bottom}.mcnTextContent{word-break:break-word}.mcnTextContent img{height:auto!important}.mcnDividerBlock{table-layout:fixed!important}h1{color:#222;font-family:Helvetica;font-size:40px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:center}h2{color:#222;font-family:Helvetica;font-size:34px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h3{color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h4{color:#949494;font-family:Georgia;font-size:20px;font-style:italic;font-weight:400;line-height:125%;letter-spacing:normal;text-align:left}#templateHeader{background-color:#F7F7F7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px}.headerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{color:#007C89;font-weight:400;text-decoration:underline}#templateBody{background-color:#FFF;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px}.bodyContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{color:#007C89;font-weight:400;text-decoration:underline}#templateFooter{background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{color:#FFF;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center}.footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{color:#FFF;font-weight:400;text-decoration:underline}@media only screen and (min-width:768px){.templateContainer{width:600px!important}}@media only screen and (max-width:480px){a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:none!important}}@media only screen and (max-width:480px){body{width:100%!important;min-width:100%!important}}@media only screen and (max-width:480px){.mcnRetinaImage{max-width:100%!important}}@media only screen and (max-width:480px){.mcnImage{width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer,.mcnCaptionBottomContent,.mcnCaptionLeftImageContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightImageContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionTopContent,.mcnCartContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightImageContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageGroupContentContainer,.mcnRecContentContainer,.mcnTextContentContainer{max-width:100%!important;width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer{min-width:100%!important}}@media only screen and (max-width:480px){.mcnImageGroupContent{padding:9px!important}}@media only screen and (max-width:480px){.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{padding-top:9px!important}}@media only screen and (max-width:480px){.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnImageCardTopImageContent{padding-top:18px!important}}@media only screen and (max-width:480px){.mcnImageCardBottomImageContent{padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockInner{padding-top:0!important;padding-bottom:0!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockOuter{padding-top:9px!important;padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentColumn,.mcnTextContent{padding-right:18px!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{padding-right:18px!important;padding-bottom:0!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcpreview-image-uploader{display:none!important;width:100%!important}}@media only screen and (max-width:480px){h1{font-size:30px!important;line-height:125%!important}}@media only screen and (max-width:480px){h2{font-size:26px!important;line-height:125%!important}}@media only screen and (max-width:480px){h3{font-size:20px!important;line-height:150%!important}}@media only screen and (max-width:480px){h4{font-size:18px!important;line-height:150%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}@media only screen and (max-width:480px){.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}</style></head><body style="height:100%;margin:0;padding:0;width:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><center><table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100%"><tbody><tr><td align="center" valign="top" id="bodyCell" style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td align="center" valign="top" id="templateHeader" data-template-container="" style="background:#F7F7F7 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#F7F7F7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="headerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnImageBlockOuter"><tr><td valign="top" style="padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" class="mcnImageBlockInner"><table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td class="mcnImageContent" valign="top" style="padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><a href="https://stage-whatsapp.helo.ai/helowhatsapp/api/frontend/helo-oss/view/logo_161217161320711.png" target="_blank" style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><img align="center" alt="" src="https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/1e0c09e3-f56e-4e84-bd1b-3740923abf5e.png" width="180" style="max-width:180px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic" class="mcnImage"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateBody" data-template-container="" style="background:#FFF none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#FFF;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="bodyContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnImageBlockOuter"><tr><td valign="top" style="padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" class="mcnImageBlockInner"><table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td class="mcnImageContent" valign="top" style="padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><img align="center" alt="" src="https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/77178452-fd71-46e2-aa56-e5efb9c261c2.png" width="564" style="max-width:1200px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic" class="mcnImage"></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
<tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left"><h3 style="text-align:center;display:block;margin:0;padding:0;color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal"><strong>Hello ${firstName || 'User'},</strong></h3><p style="text-align:center;margin:10px 0;padding:0;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%">Following is your Password reset link to change the password</p></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr>
</table><![endif]--></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnButtonBlockOuter"><tr><td style="padding-top:0;padding-right:18px;padding-bottom:18px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" valign="top" align="center" class="mcnButtonBlockInner"><table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse:separate!important;border-radius:3px;background-color:#ED1C24;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td align="center" valign="middle" class="mcnButtonContent" style="font-family:Helvetica;font-size:18px;padding:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><a class="mcnButton" title="Click here" href="${url}" target="_blank" style="font-weight:700;letter-spacing:-.5px;line-height:100%;text-align:center;text-decoration:none;color:#FFF;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:block">Click here</a></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;table-layout:fixed!important"><tbody class="mcnDividerBlockOuter"><tr><td class="mcnDividerBlockInner" style="min-width:100%;padding:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><span></span></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateFooter" data-template-container="" style="background:#333 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="footerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
<tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#FFF;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center">Copyright © 2021 Helo Whatsapp. All Rights reserved.</td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr>
</table><![endif]--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr></tbody></table></td></tr></tbody></table></center><center><style type="text/css">@media only screen and (max-width:480px){table#canspamBar td{font-size:14px!important}table#canspamBar td a{display:block!important;margin-top:10px!important}}</style></center></body></html>`
    },
    emailTfa: (code, firstName) => {
        return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!--[if gte mso 15]><xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml><![endif]--><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify OTP Email | Helo Whatsapp</title><style>p{margin:10px 0;padding:0}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0}a img,img{border:0;height:auto;outline:0;text-decoration:none}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}.mcnPreviewText{display:none!important}#outlook a{padding:0}img{-ms-interpolation-mode:bicubic}table{mso-table-lspace:0;mso-table-rspace:0}.ReadMsgBody{width:100%}.ExternalClass{width:100%}a,blockquote,li,p,td{mso-line-height-rule:exactly}a[href^=sms],a[href^=tel]{color:inherit;cursor:default;text-decoration:none}a,blockquote,body,li,p,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}.templateContainer{max-width:600px!important}a.mcnButton{display:block}.mcnImage,.mcnRetinaImage{vertical-align:bottom}.mcnTextContent{word-break:break-word}.mcnTextContent img{height:auto!important}.mcnDividerBlock{table-layout:fixed!important}h1{color:#222;font-family:Helvetica;font-size:40px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:center}h2{color:#222;font-family:Helvetica;font-size:34px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h3{color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h4{color:#949494;font-family:Georgia;font-size:20px;font-style:italic;font-weight:400;line-height:125%;letter-spacing:normal;text-align:left}#templateHeader{background-color:#f7f7f7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px}.headerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{color:#007c89;font-weight:400;text-decoration:underline}#templateBody{background-color:#fff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px}.bodyContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{color:#007c89;font-weight:400;text-decoration:underline}#templateFooter{background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{color:#fff;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center}.footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{color:#fff;font-weight:400;text-decoration:underline}@media only screen and (min-width:768px){.templateContainer{width:600px!important}}@media only screen and (max-width:480px){a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:none!important}}@media only screen and (max-width:480px){body{width:100%!important;min-width:100%!important}}@media only screen and (max-width:480px){.mcnRetinaImage{max-width:100%!important}}@media only screen and (max-width:480px){.mcnImage{width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer,.mcnCaptionBottomContent,.mcnCaptionLeftImageContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightImageContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionTopContent,.mcnCartContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightImageContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageGroupContentContainer,.mcnRecContentContainer,.mcnTextContentContainer{max-width:100%!important;width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer{min-width:100%!important}}@media only screen and (max-width:480px){.mcnImageGroupContent{padding:9px!important}}@media only screen and (max-width:480px){.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{padding-top:9px!important}}@media only screen and (max-width:480px){.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnImageCardTopImageContent{padding-top:18px!important}}@media only screen and (max-width:480px){.mcnImageCardBottomImageContent{padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockInner{padding-top:0!important;padding-bottom:0!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockOuter{padding-top:9px!important;padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentColumn,.mcnTextContent{padding-right:18px!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{padding-right:18px!important;padding-bottom:0!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcpreview-image-uploader{display:none!important;width:100%!important}}@media only screen and (max-width:480px){h1{font-size:30px!important;line-height:125%!important}}@media only screen and (max-width:480px){h2{font-size:26px!important;line-height:125%!important}}@media only screen and (max-width:480px){h3{font-size:20px!important;line-height:150%!important}}@media only screen and (max-width:480px){h4{font-size:18px!important;line-height:150%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}@media only screen and (max-width:480px){.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}</style></head><body style="height:100%;margin:0;padding:0;width:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><center><table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100%"><tbody><tr><td align="center" valign="top" id="bodyCell" style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td align="center" valign="top" id="templateHeader" data-template-container="" style="background:#f7f7f7 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#f7f7f7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="headerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnImageBlockOuter"><tr><td valign="top" style="padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" class="mcnImageBlockInner"><table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td class="mcnImageContent" valign="top" style="padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><a href="https://stage-whatsapp.helo.ai/helowhatsapp/api/frontend/helo-oss/view/logo_161217161320711.png" target="_blank" style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><img align="center" alt="" src="https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/1e0c09e3-f56e-4e84-bd1b-3740923abf5e.png" width="180" style="max-width:180px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic" class="mcnImage"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateBody" data-template-container="" style="background:#fff none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#fff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="bodyContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnImageBlockOuter"><tr><td valign="top" style="padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" class="mcnImageBlockInner"><table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td class="mcnImageContent" valign="top" style="padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><img align="center" alt="" src="https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/7c95a11d-8db6-434c-9948-533da91c2238.png" width="564" style="max-width:1406px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic" class="mcnImage"></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
<tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left"><h3 style="text-align:center;display:block;margin:0;padding:0;color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal"><strong>Hello ${firstName || 'User'},</strong></h3><p style="text-align:center;margin:10px 0;padding:0;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%">Following is your one time code for email verification to login on&nbsp;<strong>Helo Whatsapp</strong></p></td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr>
</table><![endif]--></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnButtonBlockOuter"><tr><td style="padding-top:0;padding-right:18px;padding-bottom:18px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" valign="top" align="center" class="mcnButtonBlockInner"><table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse:separate!important;border-radius:3px;background-color:#ed1c24;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td align="center" valign="middle" class="mcnButtonContent" style="font-family:Helvetica;font-size:18px;padding:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><a class="mcnButton" title="${code}" style="font-weight:700;letter-spacing:-.5px;line-height:100%;text-align:center;text-decoration:none;color:#fff;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:block">${code}</a></td></tr></tbody></table></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;table-layout:fixed!important"><tbody class="mcnDividerBlockOuter"><tr><td class="mcnDividerBlockInner" style="min-width:100%;padding:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody><tr><td style="mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><span></span></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr><tr><td align="center" valign="top" id="templateFooter" data-template-container="" style="background:#333 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                            <tr>
                            <td align="center" valign="top" width="600" style="width:600px;"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer" style="border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important"><tbody><tr><td valign="top" class="footerContainer" style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><tbody class="mcnTextBlockOuter"><tr><td valign="top" class="mcnTextBlockInner" style="padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><!--[if mso]><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
<tr><![endif]--><!--[if mso]><td valign="top" width="600" style="width:600px;"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" width="100%" class="mcnTextContentContainer"><tbody><tr><td valign="top" class="mcnTextContent" style="padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#fff;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center">Copyright © 2021 Helo Whatsapp. All Rights reserved.</td></tr></tbody></table><!--[if mso]></td><![endif]--><!--[if mso]></tr>
</table><![endif]--></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]></td>
                            </tr>
                            </table><![endif]--></td></tr></tbody></table></td></tr></tbody></table></center><center><style>@media only screen and (max-width:480px){table#canspamBar td{font-size:14px!important}table#canspamBar td a{display:block!important;margin-top:10px!important}}</style></center></body></html>`
    },
    templateStatusUpdate: (statusData, firstName, templateName) => {
        const html = `<html xmlns=http://www.w3.org/1999/xhtml xmlns:o=urn:schemas-microsoft-com:office:office xmlns:v=urn:schemas-microsoft-com:vml><head><!--[if gte mso 15]><xml><o:officedocumentsettings><o:allowpng><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]--><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><title>Template Status Change | Helo Whatsapp</title><style>p{margin:10px 0;padding:0}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0}a img,img{border:0;height:auto;outline:0;text-decoration:none}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}.mcnPreviewText{display:none!important}#outlook a{padding:0}img{-ms-interpolation-mode:bicubic}table{mso-table-lspace:0;mso-table-rspace:0}.ReadMsgBody{width:100%}.ExternalClass{width:100%}a,blockquote,li,p,td{mso-line-height-rule:exactly}a[href^=sms],a[href^=tel]{color:inherit;cursor:default;text-decoration:none}a,blockquote,body,li,p,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}.templateContainer{max-width:600px!important}a.mcnButton{display:block}.mcnImage,.mcnRetinaImage{vertical-align:bottom}.mcnTextContent{word-break:break-word}.mcnTextContent img{height:auto!important}.mcnDividerBlock{table-layout:fixed!important}h1{color:#222;font-family:Helvetica;font-size:40px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:center}h2{color:#222;font-family:Helvetica;font-size:34px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h3{color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal;text-align:left}h4{color:#949494;font-family:Georgia;font-size:20px;font-style:italic;font-weight:400;line-height:125%;letter-spacing:normal;text-align:left}#templateHeader{background-color:#f7f7f7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px}.headerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{color:#007c89;font-weight:400;text-decoration:underline}#templateBody{background-color:#fff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px}.bodyContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left}.bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{color:#007c89;font-weight:400;text-decoration:underline}#templateFooter{background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer{background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0}.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{color:#fff;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center}.footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{color:#fff;font-weight:400;text-decoration:underline}@media only screen and (min-width:768px){.templateContainer{width:600px!important}}@media only screen and (max-width:480px){a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:none!important}}@media only screen and (max-width:480px){body{width:100%!important;min-width:100%!important}}@media only screen and (max-width:480px){.mcnRetinaImage{max-width:100%!important}}@media only screen and (max-width:480px){.mcnImage{width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer,.mcnCaptionBottomContent,.mcnCaptionLeftImageContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightImageContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionTopContent,.mcnCartContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightImageContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageGroupContentContainer,.mcnRecContentContainer,.mcnTextContentContainer{max-width:100%!important;width:100%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer{min-width:100%!important}}@media only screen and (max-width:480px){.mcnImageGroupContent{padding:9px!important}}@media only screen and (max-width:480px){.mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{padding-top:9px!important}}@media only screen and (max-width:480px){.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnImageCardTopImageContent{padding-top:18px!important}}@media only screen and (max-width:480px){.mcnImageCardBottomImageContent{padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockInner{padding-top:0!important;padding-bottom:0!important}}@media only screen and (max-width:480px){.mcnImageGroupBlockOuter{padding-top:9px!important;padding-bottom:9px!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentColumn,.mcnTextContent{padding-right:18px!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{padding-right:18px!important;padding-bottom:0!important;padding-left:18px!important}}@media only screen and (max-width:480px){.mcpreview-image-uploader{display:none!important;width:100%!important}}@media only screen and (max-width:480px){h1{font-size:30px!important;line-height:125%!important}}@media only screen and (max-width:480px){h2{font-size:26px!important;line-height:125%!important}}@media only screen and (max-width:480px){h3{font-size:20px!important;line-height:150%!important}}@media only screen and (max-width:480px){h4{font-size:18px!important;line-height:150%!important}}@media only screen and (max-width:480px){.mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}@media only screen and (max-width:480px){.headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{font-size:16px!important;line-height:150%!important}}@media only screen and (max-width:480px){.footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{font-size:14px!important;line-height:150%!important}}</style><body style=height:100%;margin:0;padding:0;width:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%><center><table border=0 cellpadding=0 cellspacing=0 style=border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100% width=100% align=center height=100% id=bodyTable><tr><td style=mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;height:100%;margin:0;padding:0;width:100% valign=top align=center id=bodyCell><table border=0 cellpadding=0 cellspacing=0 style=border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100%><tr><td style="background:#f7f7f7 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#f7f7f7;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:45px;padding-bottom:45px"valign=top align=center id=templateHeader data-template-container=""><table border=0 cellpadding=0 cellspacing=0 style=border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important width=100% class=templateContainer align=center><tr><td style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"valign=top class=headerContainer><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnImageBlock><tbody class=mcnImageBlockOuter><tr><td style=padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnImageBlockInner><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnImageContentContainer align=left><tr><td style=padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnImageContent><a href=https://stage-whatsapp.helo.ai/helowhatsapp/api/frontend/helo-oss/view/logo_161217161320711.png style=mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% target=_blank><img align=center alt=""class=mcnImage src=https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/1e0c09e3-f56e-4e84-bd1b-3740923abf5e.png style=max-width:180px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic width=180></a></table></table></table><tr><td style="background:#fff none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#fff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:36px;padding-bottom:45px"valign=top align=center id=templateBody data-template-container=""><table border=0 cellpadding=0 cellspacing=0 style=border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important width=100% class=templateContainer align=center><tr><td style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"valign=top class=bodyContainer><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnImageBlock><tbody class=mcnImageBlockOuter><tr><td style=padding:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnImageBlockInner><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnImageContentContainer align=left><tr><td style=padding-right:9px;padding-left:9px;padding-top:0;padding-bottom:0;text-align:center;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnImageContent><img align=center alt=""class=mcnImage src=https://mcusercontent.com/5b87d83505979ec8a1e96b26c/images/4ef66860-4745-4300-8ced-ec067cb75d53.png style=max-width:1301px;padding-bottom:0;display:inline!important;vertical-align:bottom;border:0;height:auto;outline:0;text-decoration:none;-ms-interpolation-mode:bicubic width=564></table></table><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnTextBlock><tbody class=mcnTextBlockOuter><tr><td style=padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnTextBlockInner><table border=0 cellpadding=0 cellspacing=0 style=max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnTextContentContainer align=left><tr><td style=padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left valign=top class=mcnTextContent><h3 style=text-align:center;display:block;margin:0;padding:0;color:#444;font-family:Helvetica;font-size:22px;font-style:normal;font-weight:700;line-height:150%;letter-spacing:normal><strong>Hello ${firstName},</strong></h3><tr><td style=padding-top:0;padding-right:18px;padding-bottom:1px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left valign=top class=mcnTextContent><p style="text-align:center;margin:10px 0;padding:0;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%">Your template <span style=color:red><strong>${templateName}</strong></span> has been updated.<tr style=${statusData && statusData.firstLocalizationStatus ? '' : '"display: none;"'}><td style=padding-top:0;padding-right:18px;padding-bottom:1px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left valign=top class=mcnTextContent><p style="text-align:center;margin:10px 0;padding:0;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%">First language status has been changed to <span style=color:#3f3d55><strong>${statusData.firstLocalizationStatus}</strong></span><span style=${statusData && statusData.firstLocalizationRejectionReason ? '' : '"display: none;"'}> and the rejection reason is <span style=color:#3f3d55><strong>${statusData.firstLocalizationRejectionReason}</strong></span></span><tr style=${statusData && statusData.secondLanguageRequired ? '' : '"display: none;"'}><td style=padding-top:0;padding-right:18px;padding-bottom:1px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%;text-align:left valign=top class=mcnTextContent><p style="text-align:center;margin:10px 0;padding:0;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#757575;font-family:Helvetica;font-size:16px;line-height:150%">Second language status has been changed to <span style=color:#3f3d55><strong>${statusData.secondLocalizationStatus}</strong></span><span style=${statusData && statusData.secondLanguageRequired && statusData.secondLocalizationRejectionReason ? '' : '"display: none;"'}> and the rejection reason is <span style=color:3f3d55><strong>${statusData.secondLocalizationRejectionReason}</strong></span></span></table></table><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;table-layout:fixed!important width=100% class=mcnDividerBlock><tbody class=mcnDividerBlockOuter><tr><td style=min-width:100%;padding:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% class=mcnDividerBlockInner><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnDividerContent><tr><td style=mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%><span></span></table></table></table><tr><td style="background:#333 none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:#333;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"valign=top align=center id=templateFooter data-template-container=""><table border=0 cellpadding=0 cellspacing=0 style=border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;max-width:600px!important width=100% class=templateContainer align=center><tr><td style="background:transparent none no-repeat center/cover;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;background-color:transparent;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0;padding-bottom:0"valign=top class=footerContainer><table border=0 cellpadding=0 cellspacing=0 style=min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnTextBlock><tbody class=mcnTextBlockOuter><tr><td style=padding-top:9px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% valign=top class=mcnTextBlockInner><table border=0 cellpadding=0 cellspacing=0 style=max-width:100%;min-width:100%;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100% width=100% class=mcnTextContentContainer align=left><tr><td style=padding-top:0;padding-right:18px;padding-bottom:9px;padding-left:18px;mso-line-height-rule:exactly;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word;color:#fff;font-family:Helvetica;font-size:12px;line-height:150%;text-align:center valign=top class=mcnTextContent>Copyright © 2021 Helo Whatsapp. All Rights reserved.</table></table></table></table></table></center><center><style>@media only screen and (max-width:480px){table#canspamBar td{font-size:14px!important}table#canspamBar td a{display:block!important;margin-top:10px!important}}</style></center>`
        return html
    },
    messageAndConvoMis: (statusData, totalStatusCount, totalMessageCount, mtdStatusCount, mtdTotalStatusCount, mtdTotalMessageCount,
        ConvoStatusData, ConvoTotalStatusCount, ConvoTotalCount, ConvoMtdStatusCount, ConvoMtdTotalStatusCount, ConvoMtdTotalMessageCount, userIdToUserName, userIdToUserNameConvo,
        billingStatusData, totalBillingStatusCount, totalBillingMessageCount, mtdBillingStatusCount, mtdTotalBillingStatusCount, mtdTotalBillingMessageCount, userIdToUserNameBilling) => {
        let outgoingLastday = {}, outgoingMonth = {}, convoLastday = {}, convoMonth ={}, totalLastdayUiCount =0, totalLastdayBiCount =0, totalLastdayOutgoingCount =0, totalMtdUiCount =0,
         totalMtdBiCount =0, totalMtdOutgoingCount =0
        return `<html>
  <head>
      <style>
          table {
              font-family: arial, sans-serif;
              width: 100%;
              border: 1px solid black;
              border-collapse: collapse;
              table-layout: auto;
              text-align: center;
          }
  
          td,
          th {
              border: 1px solid black;
              border-collapse: collapse;
              text-align: left;
              padding: 10px;
              width: 50px;
              text-align: center;
          }
  
          tr:nth-child(even) {
              background-color: #dddddd;
          }
      </style>
  </head>
  
  <body>
      <p><b>Dear Team,</b></p>
      <p>
      <table>
      <tr>
      <th style="background-color:red;color:white;font-weight:bold" >Type</th>
      <th style="background-color:#6d9eeb;color:black;font-weight:bold" >Yesterday</th>
      <th style="background-color:#6d9eeb;color:black;font-weight:bold" >MTD</th>
      </tr>
      <tr>
      <th >Messages</th>
      <th ><b>${totalMessageCount}</b></th>
      <th ><b>${mtdTotalMessageCount}</b></th>
      </tr>
      <tr>
      <th >Conversation</th>
      <th ><b>${ConvoTotalCount}</b></th>
      <th ><b>${ConvoMtdTotalMessageCount}</b></th>
      </tr>
      </table>
      </p>
      <br/>
      <U>
          <h3>Yesterday's Count Per User</h3>
      </U>
      <h4>Message Status :</h4>
      <table>
      <tr>
      <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Sr.No.</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">User</th>
        <th style="background-color:#6d9eeb;color:black;font-weight:bold" rowspan="2">Total Sent</th>
        <th style="background-color:#8ce912;color:black;font-weight:bold" colspan="4">Total Delivered</th>
        <th style="background-color:red;color:white;font-weight:bold" colspan="8">Total Undelivered</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Total Delivered (%)</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Total Undelivered (%)</th>
        </tr>
        <tr>
          <th style="background-color:#8ce912;color:black;">Total Delivered</th>
          <th>Seen<br/><span style="font-size:10px";>(Double Blue Tick)</span></th>
          <th>Delivered<br/><span style="font-size:10px";>(Double Grey Tick)</span></th>
          <th>Deleted<br/><span style="font-size:10px";>(By Business)</span></th>
          <th style="background-color:red;color:white;">Total Undelivered</th>
          <th>Forwarded<br/><span style="font-size:10px";>(Single Tick)</span></th>
          <th>Failed<br/><span style="font-size:10px";>(Failed by Facebook)</span></th>
          <th>Rejected<br/><span style="font-size:10px";>(VCPL Validation Failed)</span></th>
          <th>In Process<br/><span style="font-size:10px";>(VCPL Validation Check)</span></th>
          <th>Accepted<br/><span style="font-size:10px";>(Accepted by VCPL)</span></th>
          <th>Resource Allocated<br/><span style="font-size:10px";>(Ready to send to FB)</span></th>
          <th>Pending<br/><span style="font-size:10px";>(Pending for parent message delivery)</span></th>
        </tr>
          ${statusData.map((q, i) => {
            outgoingLastday[q[0]] = { totalOutgoing: q[13] - q[12][0] }
            return `<tr>
            <td>${i + 1}</td>
              <td>${userIdToUserName[q[0]] || q[0]}</td>
              <td>${q[13]}</td>
              <td>${q[11][0]}</td>
              <td>${q[5][0]}</td>
              <td>${q[6][0]}</td>
              <td>${q[4][0]}</td>
              <td>${q[12][0]}</td>
              <td>${q[3][0]}</td>
              <td>${q[8][0]}</td>
              <td>${q[10][0]}</td>
              <td>${q[1][0]}</td>
              <td>${q[7][0]}</td>
              <td>${q[2][0]}</td>
              <td>${q[9][0]}</td>
              <td>${q[11][1]}</td>
              <td>${q[12][1]}</td>
              </tr>`
        }).join('')}
          <tr style="background-color:#0000001c;">
              <td><b>Total</b></td>
              <td><b></b></td>
              <td><b>${totalMessageCount}</b></td>
              <td><b>${totalStatusCount.totalDelivered}</b></td>
              <td><b>${totalStatusCount.seen}</b></td>
              <td><b>${totalStatusCount.delivered}</b></td>
              <td><b>${totalStatusCount.deleted}</b></td>
              <td><b>${totalStatusCount.totalUndelivered}</b></td>
              <td><b>${totalStatusCount.forwarded}</b></td>
              <td><b>${totalStatusCount.failed}</b></td>
              <td><b>${totalStatusCount.rejected}</b></td>
              <td><b>${totalStatusCount.inProcess}</b></td>
              <td><b>${totalStatusCount.accepted}</b></td>
              <td><b>${totalStatusCount.resourceAllocated}</b></td>
              <td><b>${totalStatusCount.pending}</b></td>
              <td><b>${totalStatusCount.totalDeliveredPercent}</b></td>
              <td><b>${totalStatusCount.totalUndeliveredPercent}</b></td>
          </tr>
      </table>
      <h4>Conversations :</h4>
      <table>
      <tr style="background-color:red;color:white;font-weight:bold">
          <th>User</th>
          <th>User Initiated</th>
          <th>Business Initiated</th>
          <th>Referral Conversion</th>
          <th>Not Applicable</th>
          <th>Total</th>
      </tr>
      ${ConvoStatusData.map((q) => {
        convoLastday[q[0]] = { ui: q[1][0], bi: q[2][0] }
            return `<tr>
          <td>${userIdToUserNameConvo[q[0]] || q[0]}</td>
          <td>${q[1][0]}<br />(${q[1][1]}%)</td>
          <td>${q[2][0]}<br />(${q[2][1]}%)</td>
          <td>${q[3][0]}<br />(${q[3][1]}%)</td>
          <td>${q[4][0]}<br />(${q[4][1]}%)</td>
          <td>${q[5]}<br />(100%)</td>
      </tr>`
        }).join('')}
      <tr style="background-color:#0000001c;">
          <td><b>Total</b></td>
          <td><b>${ConvoTotalStatusCount.ui}<br />(${ConvoTotalStatusCount.uiPercent}%)</b></td>
          <td><b>${ConvoTotalStatusCount.bi}<br />(${ConvoTotalStatusCount.biPercent}%)</b></td>
          <td><b>${ConvoTotalStatusCount.rc}<br />(${ConvoTotalStatusCount.rcPercent}%)</b></td>
          <td><b>${ConvoTotalStatusCount.na}<br />(${ConvoTotalStatusCount.naPercent}%)</b></td>
          <td><b>${ConvoTotalCount}<br />(100%)</b></td>
      </tr>
    </table>
    <br />
    <br />
      <U>
          <h3>MTD Count Per User :</h3>
      </U>
      <h4>Message Status :</h4>
      <table>
      <tr>
      <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Sr.No.</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">User</th>
        <th style="background-color:#6d9eeb;color:black;font-weight:bold" rowspan="2">Total Sent</th>
        <th style="background-color:#8ce912;color:black;font-weight:bold" colspan="4">Total Delivered</th>
        <th style="background-color:red;color:white;font-weight:bold" colspan="8">Total Undelivered</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Total Delivered (%)</th>
        <th style="background-color:red;color:white;font-weight:bold" rowspan="2">Total Undelivered (%)</th>
      </tr>
      <tr>
        <th style="background-color:#8ce912;color:black;">Total Delivered</th>
        <th>Seen<br/><span style="font-size:10px";>(Double Blue Tick)</span></th>
        <th>Delivered<br/><span style="font-size:10px";>(Double Grey Tick)</span></th>
        <th>Deleted<br/><span style="font-size:10px";>(By Business)</span></th>
        <th style="background-color:red;color:white;">Total Undelivered</th>
        <th>Forwarded<br/><span style="font-size:10px";>(Single Tick)</span></th>
        <th>Failed<br/><span style="font-size:10px";>(Failed by Facebook)</span></th>
        <th>Rejected<br/><span style="font-size:10px";>(VCPL Validation Failed)</span></th>
        <th>In Process<br/><span style="font-size:10px";>(VCPL Validation Check)</span></th>
        <th>Accepted<br/><span style="font-size:10px";>(Accepted by VCPL)</span></th>
        <th>Resource Allocated<br/><span style="font-size:10px";>(Ready to send to FB)</span></th>
        <th>Pending<br/><span style="font-size:10px";>(Pending for parent message delivery)</span></th>
      </tr>
      ${mtdStatusCount.map((q, i) => {
        outgoingMonth[q[0]] = { totalOutgoing: q[13] - q[12][0] }
            return `<tr>
            <td>${i + 1}</td>
            <td>${userIdToUserName[q[0]] || q[0]}</td>
            <td>${q[13]}</td>
            <td>${q[11][0]}</td>
            <td>${q[5][0]}</td>
            <td>${q[6][0]}</td>
            <td>${q[4][0]}</td>
            <td>${q[12][0]}</td>
            <td>${q[3][0]}</td>
            <td>${q[8][0]}</td>
            <td>${q[10][0]}</td>
            <td>${q[1][0]}</td>
            <td>${q[7][0]}</td>
            <td>${q[2][0]}</td>
            <td>${q[9][0]}</td>
            <td>${q[11][1]}</td>
            <td>${q[12][1]}</td>
            </tr>`
        }).join('')}
      <tr style="background-color:#0000001c;">
      <td><b>Total</b></td>
      <td><b></b></td>
      <td><b>${mtdTotalMessageCount}</b></td>
      <td><b>${mtdTotalStatusCount.totalDelivered}</b></td>
      <td><b>${mtdTotalStatusCount.seen}</b></td>
      <td><b>${mtdTotalStatusCount.delivered}</b></td>
      <td><b>${mtdTotalStatusCount.deleted}</b></td>
      <td><b>${mtdTotalStatusCount.totalUndelivered}</b></td>
      <td><b>${mtdTotalStatusCount.forwarded}</b></td>
      <td><b>${mtdTotalStatusCount.failed}</b></td>
      <td><b>${mtdTotalStatusCount.rejected}</b></td>
      <td><b>${mtdTotalStatusCount.inProcess}</b></td>
      <td><b>${mtdTotalStatusCount.accepted}</b></td>
      <td><b>${mtdTotalStatusCount.resourceAllocated}</b></td>
      <td><b>${mtdTotalStatusCount.pending}</b></td>
      <td><b>${mtdTotalStatusCount.totalDeliveredPercent}</b></td>
      <td><b>${mtdTotalStatusCount.totalUndeliveredPercent}</b></td>
      </tr>
  </table>
  <h4>Conversations :</h4>
  <table>
          <tr style="background-color:red;color:white;font-weight:bold">
              <th>User</th>
              <th>User Initiated</th>
              <th>Business Initiated</th>
              <th>Referral Conversion</th>
              <th>Not Applicable</th>
              <th>Total</th>
          </tr>
          ${ConvoMtdStatusCount.map((q) => {
            convoMonth[q[0]] = { ui: q[1][0], bi: q[2][0] }
            return `<tr>
              <td>${userIdToUserNameConvo[q[0]]}</td>
              <td>${q[1][0]}<br />(${q[1][1]}%)</td>
              <td>${q[2][0]}<br />(${q[2][1]}%)</td>
              <td>${q[3][0]}<br />(${q[3][1]}%)</td>
              <td>${q[4][0]}<br />(${q[4][1]}%)</td>
              <td>${q[5]}<br />(100%)</td>
          </tr>`
        }).join('')}
          <tr style="background-color:#0000001c;">
              <td><b>Total</b></td>
              <td><b>${ConvoMtdTotalStatusCount.ui}<br />(${ConvoMtdTotalStatusCount.uiPercent}%)</b></td>
              <td><b>${ConvoMtdTotalStatusCount.bi}<br />(${ConvoMtdTotalStatusCount.biPercent}%)</b></td>
              <td><b>${ConvoMtdTotalStatusCount.rc}<br />(${ConvoMtdTotalStatusCount.rcPercent}%)</b></td>
              <td><b>${ConvoMtdTotalStatusCount.na}<br />(${ConvoMtdTotalStatusCount.naPercent}%)</b></td>
              <td><b>${ConvoMtdTotalMessageCount}<br />(100%)</b></td>
          </tr>
      </table> <br />
      <h4>Billing :</h4>
      <table>
      <tr style="background-color:red;color:white;font-weight:bold">
        <th>User</th>
        <th>Total Conversations</th>
        <th>Business Initiated</th>
        <th>User Initiated</th>
        <th style="background-color:blue;color:white;font-weight:bold">Total Messages</th>
        <th style="background-color:blue;color:white;font-weight:bold">Outgoing Messages</th>
        <th style="background-color:blue;color:white;font-weight:bold">Incoming Messages</th>
      </tr>
      ${mtdBillingStatusCount.map((q) => {
        totalMtdUiCount += convoMonth[q[0]]?.ui || 0
        totalMtdBiCount += convoMonth[q[0]]?.bi || 0
        totalMtdOutgoingCount += outgoingMonth[q[0]]?.totalOutgoing || 0
            return `<tr>
            <td>${userIdToUserNameBilling[q[0]] || q[0]}</td>
            <td>${convoMonth[q[0]]?.ui + convoMonth[q[0]]?.bi || 0}</td>
            <td>${convoMonth[q[0]]?.bi || 0}</td>
            <td>${convoMonth[q[0]]?.ui || 0}</td>
            <td>${q[1][0] + outgoingMonth[q[0]]?.totalOutgoing || 0}</td>
            <td>${outgoingMonth[q[0]]?.totalOutgoing || 0}</td>
            <td>${q[1][0] || 0}</td>
      </tr>`
          }).join('')}
      <tr style="background-color:#0000001c;">
          <td><b>Total</b></td>
          <td><b>${totalMtdUiCount + totalMtdBiCount}</b></td>
          <td><b>${totalMtdBiCount}</b></td>
          <td><b>${totalMtdUiCount}</b></td>
          <td><b>${mtdTotalBillingMessageCount + totalMtdOutgoingCount}</b></td>
          <td><b>${totalMtdOutgoingCount}</b></td>
          <td><b>${mtdTotalBillingMessageCount}</b></td>
      </tr>
    </table>
      <br />
      <div>
          <b><U>Note:</U></b>
          <br />
          &nbsp;&nbsp;&nbsp;1)This is an automated provisional report, hence should not be considered as
          final.
      </div>
  </body>
  </html>`
    },
    supportTemplate: (userName, userId, templateName) => {
        return `Hi Team.
        <br/>${userName}  (${userId}) has requested template approval 
        <br> with template name ${templateName}`
    },
    embeddedSingupSupportTemplate: (url, err) => {
        return `Hi Team.
        <br/>link for to change  ${url} 
        <br> Error in code:-  ${JSON.stringify(err)}`
    },
    messageAndConvoMisMonth: (data) => {
        return `<html>
  <head>
      <style>
          table {
              font-family: arial, sans-serif;
              width: 100%;
              border: 1px solid black;
              border-collapse: collapse;
              table-layout: auto;
              text-align: center;
          }
  
          td,
          th {
              border: 1px solid black;
              border-collapse: collapse;
              text-align: left;
              padding: 10px;
              width: 50px;
              text-align: center;
          }
  
          tr:nth-child(even) {
              background-color: #dddddd;
          }
      </style>
  </head>
  
  <body>
      <p><b>Dear Team,</b></p>
      
      <h4>Monthly count for the user :</h4>
      <table>
      <tr style="background-color:red;color:white;font-weight:bold">
          <th>Business Name</th>
          <th>Waba Phone Number</th>
          <th>Country</th>
          <th>User Initiated</th>
          <th>Business Initiated</th>
          <th>Referral Conversion</th>
          <th>Not Applicable</th>
          <th>Total</th>
      </tr>
      ${data.map((q) => {
            let rowCount = 0
            let addTab = ''
            q.wabaPhoneNumber.map((countryResult) => {
                rowCount = rowCount + countryResult.messageCountry.length
                addTab += `<td rowspan=${countryResult.messageCountry.length}>${countryResult.wabaPhoneNumber}</td>
            ${countryResult.messageCountry.map((reuslt) => {
                    return `
                <td>${reuslt.messageCountry}</td>
                <td>${reuslt.ui}</td>
                <td>${reuslt.bi}</td>
                <td>${reuslt.rc}</td>
                <td>${reuslt.na}</td>
                <td>${reuslt.total}</td></tr><tr>`
                }).join('')}`
            })
            return `<tr>
           <td rowspan=${rowCount}>${q.businessName}</td>
           ${addTab}`
        }).join('')}
    </table>
    <br />

  </body>
  </html>`
    }


}
