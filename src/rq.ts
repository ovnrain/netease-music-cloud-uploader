import { fetch, FetchOptions } from '@tauri-apps/api/http';

export interface RqOptions {
  useCookie?: boolean;
}

export interface RqResult {
  code: number;
  message?: string | number;
  msg?: string;
}

export default function rq<T extends RqResult>(
  url: string,
  options?: FetchOptions,
  rqOptions?: RqOptions
) {
  const cookie = import.meta.env.VITE_API_COOKIE;
  const useCookie = rqOptions?.useCookie ?? true;

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
