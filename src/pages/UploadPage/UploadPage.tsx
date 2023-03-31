// import styles from './UploadPage.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseBuffer } from 'music-metadata-browser';
import { Buffer } from 'buffer';
import uniqBy from 'lodash.uniqby';
import MD5 from 'spark-md5';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { UploadFile } from '../../models';
import APIS from '../../apis';

export interface UploadPageProps {}

const audioTypes = ['mp3', 'flac', 'ape', 'wma', 'wav', 'ogg', 'aac'];

const UploadPage = (props: UploadPageProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [inputKey, setInputKey] = useState(uuidv4());

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
    /* onError: (error, uploadFile) => {
      console.log(error, uploadFile);
    },
    onSuccess: (data) => {
      console.log(data);
    }, */
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

      try {
        const buffer = await file.arrayBuffer();
        const metadata = (await parseBuffer(Buffer.from(buffer))).common;

        uploadFiles.push({
          file,
          md5,
          metadata,
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error('未知错误');

        uploadFiles.push({
          error,
          file,
          md5,
        });
      }
    }

    setUploadFiles((prevFiles) => uniqBy([...prevFiles, ...uploadFiles], 'md5'));
    setInputKey(uuidv4());
  };

  return (
    <div>
      <div>
        <input
          key={inputKey}
          type="file"
          accept={audioTypes.map((t) => `.${t}`).join(',')}
          onChange={onSelectChange}
          multiple
        />
      </div>
      <div>
        {uploadFiles.map(({ md5, file, metadata, error }) => (
          <div key={md5}>
            {file.name} - {metadata?.artist} - {metadata?.album} - {error?.message}
          </div>
        ))}
      </div>
      <div>
        <button
          onClick={() => {
            upload.mutate(uploadFiles[0]);
          }}
        >
          上传
        </button>
      </div>
      <div>
        <Link to="/">返回列表</Link>
      </div>
    </div>
  );
};

export default UploadPage;
