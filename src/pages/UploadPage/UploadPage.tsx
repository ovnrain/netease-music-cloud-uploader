import styles from './UploadPage.module.scss';
import { Fragment, useRef, useState } from 'react';
import { parseBuffer } from 'music-metadata-browser';
import { Buffer } from 'buffer';
import uniqBy from 'lodash.uniqby';
import MD5 from 'spark-md5';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import bytes from 'bytes';
import toast from 'react-hot-toast';
import type { UploadFile } from '../../models';
import APIS from '../../apis';
import Button from '../../components/Button';
import clsx from 'clsx';
import Table from '../../components/Table';
import IconFont from '../../components/IconFont';
import ConfirmModal from '../../components/ConfirmModal';
import EditFileModal from '../../components/EditFileModal';

export interface UploadPageProps {}

const audioTypes = ['mp3', 'flac', 'ape', 'wma', 'wav', 'ogg', 'aac', 'm4a'];

const MAX_SELECT_FILES = 30;

const UploadPage = (props: UploadPageProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [inputKey, setInputKey] = useState(uuidv4());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 校验合规的，待上传的文件
  const pendingUploadFiles = uploadFiles.filter((file) => file.status === 'pending');
  // 包含有错的文件
  const unfinishedUploadFiles = uploadFiles.filter((file) => file.status !== 'uploaded');

  const isSelectFilesDisabled = isUploading || pendingUploadFiles.length >= MAX_SELECT_FILES;

  const upload = useMutation({
    mutationFn: async (uploadFile: UploadFile) => {
      if (!uploadFile.metadata) {
        throw new Error('音乐信息缺失');
      }

      const check = await APIS.uploadCheck(uploadFile);
      const token = await APIS.getUploadToken(uploadFile);

      if (check.result.needUpload) {
        await APIS.uploadFile({
          file: uploadFile.file,
          md5: uploadFile.md5,
          objectKey: token.result.result.objectKey,
          token: token.result.result.token,
        });
      }

      const cloudInfo = await APIS.getUploadCloudInfo({
        album: uploadFile.metadata.album || '未知专辑',
        artist: uploadFile.metadata.artist || '未知艺术家',
        filename: uploadFile.file.name,
        md5: uploadFile.md5,
        resourceId: `${token.result.result.resourceId}`,
        song: uploadFile.metadata.title || uploadFile.file.name,
        songid: check.result.songId,
      });
      return await APIS.pubCloud({ songid: cloudInfo.result.songId });
    },
    mutationKey: ['upload'],
  });

  async function handleFiles(fileslist: File[]) {
    setInputKey(uuidv4());

    if (!fileslist.length) {
      return;
    }

    let validFiles = fileslist.filter((file) => {
      const ext = file.name.split('.').pop();
      return file.type.startsWith('audio/') && ext && audioTypes.includes(ext);
    });

    if (fileslist.length !== validFiles.length) {
      toast(`已过滤 ${fileslist.length - validFiles.length} 个不符合格式的文件`, {
        duration: 1800,
        icon: <IconFont className={styles.warn} type="ne-warn" />,
      });
    }

    if (!validFiles.length) {
      return;
    }

    if (pendingUploadFiles.length + validFiles.length > MAX_SELECT_FILES) {
      toast(`最多同时上传 ${MAX_SELECT_FILES} 个文件`, {
        duration: 1800,
        icon: <IconFont className={styles.warn} type="ne-warn" />,
      });
      validFiles = validFiles.slice(0, MAX_SELECT_FILES - pendingUploadFiles.length);
    }

    const uploadFiles: UploadFile[] = [];

    for (let index = 0; index < validFiles.length; index++) {
      const file = validFiles[index];
      const buffer = await file.arrayBuffer();
      const md5 = MD5.ArrayBuffer.hash(buffer);
      const ext = (file.name.split('.').pop() as string).toUpperCase();

      try {
        const metadata = (await parseBuffer(Buffer.from(buffer))).common;

        uploadFiles.push({
          file,
          md5,
          metadata,
          ext,
          status: 'pending',
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error('未知错误');

        uploadFiles.push({
          error,
          file,
          md5,
          ext,
          status: 'error',
        });
      }
    }

    setUploadFiles((prevFiles) => uniqBy([...prevFiles, ...uploadFiles], 'md5'));
  }

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrops = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(Array.from(e.dataTransfer.files));
  };

  const onSelectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(Array.from(e.target.files || []));
  };

  return (
    <div className={styles.container}>
      {unfinishedUploadFiles.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table
            dataSource={unfinishedUploadFiles}
            columns={[
              {
                title: '',
                dataIndex: 'index',
                width: 40,
                render: ({ index }) => (index + 1 < 10 ? `0${index + 1}` : index + 1),
              },
              {
                title: '音乐标题',
                dataIndex: 'title',
                render: ({ record }) => record.metadata?.title || record.file.name,
              },
              {
                title: '歌手',
                dataIndex: 'artist',
                render: ({ record }) => record.metadata?.artist,
              },
              {
                title: '专辑',
                dataIndex: 'album',
                render: ({ record }) => record.metadata?.album,
              },
              {
                title: '格式',
                dataIndex: 'ext',
              },
              {
                title: '大小',
                dataIndex: 'size',
                render: ({ record }) =>
                  bytes.format(record.file.size, {
                    decimalPlaces: 1,
                    fixedDecimals: true,
                    unit: 'MB',
                  }),
              },
              {
                title: '状态',
                dataIndex: 'status',
                render: ({ record }) => {
                  if (record.status === 'error' || record.error) {
                    return (
                      <span className={styles.error}>{record.error?.message || '未知错误'}</span>
                    );
                  }
                  if (record.status === 'pending') {
                    return '等待上传';
                  }
                  if (record.status === 'uploading') {
                    return '上传中...';
                  }
                  if (record.status === 'uploaded') {
                    return <span className={styles.success}>上传成功</span>;
                  }
                  return '未知状态';
                },
              },
              {
                title: '操作',
                dataIndex: 'action',
                width: 80,
                render: ({ record }) => {
                  const songName = record.metadata?.title || record.file.name;
                  return (
                    <Fragment>
                      <EditFileModal
                        songName={songName}
                        defaultValue={{
                          title: songName,
                          artist: record.metadata?.artist,
                          album: record.metadata?.album,
                        }}
                        onSubmit={(data) => {
                          setUploadFiles(
                            produce((draft) => {
                              const target = draft.find((file) => file.md5 === record.md5);
                              if (target?.metadata) {
                                target.metadata.title = data.title;
                                target.metadata.artist = data.artist;
                                target.metadata.album = data.album;
                              }
                            }),
                          );
                        }}
                      >
                        <IconFont
                          className={styles.edit}
                          type="ne-edit"
                          title="编辑信息"
                          disabled={isUploading || record.status !== 'pending'}
                        />
                      </EditFileModal>
                      <ConfirmModal
                        title="删除确认"
                        content={`确定要删除歌曲 《${songName}》 吗？`}
                        contentClassName={styles.deleteContent}
                        onConfirm={() => {
                          setUploadFiles(
                            produce((draft) => {
                              const index = draft.findIndex((file) => file.md5 === record.md5);
                              if (index !== -1) {
                                draft.splice(index, 1);
                              }
                            }),
                          );
                        }}
                        placement="left"
                      >
                        <IconFont
                          className={styles.delete}
                          type="ne-delete"
                          title="从列表移除"
                          disabled={isUploading}
                        />
                      </ConfirmModal>
                    </Fragment>
                  );
                },
              },
            ]}
            rowKey="md5"
          />
        </div>
      )}
      <div
        className={clsx(styles.selectWrapper, {
          // 有待上传的文件，那么 flex 就不要设置为 1 了
          [styles.hasSongs]: unfinishedUploadFiles.length > 0,
          // 有待上传的文件，但是没有合规的文件，此时上传按钮会被隐藏，那么这里得加点 margin
          [styles.onlyError]: unfinishedUploadFiles.length > 0 && pendingUploadFiles.length === 0,
          [styles.disabled]: isSelectFilesDisabled,
        })}
        onDragEnter={!isSelectFilesDisabled ? handleDragEnter : undefined}
      >
        <div
          className={clsx(styles.dropMask, {
            [styles.isDragging]: isDragging,
          })}
          onDragLeave={handleDragLeave}
          onDrop={!isSelectFilesDisabled ? handleDrops : undefined}
        />
        <input
          key={inputKey}
          type="file"
          accept={audioTypes.map((t) => `.${t}`).join(',')}
          onChange={onSelectChange}
          ref={fileInputRef}
          multiple
          hidden
        />
        <IconFont
          className={clsx(styles.uploadIcon, { [styles.disabled]: isSelectFilesDisabled })}
          type="ne-cloud-upload"
        />
        <div>
          <span>将文件拖拽到此处，或</span>
          <span
            className={clsx(styles.selectLink, {
              [styles.disabled]: isSelectFilesDisabled,
            })}
            onClick={() => {
              if (!isSelectFilesDisabled) {
                fileInputRef.current?.click();
              }
            }}
          >
            选择文件
          </span>
        </div>
      </div>
      {pendingUploadFiles.length > 0 && (
        <div className={styles.uploadWrapper}>
          <Button
            className={styles.uploadButton}
            onClick={async () => {
              setIsUploading(true);

              for (let index = 0; index < pendingUploadFiles.length; index++) {
                const file = pendingUploadFiles[index];
                setUploadFiles(
                  produce((draft) => {
                    const target = draft.find((f) => f.md5 === file.md5);
                    if (target) {
                      target.status = 'uploading';
                    }
                  }),
                );
                try {
                  await upload.mutateAsync(file, {
                    onError: (error) => {
                      setUploadFiles(
                        produce((draft) => {
                          const target = draft.find((f) => f.md5 === file.md5);
                          if (target) {
                            target.status = 'error';
                            target.error = error instanceof Error ? error : new Error('未知错误');
                          }
                        }),
                      );
                    },
                    onSuccess: () => {
                      setUploadFiles(
                        produce((draft) => {
                          const target = draft.find((f) => f.md5 === file.md5);
                          if (target) {
                            target.status = 'uploaded';
                          }
                        }),
                      );
                    },
                  });
                } catch (e) {
                  //
                }
              }

              setIsUploading(false);
            }}
            icon="ne-upload"
            disabled={isUploading}
          >
            上传全部
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
