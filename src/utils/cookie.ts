import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { appLocalDataDir } from '@tauri-apps/api/path';

let memoryCookie = '';

export function getMemoryCookie() {
  return memoryCookie;
}

export function setMemoryCookie(cookie: string) {
  memoryCookie = cookie;
}

export async function getUserCookie() {
  try {
    if (!(await exists('cookie.txt', { dir: BaseDirectory.AppLocalData }))) {
      return '';
    }
    return (
      (await readTextFile('cookie.txt', {
        dir: BaseDirectory.AppLocalData,
      })) || ''
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return '';
  }
}

export async function setUserCookie(cookie: string) {
  try {
    const appLocalDataDirPath = await appLocalDataDir();
    if (!(await exists(appLocalDataDirPath))) {
      await createDir(appLocalDataDirPath);
    }
    return await writeTextFile('cookie.txt', cookie, {
      dir: BaseDirectory.AppLocalData,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}
