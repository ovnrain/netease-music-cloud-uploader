import { fetch, type FetchOptions, ResponseType } from '@tauri-apps/api/http';
import { getMemoryCookie, getUserCookie } from './utils/cookie';

export interface RqOptions {
  useCookie?: boolean;
}

export interface RqResult<T> {
  code?: number;
  message?: string;
  cookies?: string[];
  result: T;
}

const defaultOptions: FetchOptions = {
  method: 'POST',
  responseType: ResponseType.JSON,
};

export default async function rq<T>(
  url: string,
  options?: Partial<FetchOptions>,
  rqOptions?: RqOptions,
): Promise<RqResult<T>> {
  const cookie = (getMemoryCookie() || (await getUserCookie())).trim();
  const useCookie = (rqOptions?.useCookie ?? true) && cookie.length > 0;

  const fetchOptions: FetchOptions | undefined = useCookie
    ? options
      ? {
          ...defaultOptions,
          ...options,
          headers: {
            Cookie: cookie,
            ...options.headers,
          },
        }
      : {
          ...defaultOptions,
          headers: {
            Cookie: cookie,
          },
        }
    : options
    ? { ...defaultOptions, ...options }
    : defaultOptions;

  const res = await fetch<T>(url, fetchOptions);
  const { code, msg, message, ...rest } = res.data as {
    code?: number;
    msg?: string | number;
    message?: string;
  } & T;

  return {
    code: code,
    message: message || msg?.toString(),
    cookies: res.rawHeaders['set-cookie'],
    result: rest as T,
  };
}
