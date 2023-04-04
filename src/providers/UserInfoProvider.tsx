import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import UserInfoContext from '../contexts/UserInfoContext';
import APIS from '../apis';
import PageLoading from '../components/PageLoading';

export interface UserInfoProviderProps {
  children?: ReactElement;
}

const UserInfoProvider = (props: UserInfoProviderProps) => {
  const { children } = props;

  const { isLoading, data: userInfo } = useQuery({
    queryKey: ['userInfo'],
    queryFn: APIS.getUserInfo,
  });

  if (isLoading) {
    return <PageLoading />;
  }

  if (!userInfo?.account || !userInfo?.profile) {
    return <Navigate to="/login" />;
  }

  return <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>;
};

export default UserInfoProvider;
