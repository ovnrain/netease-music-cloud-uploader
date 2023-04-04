import styles from './LoginPage.module.scss';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import Button from '../../components/Button';
import { replaceHttpWithHttps } from '../../components/utils/common';
import { setMemoryCookie, setUserCookie } from '../../components/utils/cookie';

export interface LoginPageProps {}

const LoginPage = (props: LoginPageProps) => {
  const {
    isLoading,
    data: uniKey,
    refetch: refetchUnikey,
  } = useQuery({
    queryKey: ['unikey'],
    queryFn: APIS.getUniKey,
    refetchOnWindowFocus: false,
  });
  const { data: qrImg } = useQuery({
    queryKey: ['qrimg', uniKey],
    queryFn: () =>
      QRCode.toDataURL(`https://music.163.com/login?codekey=${uniKey}`, {
        margin: 0,
        errorCorrectionLevel: 'L',
      }),
    enabled: !!uniKey,
    refetchOnWindowFocus: false,
  });
  const { data: loginResponse } = useQuery({
    queryKey: ['login', uniKey],
    queryFn: () => APIS.qrLogin(uniKey as string),
    refetchInterval: (res) => (res?.data.code === 800 || res?.data.code === 803 ? false : 1000),
    enabled: !!uniKey && !!qrImg,
    onSuccess: async (res) => {
      if (res.data.code === 803) {
        const cookie = res.rawHeaders['set-cookie']
          .map((c) => c.replace(/\s*Domain=[^(;|$)]+;*/, ''))
          .join(';');
        setMemoryCookie(cookie);
        await setUserCookie(cookie);
      }
    },
    refetchOnWindowFocus: false,
  });

  const loginStatus = loginResponse?.data;

  if (isLoading) {
    return <PageLoading />;
  }

  if (loginStatus?.code === 803) {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>扫码登录</div>
      {(!loginStatus || loginStatus.code !== 802) && !!qrImg && (
        <Fragment>
          <div className={styles.qrcode}>
            <img className={styles.qrimg} src={qrImg} alt="二维码" />
            {loginStatus?.code === 800 && (
              <div className={styles.reload}>
                <div className={styles.reloadText}>二维码已失效</div>
                <Button className={styles.reloadButton} onClick={() => refetchUnikey()}>
                  点击刷新
                </Button>
              </div>
            )}
          </div>
          <div className={styles.desc}>
            使用{' '}
            <a href="https://music.163.com/#/download" target="_blank" rel="noreferrer">
              网易云音乐APP
            </a>{' '}
            扫码登录
          </div>
        </Fragment>
      )}
      {loginStatus?.code === 802 && (
        <div className={styles.userInfo}>
          <img
            className={styles.avatar}
            src={replaceHttpWithHttps(loginStatus.avatarUrl)}
            alt={loginStatus.nickname}
          />
          <div className={styles.name}>{loginStatus.nickname}</div>
          <div className={styles.confirmTip}>请在 APP 上点击确认</div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
