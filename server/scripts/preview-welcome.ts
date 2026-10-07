import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderWelcome } from '../dist/infrastructure/mail/welcome.template.js';
import { welcomeLogoFormat } from '../dist/infrastructure/mail/welcome-logo.js';

// Pure local rendering: no Nest boot, SMTP transport, database or .env loading.
const logo = readFileSync(resolve('../assets/brand/valentia-logo.png'));
const preview = renderWelcome(
  'عمر',
  'http://localhost:3000/login',
  `data:${welcomeLogoFormat(logo).contentType};base64,${logo.toString('base64')}`,
);
const directory = resolve('test/previews');
mkdirSync(directory, { recursive: true });
writeFileSync(resolve(directory, 'welcome.html'), preview.html);
writeFileSync(resolve(directory, 'welcome.txt'), preview.text);
console.log('Local preview: server/test/previews/welcome.html (no email sent)');
