import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import redirect from '../netlify/edge-functions/language-redirect.js';

const active = ['fr', 'en', 'sv'];
const disabled = ['nl', 'de', 'lb'];
const gateway = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
const redirects = await readFile(new URL('../dist/_redirects', import.meta.url), 'utf8');
assert.match(config, /function\s*=\s*"language-redirect"/);
for (const lang of active) {
  assert.ok(gateway.includes(`href="/${lang}/"`), `${lang}: gateway link`);
  const page = await readFile(new URL(`../dist/${lang}/index.html`, import.meta.url), 'utf8');
  assert.ok(page.includes(`<html lang="${lang}">`), `${lang}: page`);
}
for (const lang of disabled) {
  assert.ok(!gateway.includes(`href="/${lang}/"`), `${lang}: hidden gateway link`);
  await assert.rejects(access(new URL(`../dist/${lang}/index.html`, import.meta.url)));
  assert.match(redirects, new RegExp(`/${lang}/ /en/ 302`));
  assert.match(redirects, new RegExp(`/${lang}/horses/programmes/ /en/horses/programmes/ 302`));
}
const make = (headers = {}) => new Request('https://example.net/?ref=x', { headers });
for (const [headers, destination] of [
  [{ 'accept-language': 'sv-SE,fr;q=0.8' }, '/sv/?ref=x'],
  [{ 'accept-language': 'de-DE,de;q=0.9' }, '/en/?ref=x'],
  [{ cookie: 'prepinson-language=nl', 'accept-language': 'fr-FR' }, '/fr/?ref=x'],
  [{ cookie: 'prepinson-language=sv', 'accept-language': 'fr-FR' }, '/sv/?ref=x'],
]) {
  const response = await redirect(make(headers), { next: () => { throw Error('unexpected next'); } });
  assert.equal(response.status, 302);
  assert.equal(new URL(response.headers.get('location')).pathname + new URL(response.headers.get('location')).search, destination);
}
console.log('PASS: active languages, disabled routes, and root language selection');
