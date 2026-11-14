import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ANDROID = 'http://schemas.android.com/apk/res/android';
const attr = (node, name) => node.getAttributeNS(ANDROID, name);
const setAttr = (node, name, value) => node.setAttributeNS(ANDROID, `android:${name}`, value);
const elements = (node, tag) => Array.from(node.childNodes).filter(child => child.nodeType === 1 && child.tagName === tag);

export function updateTvManifest(xml) {
  const doc = new DOMParser({ onError: (level, message) => { if (level !== 'warning') throw new Error(message); } }).parseFromString(xml, 'application/xml');
  const manifest = doc.documentElement;
  const application = elements(manifest, 'application')[0];
  if (!application) throw new Error('Android manifest has no application; no files changed.');
  const activity = elements(application, 'activity').find(node => attr(node, 'name')?.endsWith('MainActivity'));
  if (!activity) throw new Error('MainActivity not found; no files changed.');
  for (const [name, required] of [['android.software.leanback', 'false'], ['android.hardware.touchscreen', 'false']]) {
    let feature = elements(manifest, 'uses-feature').find(node => attr(node, 'name') === name);
    if (!feature) { feature = doc.createElement('uses-feature'); manifest.insertBefore(feature, application); }
    setAttr(feature, 'name', name); setAttr(feature, 'required', required);
  }
  setAttr(application, 'icon', '@mipmap/smarty_couch_launcher');
  setAttr(application, 'roundIcon', '@mipmap/smarty_couch_launcher');
  setAttr(application, 'banner', '@drawable/smarty_couch_tv_banner');
  setAttr(activity, 'icon', '@mipmap/smarty_couch_launcher');
  setAttr(activity, 'banner', '@drawable/smarty_couch_tv_banner');
  setAttr(activity, 'exported', 'true');
  let launcher = elements(activity, 'intent-filter').find(filter => elements(filter, 'action').some(action => attr(action, 'name') === 'android.intent.action.MAIN'));
  if (!launcher) { launcher = doc.createElement('intent-filter'); activity.appendChild(launcher); const action = doc.createElement('action'); setAttr(action, 'name', 'android.intent.action.MAIN'); launcher.appendChild(action); }
  for (const name of ['android.intent.category.LAUNCHER', 'android.intent.category.LEANBACK_LAUNCHER']) {
    if (!elements(launcher, 'category').some(category => attr(category, 'name') === name)) {
      const category = doc.createElement('category'); setAttr(category, 'name', name); launcher.appendChild(category);
    }
  }
  return new XMLSerializer().serializeToString(doc);
}

export async function installTvBranding(root = process.cwd(), origin = 'https://smarty-couch.lovable.app') {
  const main = path.join(root, 'android/app/src/main');
  const manifestPath = path.join(main, 'AndroidManifest.xml');
  const original = await readFile(manifestPath, 'utf8');
  const updated = updateTvManifest(original);
  const resources = path.join(root, 'native/android/res');
  // Download and validate everything before modifying the native project.
  const pending = await Promise.all((await readdir(resources, { recursive: true })).filter(file => file.endsWith('.xml') || file.endsWith('.asset.json')).map(async file => {
    const source = path.join(resources, file);
    if (file.endsWith('.xml')) return { file, data: await readFile(source) };
    const asset = JSON.parse(await readFile(source, 'utf8'));
    const response = await fetch(new URL(asset.url, origin), { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Icon download failed (${response.status}): ${file}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Icon is not a PNG: ${file}`);
    return { file: file.replace(/\.asset\.json$/, ''), data };
  }));
  for (const item of pending) { const target = path.join(main, 'res', item.file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, item.data); }
  if (updated !== original) { await writeFile(`${manifestPath}.smarty-couch-backup`, original); await writeFile(manifestPath, updated); }
  console.log('Smarty Couch Android TV icons, banner, and launcher declarations installed.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href && (!process.env.CAPACITOR_PLATFORM_NAME || process.env.CAPACITOR_PLATFORM_NAME === 'android')) {
  await installTvBranding(process.env.CAPACITOR_ROOT_DIR || process.cwd());
}