import styles from './App.module.scss';
import { Outlet } from 'react-router-dom';
import useUserInfo from './hooks/useUserInfo';

function App() {
  const userInfo = useUserInfo();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img className={styles.avatar} src={userInfo?.profile?.avatarUrl} alt="avatar" />
          <div className={styles.nickname}>{userInfo?.profile?.nickname}</div>
        </div>
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
