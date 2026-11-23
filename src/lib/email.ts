import nodemailer from 'nodemailer'

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
    })
    return transporter
  }

  return null
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; devMode?: boolean; error?: string }> {
  const from = process.env.EMAIL_FROM || 'Orven Media <noreply@orven.media>'
  const mailer = getTransporter()

  if (!mailer) {
    // Development / Local Fallback: Print cleanly to console log
    console.log('\n╔════════════════════════════════════════════════════════════════╗')
    console.log('║               ORVEN MEDIA EMAIL DISPATCH LOG                   ║')
    console.log('╠════════════════════════════════════════════════════════════════╣')
    console.log(`║ TO:      ${to}`)
    console.log(`║ SUBJECT: ${subject}`)
    console.log('╟────────────────────────────────────────────────────────────────╢')
    console.log(text.split('\n').map((line) => `║ ${line}`).join('\n'))
    console.log('╚════════════════════════════════════════════════════════════════╝\n')

    return { success: true, devMode: true }
  }

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to: ${to}`)
    return { success: true }
  } catch (err: any) {
    console.error('[EMAIL ERROR] Failed to send email:', err.message || err)
    return { success: false, error: err.message || 'Failed to dispatch email' }
  }
}

function baseTemplate(title: string, bodyContent: string, footerNote: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      background-color: #0b0b0d;
      color: #d9d9de;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: #111114;
      border: 1px solid #26262c;
      border-radius: 2px;
      overflow: hidden;
    }
    .header {
      padding: 24px 32px;
      border-bottom: 1px solid #26262c;
      background: #17171b;
      display: flex;
      align-items: center;
    }
    .logo-badge {
      display: inline-block;
      background: #a0a0b0;
      color: #0b0b0d;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 6px;
      letter-spacing: 1px;
      margin-right: 10px;
    }
    .brand-title {
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 1.5px;
      color: #d9d9de;
    }
    .brand-title span {
      color: #8b8b94;
      font-weight: 300;
    }
    .content {
      padding: 32px;
    }
    h2 {
      color: #d9d9de;
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }
    p {
      color: #8b8b94;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .code-box {
      background: #17171b;
      border: 1px solid #3a3a44;
      border-radius: 2px;
      padding: 18px;
      text-align: center;
      margin: 24px 0;
    }
    .code-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 10px;
      color: #d9d9de;
      text-indent: 10px;
    }
    .footer {
      padding: 20px 32px;
      background: #0b0b0d;
      border-top: 1px solid #17171b;
      color: #56565e;
      font-size: 11px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="logo-badge">OM</span>
      <span class="brand-title">ORVEN <span>MEDIA</span></span>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${bodyContent}
    </div>
    <div class="footer">
      ${footerNote}
      <br>&copy; ${new Date().getFullYear()} Orven Media. All rights reserved.
    </div>
  </div>
</body>
</html>
  `
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  locale: EmailLocale = 'en'
) {
  const translations = {
    en: {
      subject: 'Your Verification Code - Orven Media',
      title: 'Verify Your Email Address',
      intro: 'Thank you for registering on Orven Media. Enter this 6-digit confirmation code to activate your account. Code expires in 10 minutes.',
      security: 'If you did not request this account, you can safely disregard this email.',
    },
    uz: {
      subject: 'Tasdiqlash Kodi - Orven Media',
      title: 'Elektron Pochtangizni Tasdiqlang',
      intro: 'Orven Media platformasiga xush kelibsiz. Akkauntingizni faollashtirish uchun ushbu 6 xonali tasdiqlash kodini kiriting. Kod 10 daqiqa amal qiladi.',
      security: 'Agar siz roʻyxatdan oʻtmagan boʻlsangiz, ushbu xabarni eʼtiborsiz qoldirishingiz mumkin.',
    },
    ru: {
      subject: 'Код Подтверждения - Orven Media',
      title: 'Подтвердите Ваш Email',
      intro: 'Благодарим за регистрацию на Orven Media. Введите этот 6-значный проверочный код для активации аккаунта. Код действителен в течение 10 минут.',
      security: 'Если вы не регистрировались на нашем сервисе, просто проигнорируйте это письмо.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate(
    t.title,
    `
      <p>${t.intro}</p>
      <div class="code-box">
        <div class="code-digits">${code}</div>
      </div>
      <p style="font-size: 11px; color: #56565e;">${t.security}</p>
    `,
    'Automated notification. Please do not reply directly to this message.'
  )

  const text = `${t.title}\n\n${t.intro}\n\nVERIFICATION CODE: ${code}\n\n${t.security}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  locale: EmailLocale = 'en'
) {
  const translations = {
    en: {
      subject: 'Password Reset Code - Orven Media',
      title: 'Reset Your Password',
      intro: 'A password reset was requested for your Orven Media account. Use the following 6-digit code to authorize the change. Valid for 10 minutes.',
      warning: 'Never share this code with anyone. If you did not request a password reset, change your credentials immediately.',
    },
    uz: {
      subject: 'Parolni Tiklash Kodi - Orven Media',
      title: 'Parolingizni Qayta Oʻrnatish',
      intro: 'Orven Media akkauntingiz uchun parolni tiklash soʻrovi yuborildi. Oʻzgarishni tasdiqlash uchun quyidagi 6 xonali koddan foydalaning. Amal qilish muddati: 10 daqiqa.',
      warning: 'Ushbu kodni hech kimga bermang. Agar parolni tiklashni soʻramagan boʻlsangiz, zudlik bilan akkauntingizni tekshiring.',
    },
    ru: {
      subject: 'Сброс Пароля - Orven Media',
      title: 'Восстановление Пароля',
      intro: 'Для вашего аккаунта Orven Media был запрошен сброс пароля. Используйте следующий 6-значный код. Действителен 10 минут.',
      warning: 'Никому не сообщайте этот код. Если вы не запрашивали сброс, рекомендуем срочно сменить пароль.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate(
    t.title,
    `
      <p>${t.intro}</p>
      <div class="code-box">
        <div class="code-digits">${code}</div>
      </div>
      <p style="font-size: 11px; color: #c43c3c;">${t.warning}</p>
    `,
    'Automated security transmission from Orven Media security gateway.'
  )

  const text = `${t.title}\n\n${t.intro}\n\nRESET CODE: ${code}\n\n${t.warning}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendEmailChangeCode(
  to: string,
  code: string,
  locale: EmailLocale = 'en'
) {
  const translations = {
    en: {
      subject: 'Confirm Email Address Change - Orven Media',
      title: 'Confirm Your New Email Address',
      intro: 'You requested to update your email address on Orven Media. Enter this code to verify ownership of this inbox. Valid for 10 minutes.',
      security: 'If this was not requested by you, please secure your account immediately.',
    },
    uz: {
      subject: 'Elektron Pochtani Oʻzgartirish - Orven Media',
      title: 'Yangi Pochtani Tasdiqlash',
      intro: 'Orven Media akkauntingiz elektron pochtasini oʻzgartirish soʻraldi. Ushbu pochtaning sizga tegishli ekanligini tasdiqlash uchun kodni kiriting. Amal qilish muddati: 10 daqiqa.',
      security: 'Agar buni siz soʻramagan boʻlsangiz, zudlik bilan profilingiz xavfsizligini taʼminlang.',
    },
    ru: {
      subject: 'Смена Email Адреса - Orven Media',
      title: 'Подтверждение Нового Email',
      intro: 'Вы запросили смену адреса электронной почты на Orven Media. Введите этот код для подтверждения. Действителен 10 минут.',
      security: 'Если вы не запрашивали изменение, срочно проверьте безопасность учетной записи.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate(
    t.title,
    `
      <p>${t.intro}</p>
      <div class="code-box">
        <div class="code-digits">${code}</div>
      </div>
      <p style="font-size: 11px; color: #56565e;">${t.security}</p>
    `,
    'Automated security dispatch from Orven Media.'
  )

  const text = `${t.title}\n\n${t.intro}\n\nCONFIRMATION CODE: ${code}\n\n${t.security}`

  return sendEmail({ to, subject: t.subject, html, text })
}

export async function sendWelcomeEmail(
  to: string,
  username: string,
  locale: EmailLocale = 'en'
) {
  const translations = {
    en: {
      subject: 'Welcome to Orven Media',
      title: `Welcome aboard, ${username}`,
      body: 'Your account is now fully verified. You can create custom watchlists, rate series, leave comments, and enjoy uninterrupted Ultra HD streaming.',
    },
    uz: {
      subject: 'Orven Media ga Xush Kelibsiz',
      title: `Platformaga xush kelibsiz, ${username}`,
      body: 'Akkauntingiz muvaffaqiyatli tasdiqlandi. Endi siz shaxsiy roʻyxatlar tuzishingiz, baholashingiz, izohlar qoldirishingiz va cheklovlarsiz Ultra HD translatsiyadan bahramand boʻlishingiz mumkin.',
    },
    ru: {
      subject: 'Добро пожаловать в Orven Media',
      title: `Добро пожаловать, ${username}`,
      body: 'Ваш аккаунт успешно верифицирован. Теперь вы можете формировать списки просмотров, оценивать тайтлы, писать комментарии и наслаждаться просмотром в Ultra HD качестве.',
    },
  }

  const t = translations[locale] || translations.en

  const html = baseTemplate(
    t.title,
    `
      <p>${t.body}</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background: #a0a0b0; color: #0b0b0d; padding: 10px 24px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; border-radius: 1px; display: inline-block;">
          START STREAMING
        </a>
      </div>
    `,
    'Thank you for being part of the Orven Media community.'
  )

  const text = `${t.title}\n\n${t.body}\n\nStart streaming now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`

  return sendEmail({ to, subject: t.subject, html, text })
}
