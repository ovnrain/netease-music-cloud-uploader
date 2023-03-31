import { Body, ResponseType } from '@tauri-apps/api/http';
import type { LoginStatus, Unikey, UserInfo } from './models';
import rq from './rq';

async function getUserInfo() {
  const response = await rq<UserInfo>(
    'https://music.163.com/api/nuser/account/get',
    {
      method: 'POST',
      responseType: ResponseType.JSON,
    },
    true
  );
  return response.data;
}

async function getUniKey() {
  const response = await rq<Unikey>(
    'https://music.163.com/api/login/qrcode/unikey',
    {
      method: 'POST',
      body: Body.form({ type: '1' }),
      responseType: ResponseType.JSON,
    },
    false
  );
  return response.data.unikey;
}

async function qrLogin(uniKey: string) {
  const response = await rq<LoginStatus>(
    'https://music.163.com/api/login/qrcode/client/login',
    {
      method: 'POST',
      body: Body.form({ type: '1', key: uniKey }),
      responseType: ResponseType.JSON,
    },
    false
  );
  return response.data;
}

const APIS = {
  getUserInfo,
  getUniKey,
  qrLogin,
};

export default APIS;
