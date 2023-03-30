import styles from './LoginPage.module.scss';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';

export interface LoginPageProps {}

const LoginPage = (props: LoginPageProps) => {
  const { isLoading, data: uniKey } = useQuery({
    queryKey: ['unikey'],
    queryFn: APIS.getUniKey,
    refetchOnWindowFocus: false,
  });
  const [qrImg, setQrImg] = useState('');

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
      {!!qrImg && <img src={qrImg} alt="二维码" />}
    </div>
  );
};

export default LoginPage;
