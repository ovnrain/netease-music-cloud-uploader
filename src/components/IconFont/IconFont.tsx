import styles from './IconFont.module.scss';
import { type DetailedHTMLProps, forwardRef } from 'react';
import clsx from 'clsx';

export interface IconFontProps
  extends DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  type: string;
  disabled?: boolean;
}

const IconFont = forwardRef<HTMLSpanElement, IconFontProps>((props, ref) => {
  const { className, type, disabled, onClick, ...rest } = props;

  return (
    <span
      className={clsx(styles.icon, className, { [styles.disabled]: disabled })}
      onClick={!disabled ? onClick : undefined}
      ref={ref}
      {...rest}
    >
      <svg className={styles.svg} aria-hidden="true">
        <use xlinkHref={`#${type}`}></use>
      </svg>
    </span>
  );
});

IconFont.displayName = 'IconFont';

export default IconFont;
