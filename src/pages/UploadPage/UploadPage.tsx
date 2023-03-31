// import styles from './UploadPage.module.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseBuffer } from 'music-metadata-browser';
import { Buffer } from 'buffer';
import uniqWith from 'lodash.uniqwith';
import type { UploadFile } from '../../models';

export interface UploadPageProps {}

const audioTypes = ['mp3', 'flac', 'ape', 'wma', 'wav', 'ogg', 'aac'];

const UploadPage = (props: UploadPageProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

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

      try {
        const buffer = await file.arrayBuffer();
        const metadata = (await parseBuffer(Buffer.from(buffer))).common;

        uploadFiles.push({
          file,
          metadata,
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error('未知错误');

        uploadFiles.push({
          error,
          file,
        });
      }
    }

    setUploadFiles((prevFiles) =>
      uniqWith(
        [...prevFiles, ...uploadFiles],
        (f1, f2) =>
          f1.file.name === f2.file.name &&
          f1.metadata?.artist === f2.metadata?.artist &&
          f1.metadata?.album === f2.metadata?.album
      )
    );
  };

  return (
    <div>
      <div>
        <input
          type="file"
          accept={audioTypes.map((t) => `.${t}`).join(',')}
          onChange={onSelectChange}
          multiple
        />
      </div>
      <div>
        {uploadFiles.map(({ file, metadata, error }) => (
          <div key={`${file.name}-${metadata?.artist}-${metadata?.album}`}>
            {file.name} - {metadata?.artist} - {metadata?.album} - {error?.message}
          </div>
        ))}
      </div>
      <div>
        <Link to="/">返回列表</Link>
      </div>
    </div>
  );
};

export default UploadPage;
