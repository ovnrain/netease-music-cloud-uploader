import styles from './App.module.scss';
import { Outlet, Route, Routes } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useUserInfo from './hooks/useUserInfo';
import Button from './components/Button';
import { replaceHttpWithHttps } from './utils/common';
import AppMenu from './components/AppMenu';
import { setMemoryCookie, setUserCookie } from './utils/cookie';

function App() {
  const queryClient = useQueryClient();
  const userInfo = useUserInfo();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Routes>
          <Route
            path="/"
            element={
              <Button icon="ne-upload" to="/upload">
                上传
              </Button>
            }
          />
          <Route path="/upload" element={<Button icon="ne-back" to="/" />} />
        </Routes>
        <div className={styles.userInfo}>
          <div className={styles.nickname}>{userInfo.profile.nickname}</div>
          <AppMenu
            onClick={async (key) => {
              if (key === 'logout') {
                await setUserCookie('');
                setMemoryCookie('');
                queryClient.invalidateQueries(['userInfo']);
              }
            }}
          >
            <img
              className={styles.avatar}
              src={replaceHttpWithHttps(userInfo.profile.avatarUrl)}
              alt="avatar"
            />
          </AppMenu>
        </div>
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
