import styles from './HomePage.module.scss';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import format from 'date-fns/format';
import bytes from 'bytes';
import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/shell';
import APIS from '../../apis';
import PageLoading from '../../components/PageLoading';
import Table from '../../components/Table';
import { Fragment, type ReactNode } from 'react';
import IconFont from '../../components/IconFont';
import ConfirmModal from '../../components/ConfirmModal';
import MatchSongModal from '../../components/MatchSongModal';
import useUserInfo from '../../hooks/useUserInfo';
import { replaceHttpWithHttps } from '../../utils/common';
import type { CloudSong } from '../../models';
import Trigger from '../../components/Trigger';

export interface HomePageProps {}

const HomePage = (props: HomePageProps) => {
  const queryClient = useQueryClient();
  const userInfo = useUserInfo();

  const {
    data: cloudData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['cloudList'],
    queryFn: ({ pageParam = 1 }) => APIS.getCloudData(pageParam),
    getNextPageParam: (lastPage) => lastPage.result.nextPage,
  });
  const deleteCloud = useMutation({
    mutationFn: APIS.deleteCloud,
    onSettled: () => {
      queryClient.invalidateQueries(['cloudList']);
    },
  });
  const matchSong = useMutation({
    mutationFn: APIS.matchSong,
    onSettled: () => {
      queryClient.invalidateQueries(['cloudList']);
    },
  });

  const isLoading = status === 'loading';
  const cloudSongs =
    cloudData?.pages?.reduce<CloudSong[]>((prev, curr) => {
      return [...prev, ...curr.result.data];
    }, []) ?? [];

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (!isFetchingNextPage && scrollHeight - scrollTop - clientHeight < 200) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <PageLoading mode="page" />;
  }

  if (!cloudSongs.length) {
    return <div className={styles.empty}>暂无歌曲</div>;
  }

  return (
    <div className={styles.container} onScroll={hasNextPage ? onScroll : undefined}>
      <Table
        dataSource={cloudSongs}
        columns={[
          {
            title: '',
            dataIndex: 'index',
            width: 40,
            render: ({ index }) => (index + 1 < 10 ? `0${index + 1}` : index + 1),
          },
          {
            title: '音乐标题',
            dataIndex: 'songName',
            render: ({ record }) => (
              <span
                className={styles.link}
                onClick={async () => {
                  await open(`https://music.163.com/#/song?id=${record.songId}`);
                }}
              >
                {record.simpleSong.name || record.songName}
              </span>
            ),
          },
          {
            title: '歌手',
            dataIndex: 'artist',
            render: ({ record }) => {
              if (!record.simpleSong.ar?.some(({ name }) => !!name)) {
                return record.artist;
              }
              return record.simpleSong.ar
                .filter(({ name }) => !!name)
                .map<ReactNode>(({ id, name }) =>
                  id === 0 ? (
                    name
                  ) : (
                    <span
                      key={id}
                      className={styles.link}
                      onClick={async () => {
                        await open(`https://music.163.com/#/artist?id=${id}`);
                      }}
                    >
                      {name}
                    </span>
                  ),
                )
                .reduce((prev, curr) => [prev, ' / ', curr]);
            },
          },
          {
            title: '专辑',
            dataIndex: 'album',
            render: ({ record }) => {
              const picUrl = replaceHttpWithHttps(record.simpleSong.al?.picUrl);
              let albumNode: ReactNode;

              if (!record.simpleSong.al?.name || record.simpleSong.al.id === 0) {
                albumNode = record.album;
              } else {
                albumNode = (
                  <span
                    className={styles.link}
                    onClick={async () => {
                      await open(`https://music.163.com/#/album?id=${record.simpleSong.al?.id}`);
                    }}
                  >
                    {record.simpleSong.al.name}
                  </span>
                );
              }

              return (
                <div className={styles.album}>
                  <Trigger
                    trigger="hover"
                    popup={
                      <img
                        className={styles.bigAlbumImg}
                        src={picUrl}
                        alt={record.simpleSong.al?.name || record.album}
                      />
                    }
                    placement="bottom"
                    delay={0}
                    offset={4}
                  >
                    <img
                      className={styles.albumImg}
                      src={picUrl}
                      alt={record.simpleSong.al?.name || record.album}
                    />
                  </Trigger>
                  {albumNode}
                </div>
              );
            },
          },
          {
            title: '大小',
            dataIndex: 'fileSize',
            width: 100,
            render: ({ record }) =>
              bytes.format(record.fileSize, { decimalPlaces: 1, fixedDecimals: true, unit: 'MB' }),
          },
          {
            title: '上传时间',
            dataIndex: 'addTime',
            width: 120,
            render: ({ record }) => (
              <span title={format(record.addTime, 'yyyy-MM-dd HH:mm:ss')}>
                {format(record.addTime, 'yyyy-MM-dd')}
              </span>
            ),
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 80,
            render: ({ record }) => {
              const songName = record.simpleSong.name || record.songName;
              return (
                <Fragment>
                  <MatchSongModal
                    songName={songName}
                    onSubmit={(songId) => {
                      toast.promise(
                        matchSong.mutateAsync({
                          songId: record.songId,
                          adjustSongId: songId,
                          userId: userInfo.account.id,
                        }),
                        {
                          loading: '修改中...',
                          success: '修改成功',
                          error: (err) => (err instanceof Error ? err.message : '修改失败'),
                        },
                        {
                          id: `match-cloud-${record.songId}`,
                        },
                      );
                    }}
                  >
                    <IconFont className={styles.edit} type="ne-edit" title="修正信息" />
                  </MatchSongModal>
                  <ConfirmModal
                    title="删除确认"
                    content={`确定要从网盘删除歌曲 《${songName}》 吗？`}
                    contentClassName={styles.deleteContent}
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
                        },
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
      <div className={styles.status}>
        {isFetchingNextPage ? '加载中...' : hasNextPage ? '' : '已加载全部歌曲'}
      </div>
    </div>
  );
};

export default HomePage;
