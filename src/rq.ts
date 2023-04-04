import { fetch, FetchOptions } from '@tauri-apps/api/http';
import { getMemoryCookie, getUserCookie } from './utils/cookie';

export interface RqOptions {
  useCookie?: boolean;
}

export interface RqResult {
  code: number;
  message?: string | number;
  msg?: string;
}

export default async function rq<T extends RqResult>(
  url: string,
  options?: FetchOptions,
  rqOptions?: RqOptions
) {
  const cookie = (getMemoryCookie() || (await getUserCookie())).trim();
  const useCookie = (rqOptions?.useCookie ?? true) && cookie.length > 0;

  const fetchOptions: FetchOptions | undefined = useCookie
    ? options
      ? {
          ...options,
          headers: {
            Cookie: cookie,
            ...options.headers,
          },
        }
      : {
          method: 'GET',
          headers: {
            Cookie: cookie,
          },
        }
    : options;

  return fetch<T>(url, fetchOptions);
}
