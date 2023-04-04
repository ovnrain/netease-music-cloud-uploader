import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getMemoryCookie, getUserCookie, setMemoryCookie } from '../utils/cookie';

export default function useSetMemoryCookie() {
  const { data: userCookie } = useQuery({
    queryKey: ['userCookie'],
    queryFn: getUserCookie,
    cacheTime: 0,
  });

  useEffect(() => {
    if (userCookie && !getMemoryCookie()) {
      setMemoryCookie(userCookie);
    }
  }, [userCookie]);

  return userCookie;
}
