import styles from './CloudTable.module.scss';
import format from 'date-fns/format';
import bytes from 'bytes';
import type { CloudList } from '../../models';

export interface CloudTableProps {
  list: CloudList;
}

const CloudTable = (props: CloudTableProps) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>音乐标题</th>
          <th>歌手</th>
          <th>专辑</th>
          <th>大小</th>
          <th>上传时间</th>
        </tr>
      </thead>
      <tbody>
        {props.list.data.map((song) => {
          return (
            <tr key={song.songId}>
              <td>{song.songName}</td>
              <td>{song.artist}</td>
              <td>{song.album}</td>
              <td>
                {bytes.format(song.fileSize, { decimalPlaces: 1, fixedDecimals: true, unit: 'MB' })}
              </td>
              <td>{format(song.addTime, 'yyyy-MM-dd HH:mm:ss')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CloudTable;
