import styles from './HomePage.module.scss';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import CloudTable from '../../components/CloudTable';

export interface HomePageProps {}

const HomePage = (props: HomePageProps) => {
  const { isLoading, data: cloudList } = useQuery({
    queryKey: ['cloudList'],
    queryFn: APIS.getCloudList,
  });

  if (isLoading) {
    return <PageLoading mode="page" />;
  }

  if (!cloudList?.count) {
    return <div className={styles.empty}>暂无歌曲</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <Link to="/upload">上传</Link>
      </div>
      <div className={styles.list}>
        <CloudTable list={cloudList} />
      </div>
    </div>
  );
};

export default HomePage;
