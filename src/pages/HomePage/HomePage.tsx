import styles from './HomePage.module.scss';
import { useQuery } from '@tanstack/react-query';
import format from 'date-fns/format';
import bytes from 'bytes';
import { confirm } from '@tauri-apps/api/dialog';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import Table from '../../components/Table';
import { Fragment } from 'react';
import IconFont from '../../components/IconFont';

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
      <Table
        dataSource={cloudList.data}
        columns={[
          {
            title: '',
            dataIndex: 'index',
            width: 40,
            render: (_, record) => {
              const index = cloudList.data.findIndex((item) => item.songId === record.songId) + 1;
              return index < 10 ? `0${index}` : index;
            },
          },
          {
            title: '音乐标题',
            dataIndex: 'songName',
          },
          {
            title: '歌手',
            dataIndex: 'artist',
          },
          {
            title: '专辑',
            dataIndex: 'album',
          },
          {
            title: '大小',
            dataIndex: 'fileSize',
            width: 100,
            render: (_, record) =>
              bytes.format(record.fileSize, { decimalPlaces: 1, fixedDecimals: true, unit: 'MB' }),
          },
          {
            title: '上传时间',
            dataIndex: 'addTime',
            width: 120,
            render: (_, record) => (
              <span title={format(record.addTime, 'yyyy-MM-dd HH:mm:ss')}>
                {format(record.addTime, 'yyyy-MM-dd')}
              </span>
            ),
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 80,
            render: (_, record) => {
              return (
                <Fragment>
                  <IconFont className={styles.edit} type="ne-edit" title="修正信息" />
                  <IconFont
                    className={styles.delete}
                    type="ne-delete"
                    title="删除"
                    onClick={async () => {
                      const confirmed = await confirm(
                        `确定要删除歌曲 《${record.songName}》 吗？`,
                        {
                          title: '删除确认',
                          type: 'warning',
                        }
                      );
                      if (confirmed) {
                        //
                      }
                    }}
                  />
                </Fragment>
              );
            },
          },
        ]}
        rowKey="songId"
      />
    </div>
  );
};

export default HomePage;
