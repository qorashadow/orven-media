import nodemailer from 'nodemailer'
import { getBaseUrl } from '@/lib/utils'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export type EmailLocale = 'en' | 'uz' | 'ru'

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
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
      background-color: #0b0b0d !important;
      color: #d9d9de !important;
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
      color: #a0a0b0;
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
        padding: 24px 18px !important;
      }
      .header-padding {
        padding: 18px 18px !important;
      }
      .footer-padding {
        padding: 18px 18px !important;
      }
      .code-display {
        font-size: 26px !important;
        letter-spacing: 8px !important;
        text-indent: 8px !important;
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
<body style="margin: 0; padding: 0; background-color: #0b0b0d; color: #d9d9de;">
  <!-- Preheader text hidden from visual view -->
  <div style="display: none; font-size: 1px; color: #0b0b0d; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${title} • Orven Media Security Gateway
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0b0d; width: 100%;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <!-- Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 540px; background-color: #111114; border: 1px solid #26262c; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Top Accent Line (Calm, subtle brand red) -->
          <tr>
            <td height="2" style="background-color: #c43c3c; line-height: 2px; font-size: 2px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="header-padding" style="padding: 20px 28px; background-color: #111114; border-bottom: 1px solid #26262c;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center;">
                      <!-- OM Badge matching website design -->
                      <span style="display: inline-block; background-color: #a0a0b0; color: #0b0b0d; font-weight: 800; font-size: 11px; padding: 4px 7px; letter-spacing: 1px; border-radius: 2px; margin-right: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase;">
                        OM
                      </span>
                      <span style="font-weight: 800; font-size: 16px; letter-spacing: 1px; color: #d9d9de; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ORVEN <span style="color: #8b8b94; font-weight: 300; letter-spacing: 2px;">MEDIA</span>
                      </span>
                    </a>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 9px; font-weight: 600; letter-spacing: 1px; color: #56565e; text-transform: uppercase; font-family: ui-monospace, 'SF Mono', monospace;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="mobile-padding" style="padding: 30px 28px;">
              <h1 style="margin: 0 0 14px 0; color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: -0.2px; line-height: 1.35; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${title}
              </h1>
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-padding" style="padding: 20px 28px; background-color: #0b0b0d; border-top: 1px solid #1f1f25;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #56565e; font-size: 11px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ${footerNote}
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #1a1a20;">
                      <a href="${appUrl}" target="_blank" style="color: #8b8b94; text-decoration: none; font-weight: 600;">${displayDomain}</a>
                      <span style="color: #3e3e48; margin: 0 8px;">•</span>
                      <span>Ultra HD Anime & Donghua Streaming</span>
                    </div>
                    <div style="margin-top: 4px; font-size: 10px; color: #464650;">
                      &copy; ${currentYear} Orven Media. All rights reserved.
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
 * Bulletproof action button matching site's primary button style.
 */
function renderActionButton(url: string, label: string) {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0; width: 100%;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:38px;v-text-anchor:middle;width:240px;" arcsize="5%" strokecolor="#a0a0b0" fillcolor="#a0a0b0">
            <w:anchorlock/>
            <center style="color:#0b0b0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.5px;">
              ${label}
            </center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" target="_blank" style="display: inline-block; background-color: #a0a0b0; color: #0b0b0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; padding: 11px 32px; text-decoration: none; border-radius: 2px; text-align: center; text-transform: uppercase;">
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
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px 0; width: 100%;">
      <tr>
        <td align="center" style="background-color: #17171b; border: 1px solid #26262c; border-radius: 2px; padding: 18px 16px;">
          <div class="code-display" style="font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Segoe UI Mono', Menlo, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-align: center; text-indent: 10px; line-height: 1;">
            ${code}
          </div>
          <div style="margin-top: 8px; font-size: 10px; font-weight: 600; color: #8b8b94; letter-spacing: 1px; text-transform: uppercase; font-family: ui-monospace, 'SF Mono', monospace;">
            ${subnote}
          </div>
        </td>
      </tr>
    </table>
  `
}

/**
 * Styled security/warning alert box matching dark theme.
 */
function renderSecurityCallout(text: string, isAlert = false) {
  const borderColor = isAlert ? '#c43c3c' : '#26262c'
  const textColor = isAlert ? '#f07171' : '#8b8b94'
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px 0; width: 100%;">
      <tr>
        <td style="border-left: 2px solid ${borderColor}; background-color: #17171b; padding: 10px 14px; border-radius: 0 2px 2px 0;">
          <p style="margin: 0; font-size: 11px; line-height: 1.5; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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
      badge: 'ACCOUNT ACTIVATION',
      body: 'Thank you for registering with Orven Media. Please enter the following 6-digit verification code to confirm your email and activate your streaming account:',
      expiry: 'This verification code expires in 10 minutes. If you did not create an account on Orven Media, you can safely ignore this transmission.',
      btnText: 'Confirm Email Address',
      orClick: 'Alternatively, you can instantly verify by clicking the button below:',
    },
    uz: {
      subject: 'Email Manzilingizni Tasdiqlang - Orven Media',
      title: 'Emailingizni Tasdiqlang',
      badge: 'AKKAUNTNI FAOLLASHTIRISH',
      body: 'Orven Media platformasida roʻyxatdan oʻtganingiz uchun tashakkur. Streaming akkauntingizni faollashtirish uchun quyidagi 6 xonali tasdiqlash kodini kiriting:',
      expiry: 'Ushbu kod 10 daqiqa davomida amal qiladi. Agar siz ushbu hisobni yaratmagan boʻlsangiz, xabarga eʼtibor bermang.',
      btnText: 'Emailni Tasdiqlash',
      orClick: 'Yoki quyidagi tugmani bosish orqali bir zumda tasdiqlashingiz mumkin:',
    },
    ru: {
      subject: 'Подтвердите адрес электронной почты - Orven Media',
      title: 'Подтверждение почты',
      badge: 'АКТИВАЦИЯ АККАУНТА',
      body: 'Благодарим вас за регистрацию в Orven Media. Чтобы подтвердить ваш email и активировать аккаунт, введите следующий 6-значный проверочный код:',
      expiry: 'Этот проверочный код действителен в течение 10 минут. Если вы не создавали аккаунт, просто проигнорируйте это письмо.',
      btnText: 'Подтвердить Email',
      orClick: 'Вы также можете мгновенно подтвердить почту, нажав кнопку ниже:',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: t.badge,
    bodyContent: `
      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #a0a0b0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.body}
      </p>

      ${renderCodeBox(code, '10 MINUTES VALIDITY • SINGLE-USE')}

      <p style="margin: 16px 0 6px 0; font-size: 12px; color: #8b8b94; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.orClick}
      </p>

      ${renderActionButton(verifyUrl, t.btnText)}

      ${renderSecurityCallout(t.expiry, false)}
    `,
    footerNote: 'This is an automated security dispatch from Orven Media Authentication Service.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.body}\n\nVERIFICATION CODE: ${code}\n(Valid for 10 minutes)\n\nOr click here to verify directly:\n${verifyUrl}\n\n---\nOrven Media Security Team\n${appUrl}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendPasswordResetEmail(
  to: string,
  tokenOrCode: string,
  locale: EmailLocale = 'en',
  linkToken?: string
) {
  const appUrl = getBaseUrl()
  const isDigitCode = /^\d{6}$/.test(tokenOrCode)
  const resetUrl = linkToken
    ? `${appUrl}/auth/reset-password?email=${encodeURIComponent(to)}&token=${encodeURIComponent(linkToken)}`
    : isDigitCode
      ? `${appUrl}/auth/reset-password?email=${encodeURIComponent(to)}&code=${encodeURIComponent(tokenOrCode)}`
      : `${appUrl}/auth/reset-password?token=${encodeURIComponent(tokenOrCode)}`

  const translations = {
    en: {
      subject: 'Reset Your Password - Orven Media',
      title: 'Password Reset Request',
      badge: 'SECURITY ALERT',
      body: 'We received a request to reset your password for your Orven Media account. If you initiated this request, please use the 6-digit security code below:',
      alert: 'If you did not request a password reset, someone else may be attempting to access your account. Please change your credentials immediately or ignore this message.',
      btnText: 'Reset My Password',
      orClick: 'Or proceed directly via the secure link:',
    },
    uz: {
      subject: 'Parolingizni Tiklang - Orven Media',
      title: 'Parolni Tiklash Soʻrovi',
      badge: 'XAVFSIZLIK BILDIRISHNOMASI',
      body: 'Orven Media akkauntingiz uchun parolni tiklash soʻrovi olindi. Agar ushbu soʻrovni siz yuborgan boʻlsangiz, quyidagi 6 xonali xavfsizlik kodidan foydalaning:',
      alert: 'Agar siz ushbu soʻrovni yubormagan boʻlsangiz, boshqa kimdir akkauntingizga kirishga urinayotgan boʻlishi mumkin. Xavfsizligingiz uchun ushbu xatga eʼtibor bermang.',
      btnText: 'Parolni Yangilash',
      orClick: 'Yoki toʻgʻridan-toʻgʻri havola orqali oʻting:',
    },
    ru: {
      subject: 'Сброс пароля - Orven Media',
      title: 'Сброс пароля',
      badge: 'БЕЗОПАСНОСТЬ',
      body: 'Мы получили запрос на сброс пароля для вашей учетной записи Orven Media. Если это были вы, используйте следующий 6-значный код безопасности:',
      alert: 'Если вы не запрашивали сброс пароля, возможно, кто-то пытается получить доступ к вашему аккаунту. Проигнорируйте это сообщение.',
      btnText: 'Сбросить пароль',
      orClick: 'Или перейдите по прямой ссылке:',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: t.badge,
    bodyContent: `
      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #a0a0b0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.body}
      </p>

      ${renderCodeBox(tokenOrCode, 'EXPIRES IN 1 HOUR • CONFIDENTIAL')}

      <p style="margin: 16px 0 6px 0; font-size: 12px; color: #8b8b94; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.orClick}
      </p>

      ${renderActionButton(resetUrl, t.btnText)}

      ${renderSecurityCallout(t.alert, true)}
    `,
    footerNote: 'If you need further help, please contact Orven Media Support.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.body}\n\nSECURITY CODE: ${tokenOrCode}\n\nDirect Link:\n${resetUrl}\n\n${t.alert}\n\n---\nOrven Media Security\n${appUrl}`

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
      subject: 'Confirm Your New Email Address - Orven Media',
      title: 'Email Address Update',
      badge: 'ACCOUNT SETTINGS',
      body: 'You recently requested to update the email address linked to your Orven Media account. Use the confirmation code below to complete this update:',
      security: 'If you did not make this request from your profile settings, please secure your account credentials immediately.',
    },
    uz: {
      subject: 'Yangi Email Manzilingizni Tasdiqlang - Orven Media',
      title: 'Email Manzilini Oʻzgartirish',
      badge: 'SOZLAMALAR',
      body: 'Yaqinda Orven Media akkauntingizga bogʻlangan email manzilini oʻzgartirishni soʻradingiz. Oʻzgarishni tasdiqlash uchun quyidagi koddan foydalaning:',
      security: 'Agar ushbu soʻrovni siz yubormagan boʻlsangiz, zudlik bilan akkaunt xavfsizligingizni tekshiring.',
    },
    ru: {
      subject: 'Подтвердите новый адрес электронной почты - Orven Media',
      title: 'Обновление адреса почты',
      badge: 'НАСТРОЙКИ АККАУНТА',
      body: 'Вы запросили изменение адреса электронной почты в профиле Orven Media. Введите следующий код для завершения обновления:',
      security: 'Если вы не инициировали это изменение, немедленно проверьте безопасность учетной записи.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate({
    title: t.title,
    badgeText: t.badge,
    bodyContent: `
      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #a0a0b0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.body}
      </p>

      ${renderCodeBox(code, 'EXPIRES IN 15 MINUTES')}

      ${renderSecurityCallout(t.security, true)}
    `,
    footerNote: 'This message was generated following an email change request.',
    appUrl,
  })

  const text = `${t.title}\n\n${t.body}\n\nCONFIRMATION CODE: ${code}\n\n${t.security}\n\n---\nOrven Media Security\n${appUrl}`

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
      <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #a0a0b0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${t.body}
      </p>

      ${renderActionButton(streamUrl, t.btnText)}

      <div style="margin: 24px 0; padding: 16px 18px; background-color: #17171b; border: 1px solid #26262c; border-radius: 2px;">
        <div style="font-size: 11px; font-weight: 700; color: #ffffff; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">
          ${t.featuresIntro}
        </div>
        <ul style="margin: 0; padding-left: 18px; color: #8b8b94; font-size: 12px; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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
