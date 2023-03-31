import { fetch, FetchOptions } from '@tauri-apps/api/http';

export default function rq<T>(url: string, options?: FetchOptions, useCookie = true) {
  const cookie = import.meta.env.VITE_API_COOKIE;

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
