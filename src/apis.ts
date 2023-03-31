import { Body, ResponseType } from '@tauri-apps/api/http';
import MD5 from 'spark-md5';
import type { CheckResult, CloudList, LoginStatus, Unikey, UploadFile, UserInfo } from './models';
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

async function getCloudList() {
  const response = await rq<CloudList>(
    'https://music.163.com/api/v1/cloud/get',
    {
      method: 'POST',
      body: Body.form({ limit: '1000', offset: '0' }),
      responseType: ResponseType.JSON,
    },
    true
  );
  return response.data;
}

async function uploadCheck(uploadFile: UploadFile) {
  const md5 = MD5.ArrayBuffer.hash(await uploadFile.file.arrayBuffer());
  const response = await rq<CheckResult>(
    'https://interface.music.163.com/api/cloud/upload/check',
    {
      method: 'POST',
      body: Body.form({
        bitrate: '999000',
        ext: '',
        songId: '0',
        version: '1',
        md5,
        size: `${uploadFile.file.size}`,
      }),
      responseType: ResponseType.JSON,
    },
    true
  );
  return response.data;
}

const APIS = {
  getUserInfo,
  getUniKey,
  qrLogin,
  getCloudList,
  uploadCheck,
};

export default APIS;
