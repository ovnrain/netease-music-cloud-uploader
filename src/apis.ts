import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import type { LoginStatus, Unikey, UserInfo } from './models';

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

async function qrLogin(uniKey: string) {
  const response = await fetch<LoginStatus>('https://music.163.com/api/login/qrcode/client/login', {
    method: 'POST',
    body: Body.form({ type: '1', key: uniKey }),
    responseType: ResponseType.JSON,
  });
  return response.data;
}

const APIS = {
  getUserInfo,
  getUniKey,
  qrLogin,
};

export default APIS;
