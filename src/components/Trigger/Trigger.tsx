import styles from './Trigger.module.scss';
import { cloneElement, CSSProperties, ReactElement, ReactNode, useEffect } from 'react';
import {
  autoUpdate,
  flip,
  FloatingNode,
  FloatingOverlay,
  FloatingPortal,
  FloatingTree,
  hide,
  offset,
  OffsetOptions,
  Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import clsx from 'clsx';
import useValueOnChange from '../../hooks/useValueOnChange';

export interface TriggerProps {
  children: ReactElement;
  /**
   * 弹层的最大高度
   */
  maxHeight?: number;
  placement?: Placement;
  popup?: ReactNode;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  trigger?: 'click' | 'hover' | 'contextmenu';
  offset?: OffsetOptions;
  flipPadding?: number;
  shiftPadding?: number;
  open?: boolean;
  equalWidth?: boolean;
  equalMinWidth?: boolean;
  autoDismiss?: boolean;
  disabled?: boolean;
  useOverlay?: boolean;
  /**
   * 禁用鼠标点击外部区域关闭弹层
   * 但是可以使用 esc 关闭弹层
   */
  disableOutsideClickHide?: boolean;
  zIndex?: number;
  delay?:
    | number
    | Partial<{
        open: number;
        close: number;
      }>;
  restMs?: number;
  onOpenChange?: (open: boolean) => void;
}

const InnerTrigger = (props: TriggerProps) => {
  const {
    children,
    maxHeight,
    placement,
    popup,
    popupClassName,
    popupStyle,
    trigger,
    offset: offsetOptions,
    flipPadding,
    shiftPadding,
    equalWidth,
    equalMinWidth,
    autoDismiss,
    disabled,
    open: propOpen,
    onOpenChange: propOnOpenChange,
    useOverlay,
    disableOutsideClickHide,
    zIndex,
    delay = 200,
    restMs = 100,
  } = props;

  const isContextMenu = trigger === 'contextmenu';
  const showOverlay = useOverlay || isContextMenu;

  const [computedOpen, onOpenChange] = useValueOnChange(false, propOpen, propOnOpenChange);

  const nodeId = useFloatingNodeId();

  const { x, y, reference, floating, context, middlewareData, refs, strategy, update } =
    useFloating({
      nodeId,
      placement: placement ?? 'bottom-start',
      open: computedOpen,
      onOpenChange: onOpenChange,
      middleware: [
        offset(offsetOptions),
        flip({ padding: flipPadding ?? 8 }),
        shift({ padding: shiftPadding ?? 8 }),
        size({
          apply: ({ rects, elements }) => {
            if (equalWidth) {
              Object.assign(elements.floating.style, {
                width: `${rects.reference.width}px`,
              });
            } else if (equalMinWidth) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
              });
            }
          },
        }),
        hide({ strategy: 'referenceHidden' }),
      ],
      whileElementsMounted: !isContextMenu ? autoUpdate : undefined,
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay, restMs, enabled: !disabled && trigger === 'hover' }),
    useClick(context, { enabled: !disabled && trigger === 'click' }),
    useDismiss(context, {
      enabled: autoDismiss ?? true,
      outsidePress: !disableOutsideClickHide,
    }),
  ]);

  /**
   * 由于 contextmenu 的 reference 不同于其他的实体 HTMLElement，是一个虚拟位置
   * 当在同一个元素上面多次右键点击时，reference 每次都会不一样
   * 所以每次右键点击都要重新注册 autoUpdate
   */
  useEffect(() => {
    if (isContextMenu && computedOpen && refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [computedOpen, update, refs.reference, refs.floating, isContextMenu]);

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    reference({
      getBoundingClientRect: () => ({
        x: e.clientX,
        y: e.clientY,
        width: 0,
        height: 0,
        top: e.clientY,
        right: e.clientX,
        bottom: e.clientY,
        left: e.clientX,
      }),
    });
    onOpenChange(true);
  };

  const popupNode = (
    <div
      {...getFloatingProps({
        ref: floating,
        style: {
          position: strategy,
          left: 0,
          top: 0,
          maxHeight,
          transform: `translate3d(${Math.round(x ?? 0)}px,${Math.round(y ?? 0)}px,0)`,
          zIndex: showOverlay ? undefined : zIndex,
          ...popupStyle,
        },
        className: clsx(
          styles.popup,
          { [styles.hide]: middlewareData.hide?.referenceHidden },
          popupClassName
        ),
      })}
    >
      {popup}
    </div>
  );

  return (
    <FloatingNode id={nodeId}>
      {cloneElement(
        children,
        getReferenceProps({
          ref: !isContextMenu ? reference : undefined,
          ...children.props,
          className: clsx(
            styles.trigger,
            { [styles.pointer]: !isContextMenu },
            { [styles.noSelect]: !isContextMenu || computedOpen },
            { [styles.disabled]: disabled },
            children.props.className
          ),
          onContextMenu: isContextMenu && !disabled ? onContextMenu : undefined,
        })
      )}
      <FloatingPortal>
        {computedOpen &&
          (showOverlay ? (
            <FloatingOverlay style={{ zIndex }} lockScroll>
              {popupNode}
            </FloatingOverlay>
          ) : (
            popupNode
          ))}
      </FloatingPortal>
    </FloatingNode>
  );
};

const Trigger = (props: TriggerProps) => {
  const parentId = useFloatingParentNodeId();

  if (parentId == null) {
    return (
      <FloatingTree>
        <InnerTrigger {...props} />
      </FloatingTree>
    );
  }

  return <InnerTrigger {...props} />;
};

export default Trigger;
