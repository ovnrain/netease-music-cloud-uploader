import styles from './Button.module.scss';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import IconFont from '../IconFont';
import clsx from 'clsx';

export interface ButtonProps {
  to?: string;
  icon?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  type?: 'primary' | 'secondary';
  onClick?: () => void;
}

const Button = (props: ButtonProps) => {
  const {
    to,
    icon,
    children,
    className,
    disabled,
    size = 'medium',
    type = 'primary',
    onClick,
  } = props;

  if (to) {
    return (
      <Link
        className={clsx(styles.button, styles[size], styles[type], className, {
          [styles.disabled]: disabled,
        })}
        to={to}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
          }
        }}
      >
        {icon && (
          <IconFont className={clsx(styles.icon, { [styles.noChildren]: !children })} type={icon} />
        )}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={clsx(styles.button, styles[size], styles[type], className, {
        [styles.disabled]: disabled,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && (
        <IconFont className={clsx(styles.icon, { [styles.noChildren]: !children })} type={icon} />
      )}
      {children}
    </button>
  );
};

export default Button;
