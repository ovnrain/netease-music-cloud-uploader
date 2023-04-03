import styles from './MatchSongModal.module.scss';
import { ReactElement, useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import Input from '../Input';

export interface MatchSongModalProps {
  children: ReactElement;
  songName: string;
  onSubmit?: (id: number) => void;
}

const MatchSongModal = (props: MatchSongModalProps) => {
  const { children, songName, onSubmit } = props;

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchValue, setMatchValue] = useState('');
  const [matchError, setMatchError] = useState('');
  const matchInputRef = useRef<HTMLInputElement>(null);

  return (
    <ConfirmModal
      title={`修正《${songName}》 `}
      content={
        <div>
          <div>请输入歌曲ID 或者链接：</div>
          <Input
            className={styles.input}
            placeholder="ID 或链接"
            ref={matchInputRef}
            value={matchValue}
            onChange={(e) => {
              setMatchValue(e.target.value);
            }}
          />
          {!!matchError && <div className={styles.error}>{matchError}</div>}
          <div className={styles.matchTip}>
            如: 108281 或 https://music.163.com/#/song?id=108281
          </div>
        </div>
      }
      placement="left"
      open={matchModalOpen}
      onOpenChange={(open) => {
        setMatchModalOpen(open);
        if (!open) {
          setMatchValue('');
          setMatchError('');
        } else {
          setTimeout(() => {
            matchInputRef.current?.focus();
          }, 0);
        }
      }}
      onConfirm={async () => {
        const linkReg = /^https:\/\/music\.163\.com\/#\/song\?id=(\d+)$/;
        const value = matchValue.trim();

        if (!value) {
          return false;
        }

        if (/^http/.test(value) && !linkReg.test(value)) {
          setMatchError('链接格式不正确');
          return false;
        }

        if (!/^\d+$/.test(value)) {
          setMatchError('ID格式不正确');
          return false;
        }

        setMatchError('');

        const m = value.match(linkReg);
        const id = m ? m[1] : value;

        onSubmit?.(Number(id));
      }}
    >
      {children}
    </ConfirmModal>
  );
};

export default MatchSongModal;
