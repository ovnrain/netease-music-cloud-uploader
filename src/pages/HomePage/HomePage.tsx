import styles from './HomePage.module.scss';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import format from 'date-fns/format';
import bytes from 'bytes';
import toast from 'react-hot-toast';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import Table from '../../components/Table';
import { Fragment } from 'react';
import IconFont from '../../components/IconFont';
import ConfirmModal from '../../components/ConfirmModal';

export interface HomePageProps {}

const HomePage = (props: HomePageProps) => {
  const queryClient = useQueryClient();
  const { isLoading, data: cloudList } = useQuery({
    queryKey: ['cloudList'],
    queryFn: APIS.getCloudList,
  });
  const deleteCloud = useMutation({
    mutationFn: APIS.deleteCloud,
    onSettled: () => {
      queryClient.invalidateQueries(['cloudList']);
    },
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
                  <ConfirmModal
                    title="删除确认"
                    content={`确定要从网盘删除歌曲 《${record.songName}》 吗？`}
                    placement="left"
                    onConfirm={() => {
                      toast.promise(
                        deleteCloud.mutateAsync({ songIds: [record.songId] }),
                        {
                          loading: '正在删除...',
                          success: '删除成功',
                          error: (err) => (err instanceof Error ? err.message : '删除失败'),
                        },
                        {
                          id: `delete-cloud-${record.songId}`,
                        }
                      );
                    }}
                  >
                    <IconFont className={styles.delete} type="ne-delete" title="删除" />
                  </ConfirmModal>
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
