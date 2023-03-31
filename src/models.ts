export interface UserInfo {
  code: number;
  account: { id: number } | null;
  profile: { avatarUrl: string; nickname: string } | null;
}

export interface Unikey {
  code: number;
  unikey: string;
}

export interface LoginStatus {
  code: number;
  message: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface CloudSong {
  addTime: number;
  album: string;
  artist: string;
  fileName: string;
  fileSize: number;
  songId: number;
  songName: string;
}

export interface CloudList {
  code: number;
  count: number;
  data: CloudSong[];
  hasMore: boolean;
  maxSize: string;
  size: string;
  upgradeSign: number;
}
