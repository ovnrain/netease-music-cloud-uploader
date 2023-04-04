import { Outlet } from 'react-router-dom';
import useSetMemoryCookie from './hooks/useSetMemoryCookie';
import UserInfoProvider from './providers/UserInfoProvider';

export interface RootProps {}

const Root = (props: RootProps) => {
  const userCookie = useSetMemoryCookie();

  if (typeof userCookie === 'undefined') {
    return null;
  }

  return (
    <UserInfoProvider>
      <Outlet />
    </UserInfoProvider>
  );
};

export default Root;
