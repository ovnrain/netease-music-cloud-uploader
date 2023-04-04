import styles from './ConfirmModal.module.scss';
import { Fragment, ReactNode, useState } from 'react';
import clsx from 'clsx';
import Trigger, { type TriggerProps } from '../Trigger';
import Button from '../Button';
import useValueOnChange from '../../hooks/useValueOnChange';

export interface ConfirmModalProps
  extends Pick<
    TriggerProps,
    | 'children'
    | 'popupClassName'
    | 'placement'
    | 'popupStyle'
    | 'disableOutsideClickHide'
    | 'useOverlay'
    | 'open'
    | 'onOpenChange'
  > {
  title?: string;
  content: ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  contentClassName?: string;
  onCancel?: () => void;
  onConfirm?: () => void | boolean | Promise<void | boolean>;
}

const ConfirmModal = (props: ConfirmModalProps) => {
  const {
    popupClassName,
    title,
    content,
    onCancel,
    onConfirm,
    cancelButtonText,
    confirmButtonText,
    open: propOpen,
    onOpenChange: propOnOpenChange,
    contentClassName,
    ...rest
  } = props;

  const [computedOpen, onOpenChange] = useValueOnChange(false, propOpen, propOnOpenChange);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Trigger
      popupClassName={clsx(styles.popup, popupClassName)}
      popup={
        <Fragment>
          <div className={styles.title}>{title ?? '确认'}</div>
          <div className={clsx(styles.content, contentClassName)}>{content}</div>
          <div className={styles.buttons}>
            <Button
              className={styles.button}
              onClick={() => {
                onOpenChange(false);
                onCancel?.();
              }}
              disabled={isLoading}
              size="small"
              type="secondary"
            >
              {cancelButtonText ?? '取消'}
            </Button>
            <Button
              className={styles.button}
              onClick={async () => {
                setIsLoading(true);
                const result = await onConfirm?.();
                setIsLoading(false);
                if (result !== false) {
                  onOpenChange(false);
                }
              }}
              disabled={isLoading}
              size="small"
            >
              {confirmButtonText ?? '确认'}
            </Button>
          </div>
        </Fragment>
      }
      trigger="click"
      placement="top"
      offset={4}
      open={computedOpen}
      onOpenChange={onOpenChange}
      {...rest}
    />
  );
};

export default ConfirmModal;
