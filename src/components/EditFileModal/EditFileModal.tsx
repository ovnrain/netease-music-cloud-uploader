import { useState, useRef, type ReactElement } from 'react';
import ConfirmModal from '../ConfirmModal';
import Input from '../Input';
import styles from './EditFileModal.module.scss';

export interface SimpleMetaInfo {
  title: string;
  artist: string;
  album: string;
}

export interface EditFileModalProps {
  children: ReactElement;
  songName: string;
  defaultValue?: Partial<SimpleMetaInfo>;
  onSubmit?: (data: SimpleMetaInfo) => void;
}

const EditFileModal = (props: EditFileModalProps) => {
  const { children, songName, defaultValue, onSubmit } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState(defaultValue?.title ?? '');
  const [artist, setArtist] = useState(defaultValue?.artist ?? '');
  const [album, setAlbum] = useState(defaultValue?.album ?? '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  return (
    <ConfirmModal
      title={`编辑《${songName}》 `}
      content={
        <div className={styles.form}>
          <div className={styles.item}>
            <label className={styles.label}>音乐标题：</label>
            <Input
              className={styles.input}
              placeholder="音乐标题"
              ref={titleInputRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className={styles.item}>
            <label className={styles.label}>歌手：</label>
            <Input
              className={styles.input}
              placeholder="歌手"
              value={artist}
              onChange={(e) => {
                setArtist(e.target.value);
              }}
            />
          </div>
          <div className={styles.item}>
            <label className={styles.label}>专辑：</label>
            <Input
              className={styles.input}
              placeholder="专辑"
              value={album}
              onChange={(e) => {
                setAlbum(e.target.value);
              }}
            />
          </div>
        </div>
      }
      placement="left"
      open={modalOpen}
      onOpenChange={(open) => {
        setModalOpen(open);
        if (open) {
          setTimeout(() => {
            titleInputRef.current?.focus();
          }, 0);
        }
      }}
      onConfirm={async () => {
        onSubmit?.({ title: title.trim(), artist: artist.trim(), album: album.trim() });
      }}
    >
      {children}
    </ConfirmModal>
  );
};

export default EditFileModal;
