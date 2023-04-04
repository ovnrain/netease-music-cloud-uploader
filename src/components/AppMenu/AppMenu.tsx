import clsx from 'clsx';
import useValueOnChange from '../../hooks/useValueOnChange';
import Trigger, { TriggerProps } from '../Trigger';
import styles from './AppMenu.module.scss';

export type MenuKey = 'logout';

export interface MenuItem {
  title: string;
  key: MenuKey;
}

export interface AppMenuProps
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
  onClick?: (key: MenuKey, item: MenuItem) => void;
}

const menus: MenuItem[] = [
  {
    title: '退出登录',
    key: 'logout',
  },
];

const AppMenu = (props: AppMenuProps) => {
  const {
    popupClassName,
    open: propOpen,
    onOpenChange: propOnOpenChange,
    onClick,
    ...rest
  } = props;

  const [computedOpen, onOpenChange] = useValueOnChange(false, propOpen, propOnOpenChange);

  return (
    <Trigger
      popupClassName={clsx(styles.menu, popupClassName)}
      popup={menus.map((menu) => (
        <div
          key={menu.key}
          className={styles.item}
          onClick={() => {
            onClick?.(menu.key, menu);
            onOpenChange(false);
          }}
        >
          {menu.title}
        </div>
      ))}
      trigger="click"
      placement="bottom-end"
      offset={4}
      open={computedOpen}
      onOpenChange={onOpenChange}
      {...rest}
    />
  );
};

export default AppMenu;
