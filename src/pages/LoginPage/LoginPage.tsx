import styles from './LoginPage.module.scss';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import Button from '../../components/Button';
import { replaceHttpWithHttps } from '../../utils/common';
import { setMemoryCookie, setUserCookie } from '../../utils/cookie';

export interface LoginPageProps {}

const LoginPage = (props: LoginPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    isLoading,
    data: uniKeyResponse,
    refetch: refetchUnikey,
  } = useQuery({
    queryKey: ['unikey'],
    queryFn: APIS.getUniKey,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  });
  const uniKey = uniKeyResponse?.result.unikey;
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
    refetchInterval: (res) => (res?.code === 800 || res?.code === 803 ? false : 1000),
    enabled: !!uniKey && !!qrImg,
    onSuccess: async (res) => {
      if (res.code === 803) {
        const cookie =
          res.cookies?.map((c) => c.replace(/\s*Domain=[^(;|$)]+;*/, '')).join(';') || '';
        setMemoryCookie(cookie);
        await setUserCookie(cookie);
        // 非常重要！！！
        queryClient.removeQueries(['userInfo']);
        queryClient.removeQueries(['cloudList']);
        navigate('/');
      }
    },
    refetchOnWindowFocus: false,
  });

  const loginStatus = loginResponse?.result;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>扫码登录</div>
      {(!loginStatus || loginResponse.code !== 802) && !!qrImg && (
        <Fragment>
          <div className={styles.qrcode}>
            <img className={styles.qrimg} src={qrImg} alt="二维码" />
            {loginResponse?.code === 800 && (
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
      {loginResponse?.code === 802 && (
        <div className={styles.userInfo}>
          <img
            className={styles.avatar}
            src={replaceHttpWithHttps(loginStatus?.avatarUrl)}
            alt={loginStatus?.nickname}
          />
          <div className={styles.name}>{loginStatus?.nickname}</div>
          <div className={styles.confirmTip}>请在 APP 上点击确认</div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
