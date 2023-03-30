import styles from './IconFont.module.scss';
import { DetailedHTMLProps, forwardRef } from 'react';
import clsx from 'clsx';

export interface IconFontProps
  extends DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  type: string;
}

const IconFont = forwardRef<HTMLSpanElement, IconFontProps>((props, ref) => {
  const { className, type, onClick, ...rest } = props;

  return (
    <span className={clsx(styles.icon, className)} onClick={onClick} ref={ref} {...rest}>
      <svg className={styles.svg} aria-hidden="true">
        <use xlinkHref={`#${type}`}></use>
      </svg>
    </span>
  );
});

IconFont.displayName = 'IconFont';

export default IconFont;
