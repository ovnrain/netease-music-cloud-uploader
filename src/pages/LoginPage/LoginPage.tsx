import styles from './LoginPage.module.scss';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Fragment, useEffect, useState } from 'react';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import { replaceHttpWithHttps } from '../../utils';
import Button from '../../components/Button';

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
  const [qrImg, setQrImg] = useState('');
  const { data: loginStatus } = useQuery({
    queryKey: ['loginstatus', uniKey],
    queryFn: () => APIS.qrLogin(uniKey as string),
    refetchInterval: (data) => (data?.code === 800 ? false : 1000),
    enabled: !!uniKey && !!qrImg,
  });

  useEffect(() => {
    async function getQrImg() {
      if (!uniKey) {
        setQrImg('');
        return;
      }

      const qrImgUrl = `https://music.163.com/login?codekey=${uniKey}`;
      const qrImg = await QRCode.toDataURL(qrImgUrl, { margin: 0, errorCorrectionLevel: 'L' });
      setQrImg(qrImg);
    }

    getQrImg();
  }, [uniKey]);

  if (isLoading) {
    return <PageLoading />;
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
