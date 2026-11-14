import { test, expect } from 'bun:test';
import { updateTvManifest, installTvBranding } from './android-tv-branding.mjs';
import { mkdtemp, mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const manifest = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"><uses-permission android:name="android.permission.INTERNET"/><application android:theme="@style/Custom"><activity android:name=".MainActivity" android:launchMode="singleTask"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity><provider android:name="custom.Provider"/></application></manifest>`;
test('TV launcher branding preserves existing activity, provider and permissions', () => {
  const result = updateTvManifest(manifest);
  expect(result).toContain('android:banner="@drawable/smarty_couch_tv_banner"');
  expect(result).toContain('android:icon="@mipmap/smarty_couch_launcher"');
  expect(result).toContain('android.intent.category.LEANBACK_LAUNCHER');
  expect(result).toContain('android.hardware.touchscreen" android:required="false"');
  expect(result).toContain('android.software.leanback" android:required="false"');
  expect(result).toContain('custom.Provider'); expect(result).toContain('@style/Custom');
  expect(result).toContain('android.permission.INTERNET');
});
test('repeated Android sync never duplicates manifest declarations', () => {
  const once = updateTvManifest(manifest);
  expect(updateTvManifest(once)).toBe(once);
});
test('missing MainActivity is rejected rather than replacing local manifest', () => {
  expect(() => updateTvManifest('<manifest><application/></manifest>')).toThrow('MainActivity');
});
test('installer resolves hosted resources into native PNGs with manifest backup', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'smarty-tv-test-'));
  const main = path.join(root, 'android/app/src/main');
  try {
    await mkdir(main, { recursive: true });
    await writeFile(path.join(main, 'AndroidManifest.xml'), manifest);
    await cp('native', path.join(root, 'native'), { recursive: true });
    await installTvBranding(root);
    const png = await readFile(path.join(main, 'res/drawable-nodpi/smarty_couch_tv_banner.png'));
    expect(png.readUInt32BE(16)).toBe(320); expect(png.readUInt32BE(20)).toBe(180);
    for (const [density, size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]) {
      const icon = await readFile(path.join(main, `res/mipmap-${density}/smarty_couch_launcher.png`));
      expect(icon.readUInt32BE(16)).toBe(size); expect(icon.readUInt32BE(20)).toBe(size);
    }
    expect(await readFile(path.join(main, 'AndroidManifest.xml.smarty-couch-backup'), 'utf8')).toBe(manifest);
    expect(await readFile(path.join(main, 'res/mipmap-anydpi-v26/smarty_couch_launcher.xml'), 'utf8')).toContain('<adaptive-icon');
    await installTvBranding(root);
    expect((await readFile(path.join(main, 'AndroidManifest.xml'), 'utf8')).match(/LEANBACK_LAUNCHER/g)).toHaveLength(1);
  } finally { await rm(root, { recursive: true, force: true }); }
}, 60000);