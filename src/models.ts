import type { ICommonTagsResult } from 'music-metadata/lib/type';
import type { RqResult } from './rq';

export interface UserInfo extends RqResult {
  account: { id: number };
  profile: { avatarUrl: string; nickname: string };
}

export interface Unikey extends RqResult {
  unikey: string;
}

export interface LoginStatus extends RqResult {
  message: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface SimpleSong {
  name: string;
  // 歌手
  ar?: {
    name?: string;
  }[];
  // 专辑
  al?: {
    name?: string;
    picUrl: string;
  };
}

export interface CloudSong {
  addTime: number;
  album: string;
  artist: string;
  fileName: string;
  fileSize: number;
  songId: number;
  songName: string;
  simpleSong: SimpleSong;
}

export interface CloudList extends RqResult {
  count: number;
  data: CloudSong[];
  hasMore: boolean;
  maxSize: string;
  size: string;
  upgradeSign: number;
}

export interface UploadFile {
  error?: Error;
  file: File;
  md5: string;
  metadata?: ICommonTagsResult;
  ext: string;
  status?: 'pending' | 'uploading' | 'uploaded' | 'error';
}

export interface UploadCheckResult extends RqResult {
  // 如果是 false，说明云上已经有了，不需要再从本地上传了
  needUpload: boolean;
  songId: string;
}

export interface UploadTokenResult extends RqResult {
  result: {
    objectKey: string;
    resourceId: number;
    token: string;
  };
}

export interface UploadCloudInfo extends RqResult {
  songId: string;
}

export interface PubCloudResult extends RqResult {}

export interface DeleteCloudResult extends RqResult {
  succIds?: number[];
  failIds?: number[];
}

export interface MatchSongResult extends RqResult {
  data: boolean;
  matchData: CloudSong;
}

export interface UploadFileResult extends RqResult {
  requestId: string;
  offset: number;
  context: string;
  callbackRetMsg: string;
}
