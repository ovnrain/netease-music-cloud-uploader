export interface UserInfo {
  code: number;
  account: { id: number } | null;
  profile: { avatarUrl: string; nickname: string } | null;
}
