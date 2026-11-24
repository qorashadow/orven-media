import nodemailer from 'nodemailer'
import { getBaseUrl } from './utils'

export type EmailLocale = 'en' | 'uz' | 'ru'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
    return transporter
  }

  return null
}

/**
 * Resolves the standardized sender name and address.
 * Ensures the sender name is displayed as "Orven Media" in email clients like Gmail.
 */
export function getEmailSender(): { name: string; address: string } {
  const emailFrom = process.env.EMAIL_FROM
  const smtpUser = process.env.SMTP_USER || 'noreply@orven.media'

  if (emailFrom) {
    // Matches formats: "Orven Media" <user@domain.com>, Orven Media <user@domain.com>, or user@domain.com
    const match = emailFrom.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/)
    if (match && match[2]) {
      return {
        name: (match[1] || 'Orven Media').trim(),
        address: match[2].trim(),
      }
    }
  }

  return {
    name: 'Orven Media',
    address: smtpUser,
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const mailer = getTransporter()
  const sender = getEmailSender()
  // RFC 5322 quoted format guarantees Gmail and Outlook render "Orven Media" as display name
  const from = `"${sender.name}" <${sender.address}>`

  if (!mailer) {
    const errorMsg =
      'SMTP email server is not configured. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in environment variables.'
    console.error(`[EMAIL CONFIG ERROR] ${errorMsg}`)
    return { success: false, error: errorMsg }
  }

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      },
    })
    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to: ${to} (from: ${from})`)
    return { success: true }
  } catch (err: any) {
    console.error('[EMAIL ERROR] Failed to send email to', to, ':', err.message || err)
    return { success: false, error: err.message || 'Failed to dispatch email' }
  }
}

interface BaseTemplateOptions {
  title: string
  badgeText?: string
  bodyContent: string
  footerNote: string
  appUrl?: string
}

function baseTemplate({
  title,
  badgeText = 'OFFICIAL TRANSMISSION',
  bodyContent,
  footerNote,
  appUrl = getBaseUrl(),
}: BaseTemplateOptions) {
  const displayDomain = appUrl.replace(/^https?:\/\//, '')
  const currentYear = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <style>
    /* Reset & Client-Specific Styles */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #09090b !important;
      color: #e4e4ed !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -ms-text-size-adjust: 100% !important;
      -webkit-text-size-adjust: 100% !important;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    a {
      color: #a0a0b8;
      text-decoration: underline;
    }
    /* Mobile responsive adjustments */
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      .mobile-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 20px 20px !important;
      }
      .footer-padding {
        padding: 20px 20px !important;
      }
      .code-display {
        font-size: 28px !important;
        letter-spacing: 6px !important;
        text-indent: 6px !important;
      }
    }
  </style>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #e4e4ed;">
  <!-- Preheader text hidden from visual view -->
  <div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${title} • Orven Media Security Gateway
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #09090b; width: 100%;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <!-- Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #111116; border: 1px solid #23232c; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);">
          <!-- Top Accent Line -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); line-height: 3px; font-size: 3px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="header-padding" style="padding: 24px 32px; background-color: #15151c; border-bottom: 1px solid #23232c;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center;">
                      <!-- OM Badge -->
                      <span style="display: inline-block; background-color: #ffffff; color: #0b0b0d; font-weight: 900; font-size: 11px; padding: 4px 7px; letter-spacing: 1.5px; border-radius: 3px; margin-right: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase;">
                        OM
                      </span>
                      <span style="font-weight: 800; font-size: 17px; letter-spacing: 1.5px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ORVEN <span style="color: #8b8b9c; font-weight: 300;">MEDIA</span>
                      </span>
                    </a>
                  </td>
                  <td align="right" valign="middle" style="display: none;">
                    <span style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #727282; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="mobile-padding" style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.35; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${title}
              </h1>
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-padding" style="padding: 24px 32px; background-color: #0d0d11; border-top: 1px solid #1c1c24;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #666675; font-size: 12px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${footerNote}
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #1a1a22;">
                      <a href="${appUrl}" target="_blank" style="color: #9292a4; text-decoration: none; font-weight: 600;">${displayDomain}</a>
                      <span style="color: #3e3e4c; margin: 0 8px;">•</span>
                      <span>Ultra HD Anime & Donghua Streaming</span>
                    </div>
                    <div style="margin-top: 6px; font-size: 11px; color: #4e4e5b;">
                      &copy; ${currentYear} Orven Media Inc. All rights reserved.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- End Card Container -->
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Bulletproof action button compatible with Outlook, Apple Mail, and Gmail.
 */
function renderActionButton(url: string, label: string) {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0; width: 100%;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="10%" strokecolor="#ffffff" fillcolor="#ffffff">
            <w:anchorlock/>
            <center style="color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.5px;">
              ${label}
            </center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; padding: 13px 36px; text-decoration: none; border-radius: 4px; box-shadow: 0 4px 14px rgba(255, 255, 255, 0.12); text-align: center; text-transform: uppercase;">
            ${label}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
  `
}

/**
 * High-visibility centered 6-digit verification code block.
 */
function renderCodeBox(code: string, subnote: string = 'Valid for 10 minutes • Single-use only') {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0; width: 100%;">
      <tr>
        <td align="center" style="background-color: #171720; border: 1px solid #2d2d3a; border-radius: 6px; padding: 22px 16px;">
          <div class="code-display" style="font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Segoe UI Mono', Menlo, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-align: center; text-indent: 10px; line-height: 1;">
            ${code}
          </div>
          <div style="margin-top: 10px; font-size: 10px; font-weight: 700; color: #78788c; letter-spacing: 1.2px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${subnote}
          </div>
        </td>
      </tr>
    </table>
  `
}

/**
 * Styled security/warning alert box.
 */
function renderSecurityCallout(text: string, isAlert = false) {
  const borderColor = isAlert ? '#ef4444' : '#3f3f50'
  const textColor = isAlert ? '#fca5a5' : '#888898'
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 22px 0; width: 100%;">
      <tr>
        <td style="border-left: 3px solid ${borderColor}; background-color: #15151c; padding: 12px 16px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${text}
          </p>
        </td>
      </tr>
    </table>
  `
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  locale: EmailLocale = 'en'
) {
  const appUrl = getBaseUrl()
  const verifyUrl = `${appUrl}/auth/register?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}&step=verify`

  const translations = {
    en: {
      subject: 'Verify Your Email Address - Orven Media',
      title: 'Verify Your Email Address',
      intro: 'Welcome to Orven Media. Enter this 6-digit confirmation code on the registration page or click the button below to instantly activate your account.',
      btnText: 'Verify Account Now',
      orCode: 'Or copy your 6-digit confirmation code:',
      directLinkText: 'If the button does not work, open this direct verification link in your browser:',
      security: 'If you did not request this account, you can safely ignore this email. No account will be activated without this verification step.',
    },
    uz: {
      subject: 'Elektron Pochtangizni Tasdiqlang - Orven Media',
      title: 'Elektron Pochtangizni Tasdiqlang',
      intro: 'Orven Media platformasiga xush kelibsiz. Akkauntingizni faollashtirish uchun ushbu 6 xonali tasdiqlash kodini kiriting yoki quyidagi tugmani bosing.',
      btnText: 'Akkauntni Tasdiqlash',
      orCode: 'Yoki 6 xonali tasdiqlash kodidan foydalaning:',
      directLinkText: 'Agar tugma ishlamasa, brauzeringizda ushbu toʻgʻridan-toʻgʻri havolani oching:',
      security: 'Agar siz roʻyxatdan oʻtmagan boʻlsangiz, ushbu xabarni eʼtiborsiz qoldirishingiz mumkin. Akkaunt tasdiqlanmasdan faollashtirilmaydi.',
    },
    ru: {
      subject: 'Подтвердите Ваш Email - Orven Media',
      title: 'Подтвердите Ваш Email',
      intro: 'Добро пожаловать в Orven Media. Введите этот 6-значный проверочный код или нажмите кнопку ниже для мгновенной активации вашего аккаунта.',
      btnText: 'Подтвердить Аккаунт',
      orCode: 'Или используйте 6-значный проверочный код:',
      directLinkText: 'Если кнопка не работает, откройте эту прямую ссылку в браузере:',
      security: 'Если вы не регистрировались на нашем сервисе, просто проигнорируйте это письмо. Без подтверждения аккаунт активирован не будет.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: 'SECURITY VERIFICATION',
    bodyContent: `
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #a4a4b6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.intro}
      </p>

      ${renderActionButton(verifyUrl, t.btnText)}

      <p style="margin: 24px 0 8px 0; text-align: center; font-size: 12px; font-weight: 600; color: #7a7a8c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.orCode}
      </p>

      ${renderCodeBox(code, 'Expires in 10 minutes • One-time use')}

      <p style="margin: 20px 0 4px 0; font-size: 11px; color: #666675; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.directLinkText}
      </p>
      <p style="margin: 0; font-size: 11px; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
        <a href="${verifyUrl}" target="_blank" style="color: #8c8ca8;">${verifyUrl}</a>
      </p>

      ${renderSecurityCallout(t.security)}
    `,
    footerNote: 'Automated account security transmission from Orven Media Authentication Service.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.intro}\n\nVERIFICATION CODE: ${code}\n\nDIRECT LINK: ${verifyUrl}\n\n${t.security}\n\n---\nOrven Media Security Gateway\n${appUrl}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  locale: EmailLocale = 'en',
  resetToken?: string
) {
  const appUrl = getBaseUrl()
  const resetUrl = resetToken
    ? `${appUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`
    : `${appUrl}/auth/reset-password?email=${encodeURIComponent(to)}`

  const translations = {
    en: {
      subject: 'Reset Your Password - Orven Media',
      title: 'Reset Your Password',
      intro: 'A password reset was requested for your Orven Media account. Click the button below to choose a new password, or enter the 6-digit security code on the reset page.',
      btnText: 'Reset Password',
      orCode: 'Or enter this 6-digit authorization code:',
      directLinkText: 'Direct password reset link:',
      warning: 'Never share this code or link with anyone. If you did not request a password reset, change your account credentials immediately or contact support.',
    },
    uz: {
      subject: 'Parolingizni Tiklang - Orven Media',
      title: 'Parolingizni Qayta Oʻrnatish',
      intro: 'Orven Media akkauntingiz uchun parolni tiklash soʻrovi yuborildi. Yangi parol oʻrnatish uchun quyidagi tugmani bosing yoki 6 xonali tasdiqlash kodidan foydalaning.',
      btnText: 'Parolni Tiklash',
      orCode: 'Yoki 6 xonali tasdiqlash kodidan foydalaning:',
      directLinkText: 'Toʻgʻridan-toʻgʻri parolni tiklash havolasi:',
      warning: 'Ushbu kod va havolani hech kimga bermang. Agar parolni tiklashni soʻramagan boʻlsangiz, zudlik bilan profilingiz xavfsizligini tekshiring.',
    },
    ru: {
      subject: 'Сброс Пароля - Orven Media',
      title: 'Восстановление Пароля',
      intro: 'Для вашей учетной записи Orven Media был запрошен сброс пароля. Нажмите кнопку ниже для установки нового пароля или используйте 6-значный проверочный код.',
      btnText: 'Сбросить Пароль',
      orCode: 'Или введите 6-значный код на странице восстановления:',
      directLinkText: 'Прямая ссылка для сброса пароля:',
      warning: 'Никому не сообщайте этот код или ссылку. Если вы не запрашивали сброс пароля, немедленно проверьте безопасность учетной записи.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: 'SECURITY ALERT',
    bodyContent: `
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #a4a4b6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.intro}
      </p>

      ${renderActionButton(resetUrl, t.btnText)}

      <p style="margin: 24px 0 8px 0; text-align: center; font-size: 12px; font-weight: 600; color: #7a7a8c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.orCode}
      </p>

      ${renderCodeBox(code, 'Expires in 10 minutes • Authorized request')}

      <p style="margin: 20px 0 4px 0; font-size: 11px; color: #666675; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.directLinkText}
      </p>
      <p style="margin: 0; font-size: 11px; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
        <a href="${resetUrl}" target="_blank" style="color: #8c8ca8;">${resetUrl}</a>
      </p>

      ${renderSecurityCallout(t.warning, true)}
    `,
    footerNote: 'Automated security transmission from Orven Media Security Gateway.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.intro}\n\nRESET LINK: ${resetUrl}\n\nRESET CODE: ${code}\n\n${t.warning}\n\n---\nOrven Media Security Gateway\n${appUrl}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendEmailChangeCode(
  to: string,
  code: string,
  locale: EmailLocale = 'en'
) {
  const appUrl = getBaseUrl()

  const translations = {
    en: {
      subject: 'Confirm Email Address Change - Orven Media',
      title: 'Confirm Your New Email Address',
      intro: 'You requested to update your primary email address on Orven Media. Enter this 6-digit confirmation code in your account settings to verify ownership of this inbox.',
      security: 'If this change was not requested by you, someone may have unauthorized access to your account. Please change your password immediately.',
    },
    uz: {
      subject: 'Elektron Pochtani Oʻzgartirish - Orven Media',
      title: 'Yangi Pochtani Tasdiqlash',
      intro: 'Orven Media akkauntingiz elektron pochtasini oʻzgartirish soʻraldi. Ushbu pochtaning sizga tegishli ekanligini tasdiqlash uchun 6 xonali kodni kiriting.',
      security: 'Agar buni siz soʻramagan boʻlsangiz, zudlik bilan profilingiz parolini yangilang va xavfsizligini taʼminlang.',
    },
    ru: {
      subject: 'Смена Email Адреса - Orven Media',
      title: 'Подтверждение Нового Email',
      intro: 'Вы запросили смену адреса электронной почты на Orven Media. Введите этот 6-значный код в настройках профиля для подтверждения владения почтой.',
      security: 'Если вы не запрашивали изменение, возможно, кто-то получил доступ к вашей учетной записи. Срочно смените пароль.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: 'PROFILE UPDATE',
    bodyContent: `
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #a4a4b6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.intro}
      </p>

      ${renderCodeBox(code, 'Expires in 10 minutes • Verification code')}

      ${renderSecurityCallout(t.security)}
    `,
    footerNote: 'Automated profile security dispatch from Orven Media.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.intro}\n\nCONFIRMATION CODE: ${code}\n\n${t.security}\n\n---\nOrven Media Security Gateway\n${appUrl}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendWelcomeEmail(
  to: string,
  username: string,
  locale: EmailLocale = 'en'
) {
  const appUrl = getBaseUrl()
  const streamUrl = `${appUrl}/browse`

  const translations = {
    en: {
      subject: 'Welcome to Orven Media - Start Streaming',
      title: `Welcome aboard, ${username}`,
      body: 'Your account is now fully verified and activated. You can create custom watchlists, track watching progress across devices, rate series, and enjoy uninterrupted Ultra HD anime and donghua streaming.',
      btnText: 'Start Streaming Now',
      featuresIntro: 'Your membership includes:',
      feature1: 'Ultra HD 1080p / 4K streaming with zero ads',
      feature2: 'Multi-language subtitles (English, Uzbek, Russian)',
      feature3: 'Custom anime tracking & bookmark lists',
    },
    uz: {
      subject: 'Orven Media ga Xush Kelibsiz - Translatsiyani Boshlang',
      title: `Xush kelibsiz, ${username}!`,
      body: 'Akkauntingiz toʻliq tasdiqlandi va faollashtirildi. Endi siz shaxsiy tomosha roʻyxatlarini tuzishingiz, epizodlarni Ultra HD sifatda reklamasiz tomosha qilishingiz va izohlar qoldirishingiz mumkin.',
      btnText: 'Tomosha Qilishni Boshlash',
      featuresIntro: 'Siz uchun mavjud imkoniyatlar:',
      feature1: 'Ultra HD 1080p / 4K sifat va yuqori tezlik',
      feature2: 'Koʻp tilli subtitrlar (Oʻzbekcha, Ruscha, Inglizcha)',
      feature3: 'Shaxsiy roʻyxatlar va tomosha tarixini sinxronlash',
    },
    ru: {
      subject: 'Добро пожаловать в Orven Media',
      title: `Добро пожаловать, ${username}!`,
      body: 'Ваш аккаунт успешно подтвержден и активирован. Теперь вы можете формировать персональные списки просмотров, оценивать тайтлы и наслаждаться просмотром аниме и донхуа в Ultra HD качестве.',
      btnText: 'Начать Просмотр',
      featuresIntro: 'Ваши возможности:',
      feature1: 'Просмотр в качестве Ultra HD 1080p / 4K без рекламы',
      feature2: 'Многоязычные субтитры (узбекский, русский, английский)',
      feature3: 'Умная синхронизация истории просмотров между устройствами',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: 'MEMBERSHIP CONFIRMED',
    bodyContent: `
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #a4a4b6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.body}
      </p>

      ${renderActionButton(streamUrl, t.btnText)}

      <div style="margin: 28px 0; padding: 18px 20px; background-color: #16161e; border: 1px solid #23232e; border-radius: 6px;">
        <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">
          ${t.featuresIntro}
        </div>
        <ul style="margin: 0; padding-left: 18px; color: #8e8ea2; font-size: 13px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <li>${t.feature1}</li>
          <li>${t.feature2}</li>
          <li>${t.feature3}</li>
        </ul>
      </div>
    `,
    footerNote: 'Thank you for being part of the Orven Media streaming community.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.body}\n\nStart streaming now: ${streamUrl}\n\n---\nOrven Media Team\n${appUrl}`

  return sendEmail({ to, subject: t.subject, html, text })
}
