import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

let memoryCookie = '';

export function getMemoryCookie() {
  return memoryCookie;
}

export function setMemoryCookie(cookie: string) {
  memoryCookie = cookie;
}

export async function getUserCookie() {
  try {
    return (
      (await readTextFile('cookie.txt', {
        dir: BaseDirectory.AppLocalData,
      })) || ''
    );
  } catch (e) {
    return '';
  }
}

export async function setUserCookie(cookie: string) {
  try {
    return await writeTextFile('cookie.txt', cookie, {
      dir: BaseDirectory.AppLocalData,
    });
  } catch (e) {
    //
  }
}
