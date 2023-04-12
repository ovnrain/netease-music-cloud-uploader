import { Body } from '@tauri-apps/api/http';
import type {
  UploadCheckResult,
  CloudData,
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
import rq, { RqResult } from './rq';

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

function getUserInfo() {
  return rq<UserInfo>('https://music.163.com/api/nuser/account/get');
}

function getUniKey() {
  return rq<Unikey>(
    'https://music.163.com/api/login/qrcode/unikey',
    {
      body: Body.form({ type: '1' }),
    },
    {
      useCookie: false,
    }
  );
}

function qrLogin(uniKey: string) {
  return rq<LoginStatus>(
    'https://music.163.com/api/login/qrcode/client/login',
    {
      body: Body.form({ type: '1', key: uniKey }),
    },
    {
      useCookie: false,
    }
  );
}

async function getCloudData(page: number): Promise<RqResult<CloudData>> {
  // 每页 500 首歌曲
  const size = 500;
  const response = await rq<CloudData>('https://music.163.com/api/v1/cloud/get', {
    body: Body.form({ limit: `${size}`, offset: `${(page - 1) * size}` }),
  });

  const { result, ...rest } = response;

  return {
    ...rest,
    result: {
      ...result,
      nextPage: result.hasMore ? page + 1 : undefined,
    },
  };
}

async function uploadCheck(uploadFile: UploadFile) {
  const response = await rq<UploadCheckResult>(
    'https://interface.music.163.com/api/cloud/upload/check',
    {
      body: Body.form({
        bitrate: '999000',
        ext: '',
        songId: '0',
        version: '1',
        md5: uploadFile.md5,
        size: `${uploadFile.file.size}`,
      }),
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
    body: Body.form({
      bucket: '',
      local: 'false',
      nos_product: '3',
      type: 'audio',
      ext: ext.toUpperCase(),
      filename: fileName,
      md5: uploadFile.md5,
    }),
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '获取 token 错误');
  }

  return response;
}

async function getUploadCloudInfo(data: UploadCloudInfoData) {
  const response = await rq<UploadCloudInfo>('https://music.163.com/api/upload/cloud/info/v2', {
    body: Body.form({
      bitrate: '999000',
      ...data,
    }),
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '获取云盘歌曲信息错误');
  }

  return response;
}

async function pubCloud(data: { songid: string }) {
  const response = await rq<PubCloudResult>('https://interface.music.163.com/api/cloud/pub/v2', {
    body: Body.form(data),
  });

  if (response.code !== 200 && response.code !== 201) {
    throw new Error(response.message || '歌曲发布错误');
  }

  return response;
}

async function deleteCloud(data: { songIds: number[] }) {
  const response = await rq<DeleteCloudResult>('https://music.163.com/api/cloud/del', {
    body: Body.form({ songIds: JSON.stringify(data.songIds) }),
  });

  if (response.code !== 200) {
    throw new Error(response.message || '删除失败');
  }

  return response;
}

async function matchSong(data: MatchSongData) {
  const response = await rq<MatchSongResult>('https://music.163.com/api/cloud/user/song/match', {
    body: Body.form({
      userId: `${data.userId}`,
      adjustSongId: `${data.adjustSongId}`,
      songId: `${data.songId}`,
    }),
  });

  if (response.code !== 200) {
    throw new Error(response.message || '匹配失败');
  }

  return response;
}

async function uploadFile(data: UploadFileData) {
  const url = `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${data.objectKey}?offset=0&complete=true&version=1.0`;
  const buffer = await data.file.arrayBuffer();
  return rq<UploadFileResult>(url, {
    body: Body.bytes(buffer),
    headers: {
      'x-nos-token': data.token,
      'Content-MD5': data.md5,
      'Content-Type': data.file.type,
    },
  });
}

const APIS = {
  getUserInfo,
  getUniKey,
  qrLogin,
  getCloudData,
  uploadCheck,
  getUploadToken,
  getUploadCloudInfo,
  pubCloud,
  deleteCloud,
  matchSong,
  uploadFile,
};

export default APIS;
