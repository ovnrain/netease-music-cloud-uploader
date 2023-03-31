import { Outlet } from 'react-router-dom';
import UserInfoProvider from './providers/UserInfoProvider';

export interface RootProps {}

const Root = (props: RootProps) => {
  return (
    <UserInfoProvider>
      <Outlet />
    </UserInfoProvider>
  );
};

export default Root;
