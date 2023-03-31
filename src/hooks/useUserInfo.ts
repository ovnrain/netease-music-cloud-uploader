import { useContext } from 'react';
import UserInfoContext from '../contexts/UserInfoContext';

export default function useUserInfo() {
  return useContext(UserInfoContext);
}
