import styles from './UploadPage.module.scss';
import { Fragment, useRef, useState } from 'react';
import { parseBuffer } from 'music-metadata-browser';
import { Buffer } from 'buffer';
import uniqBy from 'lodash.uniqby';
import MD5 from 'spark-md5';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import bytes from 'bytes';
import type { UploadFile } from '../../models';
import APIS from '../../apis';
import Button from '../../components/Button';
import clsx from 'clsx';
import Table from '../../components/Table';
import IconFont from '../../components/IconFont';
import ConfirmModal from '../../components/ConfirmModal';

export interface UploadPageProps {}

const audioTypes = ['mp3', 'flac', 'ape', 'wma', 'wav', 'ogg', 'aac'];

const UploadPage = (props: UploadPageProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [inputKey, setInputKey] = useState(uuidv4());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pendingUploadFiles = uploadFiles.filter((file) => file.status === 'pending');

  const upload = useMutation({
    mutationFn: async (uploadFile: UploadFile) => {
      if (!uploadFile.metadata) {
        throw new Error('音乐信息缺失');
      }

      const check = await APIS.uploadCheck(uploadFile);

      if (check.needUpload) {
        throw new Error('需要上传');
      }

      const token = await APIS.getUploadToken(uploadFile);
      const cloudInfo = await APIS.getUploadCloudInfo({
        album: uploadFile.metadata.album,
        artist: uploadFile.metadata.artist,
        filename: uploadFile.file.name,
        md5: uploadFile.md5,
        resourceId: `${token.result.resourceId}`,
        song: uploadFile.metadata.title || uploadFile.file.name,
        songid: check.songId,
      });
      return await APIS.pubCloud({ songid: cloudInfo.songId });
    },
  });

  const onSelectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    const uploadFiles: UploadFile[] = [];

    if (!files) {
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      const ext = file.name.split('.').pop();
      return file.type.startsWith('audio/') && ext && audioTypes.includes(ext);
    });

    if (!validFiles.length) {
      return;
    }

    for (let index = 0; index < validFiles.length; index++) {
      const file = validFiles[index];
      const md5 = MD5.ArrayBuffer.hash(await file.arrayBuffer());
      const ext = (file.name.split('.').pop() as string).toUpperCase();

      try {
        const buffer = await file.arrayBuffer();
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
    setInputKey(uuidv4());
  };

  return (
    <div className={styles.container}>
      {uploadFiles.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table
            dataSource={uploadFiles}
            columns={[
              {
                title: '',
                dataIndex: 'index',
                width: 40,
                render: (_, record) => {
                  const index = uploadFiles.findIndex((item) => item.md5 === record.md5) + 1;
                  return index < 10 ? `0${index}` : index;
                },
              },
              {
                title: '音乐标题',
                dataIndex: 'title',
                render: (_, record) => record.metadata?.title || record.file.name,
              },
              {
                title: '歌手',
                dataIndex: 'artist',
                render: (_, record) => record.metadata?.artist,
              },
              {
                title: '专辑',
                dataIndex: 'album',
                render: (_, record) => record.metadata?.album,
              },
              {
                title: '格式',
                dataIndex: 'ext',
              },
              {
                title: '大小',
                dataIndex: 'size',
                render: (_, record) =>
                  bytes.format(record.file.size, {
                    decimalPlaces: 1,
                    fixedDecimals: true,
                    unit: 'MB',
                  }),
              },
              {
                title: '状态',
                dataIndex: 'status',
                render: (_, record) => {
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
                render: (_, record) => {
                  const songName = record.metadata?.title || record.file.name;
                  return (
                    <Fragment>
                      <IconFont className={styles.edit} type="ne-edit" title="修正信息" />
                      <ConfirmModal
                        title="删除确认"
                        content={`确定要删除歌曲 《${songName}》 吗？`}
                        onConfirm={() => {
                          setUploadFiles(
                            produce((draft) => {
                              const index = draft.findIndex((file) => file.md5 === record.md5);
                              if (index !== -1) {
                                draft.splice(index, 1);
                              }
                            })
                          );
                        }}
                        placement="left"
                      >
                        <IconFont className={styles.delete} type="ne-delete" title="从列表移除" />
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
      <div className={clsx(styles.selectWrapper, { [styles.hasSongs]: uploadFiles.length > 0 })}>
        <input
          key={inputKey}
          type="file"
          accept={audioTypes.map((t) => `.${t}`).join(',')}
          onChange={onSelectChange}
          ref={fileInputRef}
          multiple
          hidden
        />
        <Button
          className={styles.selectButton}
          onClick={() => {
            fileInputRef.current?.click();
          }}
          icon="ne-add"
        >
          {uploadFiles.length > 0 ? '继续添加' : '选择音乐文件'}
        </Button>
        {uploadFiles.length > 0 && (
          <Button
            onClick={async () => {
              if (!pendingUploadFiles.length) {
                return;
              }

              setIsUploading(true);

              for (let index = 0; index < pendingUploadFiles.length; index++) {
                const file = pendingUploadFiles[index];
                setUploadFiles(
                  produce((draft) => {
                    const target = draft.find((f) => f.md5 === file.md5);
                    if (target) {
                      target.status = 'uploading';
                    }
                  })
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
                        })
                      );
                    },
                    onSuccess: () => {
                      setUploadFiles(
                        produce((draft) => {
                          const target = draft.find((f) => f.md5 === file.md5);
                          if (target) {
                            target.status = 'uploaded';
                          }
                        })
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
            disabled={isUploading || pendingUploadFiles.length === 0}
          >
            上传全部
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
