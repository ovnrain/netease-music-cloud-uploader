import { Body, ResponseType } from '@tauri-apps/api/http';
import type {
  UploadCheckResult,
  CloudList,
  LoginStatus,
  Unikey,
  UploadFile,
  UserInfo,
  UploadTokenResult,
  DeleteCloudResult,
  MatchSongResult,
  UploadCloudInfo,
  PubCloudResult,
  UploadFileResult,
} from './models';
import rq from './rq';

export interface UploadCloudInfoData {
  md5: string;
  songid: string;
  filename: string;
  song: string;
  album?: string;
  artist?: string;
  resourceId: string;
}

export interface MatchSongData {
  userId: number;
  adjustSongId: number;
  songId: number;
}

export interface UploadFileData {
  file: File;
  md5: string;
  objectKey: string;
  token: string;
}

async function getUserInfo() {
  const response = await rq<UserInfo>('https://music.163.com/api/nuser/account/get', {
    method: 'POST',
    responseType: ResponseType.JSON,
  });
  return response;
}

async function getUniKey() {
  const response = await rq<Unikey>(
    'https://music.163.com/api/login/qrcode/unikey',
    {
      method: 'POST',
      body: Body.form({ type: '1' }),
      responseType: ResponseType.JSON,
    },
    {
      useCookie: false,
    }
  );
  return response;
}

async function qrLogin(uniKey: string) {
  const response = await rq<LoginStatus>(
    'https://music.163.com/api/login/qrcode/client/login',
    {
      method: 'POST',
      body: Body.form({ type: '1', key: uniKey }),
      responseType: ResponseType.JSON,
    },
    {
      useCookie: false,
    }
  );
  return response;
}

async function getCloudList() {
  const response = await rq<CloudList>('https://music.163.com/api/v1/cloud/get', {
    method: 'POST',
    body: Body.form({ limit: '1000', offset: '0' }),
    responseType: ResponseType.JSON,
  });
  return response;
}

async function uploadCheck(uploadFile: UploadFile) {
  const response = await rq<UploadCheckResult>(
    'https://interface.music.163.com/api/cloud/upload/check',
    {
      method: 'POST',
      body: Body.form({
        bitrate: '999000',
        ext: '',
        songId: '0',
        version: '1',
        md5: uploadFile.md5,
        size: `${uploadFile.file.size}`,
      }),
      responseType: ResponseType.JSON,
    }
  );

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '上传检查错误');
  }

  return response;
}

async function getUploadToken(uploadFile: UploadFile) {
  const ext = uploadFile.file.name.split('.').pop() as string;
  const fileName = uploadFile.file.name
    .replace('.' + ext, '')
    .replace(/\s/g, '')
    .replace(/\./g, '_');
  const response = await rq<UploadTokenResult>('https://music.163.com/api/nos/token/alloc', {
    method: 'POST',
    body: Body.form({
      bucket: '',
      local: 'false',
      nos_product: '3',
      type: 'audio',
      ext: ext.toUpperCase(),
      filename: fileName,
      md5: uploadFile.md5,
    }),
    responseType: ResponseType.JSON,
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '获取 token 错误');
  }

  return response;
}

async function getUploadCloudInfo(data: UploadCloudInfoData) {
  const response = await rq<UploadCloudInfo>('https://music.163.com/api/upload/cloud/info/v2', {
    method: 'POST',
    body: Body.form({
      bitrate: '999000',
      ...data,
    }),
    responseType: ResponseType.JSON,
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '获取云盘歌曲信息错误');
  }

  return response;
}

async function pubCloud(data: { songid: string }) {
  const response = await rq<PubCloudResult>('https://interface.music.163.com/api/cloud/pub/v2', {
    method: 'POST',
    body: Body.form(data),
    responseType: ResponseType.JSON,
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '歌曲发布错误');
  }

  return response;
}

async function deleteCloud(data: { songIds: number[] }) {
  const response = await rq<DeleteCloudResult>('https://music.163.com/api/cloud/del', {
    method: 'POST',
    body: Body.form({ songIds: JSON.stringify(data.songIds) }),
    responseType: ResponseType.JSON,
  });

  if (response.code !== 200) {
    throw new Error(response.message || '删除失败');
  }

  return response;
}

async function matchSong(data: MatchSongData) {
  const response = await rq<MatchSongResult>('https://music.163.com/api/cloud/user/song/match', {
    method: 'POST',
    body: Body.form({
      userId: `${data.userId}`,
      adjustSongId: `${data.adjustSongId}`,
      songId: `${data.songId}`,
    }),
    responseType: ResponseType.JSON,
  });

  if (response.code !== 200) {
    throw new Error(response.message || '匹配失败');
  }

  return response;
}

async function uploadFile(data: UploadFileData) {
  const url = `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${data.objectKey}?offset=0&complete=true&version=1.0`;
  const buffer = await data.file.arrayBuffer();
  const response = await rq<UploadFileResult>(url, {
    method: 'POST',
    body: Body.bytes(buffer),
    headers: {
      'x-nos-token': data.token,
      'Content-MD5': data.md5,
      'Content-Type': data.file.type,
    },
    responseType: ResponseType.JSON,
  });
  return response;
}

const APIS = {
  getUserInfo,
  getUniKey,
  qrLogin,
  getCloudList,
  uploadCheck,
  getUploadToken,
  getUploadCloudInfo,
  pubCloud,
  deleteCloud,
  matchSong,
  uploadFile,
};

export default APIS;
