import { ResponseType, fetch } from '@tauri-apps/api/http';
import type { UserInfo } from './models';

async function getUserInfo() {
  const response = await fetch<UserInfo>('https://music.163.com/api/nuser/account/get', {
    method: 'POST',
    responseType: ResponseType.JSON,
  });
  return response.data;
}

const APIS = {
  getUserInfo,
};

export default APIS;
