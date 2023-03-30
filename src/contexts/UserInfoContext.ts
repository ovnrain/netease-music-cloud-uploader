import { createContext } from 'react';
import type { UserInfo } from '../models';

const UserInfoContext = createContext<UserInfo>({} as UserInfo);

export default UserInfoContext;
