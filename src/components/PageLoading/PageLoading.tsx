import styles from './PageLoading.module.scss';
import clsx from 'clsx';
import IconFont from '../IconFont';

export interface PageLoadingProps {
  mode?: 'global' | 'page';
  iconSize?: number;
}

const PageLoading = (props: PageLoadingProps) => {
  const { mode = 'global', iconSize = 36 } = props;

  return (
    <div className={clsx(styles.loading, styles[mode])}>
      <IconFont className={styles.icon} type="ne-loading" style={{ fontSize: iconSize }} />
    </div>
  );
};

export default PageLoading;
