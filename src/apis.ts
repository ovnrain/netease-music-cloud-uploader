import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import type { Unikey, UserInfo } from './models';

async function getUserInfo() {
  const response = await fetch<UserInfo>('https://music.163.com/api/nuser/account/get', {
    method: 'POST',
    responseType: ResponseType.JSON,
  });
  return response.data;
}

async function getUniKey() {
  const response = await fetch<Unikey>('https://music.163.com/api/login/qrcode/unikey', {
    method: 'POST',
    body: Body.form({ type: '1' }),
    responseType: ResponseType.JSON,
  });
  return response.data.unikey;
}

const APIS = {
  getUserInfo,
  getUniKey,
};

export default APIS;
