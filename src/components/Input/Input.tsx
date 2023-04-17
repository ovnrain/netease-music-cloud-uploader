import styles from './Input.module.scss';
import { type DetailedHTMLProps, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps
  extends DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, ...rest } = props;
  return <input className={clsx(styles.input, className)} ref={ref} {...rest} />;
});

Input.displayName = 'Input';

export default Input;
