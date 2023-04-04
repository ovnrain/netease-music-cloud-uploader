import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export function replaceHttpWithHttps(url?: string) {
  return url?.replace(/^http:/, 'https:');
}

export async function getUserCookie() {
  try {
    return await readTextFile('cookie.txt', {
      dir: BaseDirectory.AppLocalData,
    });
  } catch (e) {
    return '';
  }
}

export async function setUserCookie(cookie: string) {
  try {
    await writeTextFile('cookie.txt', cookie, {
      dir: BaseDirectory.AppLocalData,
    });
  } catch (e) {
    //
  }
}
