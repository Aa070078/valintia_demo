/** Shared email/preview renderer. Dynamic text and URLs are always escaped. */
export const WELCOME_SUBJECT = 'مرحبًا بك في فالنتيا | Welcome to Valentia';
// Content-ID uses addr-spec syntax; this namespace is not an image-hosting URL.
export const WELCOME_LOGO_CID = 'valentia-welcome-logo@valentia.inline';
const colors = {
  brown: '#503C2C',
  copper: '#B88460',
  gray: '#707070',
  line: '#C8C8C8',
};
function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );
}
export function welcomeFirstName(value?: string | null): string {
  // Usernames can be emails; never derive a name from an email address.
  if (!value || value.includes('@')) return '';
  return value.trim().split(/\s+/)[0].slice(0, 80);
}
export function frontendLoginUrl(
  value: string | undefined,
  production: boolean,
): string {
  if (!value || /[{}]|\s/.test(value))
    throw new Error('WELCOME_FRONTEND_LOGIN_URL must be a resolved URL');
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash
  )
    throw new Error(
      'WELCOME_FRONTEND_LOGIN_URL must be an HTTP(S) URL without credentials or fragments',
    );
  const host = url.hostname.toLowerCase();
  if (
    production &&
    (url.protocol !== 'https:' ||
      !host.includes('.') ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.includes(':') ||
      /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
      /(^|\.)(example\.(com|org|net)|example|invalid|test)$/.test(host) ||
      /placeholder|change-me|your-domain|your-frontend|your-deployment/.test(
        host,
      ))
  )
    throw new Error(
      'Production welcome emails require a real HTTPS frontend login URL',
    );
  return url.toString();
}
export function renderWelcome(
  firstName: string | undefined,
  loginUrl: string,
  logoSrc = `cid:${WELCOME_LOGO_CID}`,
) {
  const name = welcomeFirstName(firstName);
  const arGreeting = name ? `أهلًا بك، ${name}` : 'أهلًا بك';
  const enGreeting = name ? `Welcome aboard, ${name}` : 'Welcome aboard';
  const button = (label: string) =>
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0"><tr><td bgcolor="${colors.brown}" style="border-radius:6px"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:16px 34px;border:1px solid ${colors.copper};border-radius:6px;color:#FFFFFF;font-size:17px;font-weight:bold;text-decoration:none">${label}</a></td></tr></table>`;
  const html = `<!doctype html><html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${WELCOME_SUBJECT}</title></head><body style="margin:0;padding:0;background:#FFFFFF;color:${colors.gray};font-family:Arial,Tahoma,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px"><tr><td align="center" style="padding:0 0 28px"><img src="${escapeHtml(logoSrc)}" width="220" alt="فالنتيا — التصميم والبناء | VALENTIA — DESIGN &amp; BUILD" style="display:block;width:220px;max-width:100%;height:auto;border:0;margin:0 auto"></td></tr>
<tr><td lang="ar" dir="rtl" align="right" style="direction:rtl;text-align:right;padding:0 16px;font-size:17px;line-height:1.9">
<p style="margin:0;color:${colors.brown};font-size:25px;font-weight:bold">فالنتيا</p><p style="margin:0 0 28px;color:${colors.copper};font-size:14px">التصميم والبناء</p>
<h1 style="margin:0 0 20px;color:${colors.brown};font-size:25px;line-height:1.5">${escapeHtml(arGreeting)}</h1>
<p style="margin:0 0 18px">اكتمل إعداد حسابك بنجاح. يسعدنا انضمامك إلى فالنتيا.</p>
<p style="margin:0">تجربة أكثر سلاسة تنتظرك، لتتابع أعمالك ومستجداتك وتتواصل معنا بسهولة، في مكان واحد.</p>
${button('ابدأ الآن')}<p style="margin:0 0 32px">مع أطيب التحيات،<br>فريق فالنتيا</p></td></tr>
<tr><td style="padding:0 16px"><div style="border-top:1px solid ${colors.line};height:1px;font-size:1px;line-height:1px">&nbsp;</div></td></tr>
<tr><td lang="en" dir="ltr" align="left" style="direction:ltr;text-align:left;padding:32px 16px 0;font-size:16px;line-height:1.8">
<p style="margin:0;color:${colors.brown};font-size:23px;letter-spacing:4px;font-weight:bold">VALENTIA</p><p style="margin:0 0 28px;color:${colors.copper};font-size:12px;letter-spacing:2px">DESIGN &amp; BUILD</p>
<h2 style="margin:0 0 20px;color:${colors.brown};font-size:24px;line-height:1.5">${escapeHtml(enGreeting)}</h2>
<p style="margin:0 0 18px">Your account setup is complete. We’re pleased to welcome you to Valentia.</p>
<p style="margin:0">A smoother experience awaits—follow your work, stay up to date, and connect with us, all in one place.</p>
${button('Get started')}<p style="margin:0">Warm regards,<br>The Valentia Team</p></td></tr>
</table></td></tr></table></body></html>`;
  const text = `فالنتيا\nالتصميم والبناء\n\n${arGreeting}\n\nاكتمل إعداد حسابك بنجاح. يسعدنا انضمامك إلى فالنتيا.\n\nتجربة أكثر سلاسة تنتظرك، لتتابع أعمالك ومستجداتك وتتواصل معنا بسهولة، في مكان واحد.\n\nابدأ الآن: ${loginUrl}\n\nمع أطيب التحيات،\nفريق فالنتيا\n\n────────────────────\n\nVALENTIA\nDESIGN & BUILD\n\n${enGreeting}\n\nYour account setup is complete. We’re pleased to welcome you to Valentia.\n\nA smoother experience awaits—follow your work, stay up to date, and connect with us, all in one place.\n\nGet started: ${loginUrl}\n\nWarm regards,\nThe Valentia Team`;
  return { subject: WELCOME_SUBJECT, html, text };
}
