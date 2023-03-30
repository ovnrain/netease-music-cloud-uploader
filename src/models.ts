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
