import { useState } from 'react';

/**
 * 一个融合 props 和 state 的 hook
 */
export default function useValueOnChange<T = unknown>(
  defaultValue?: T,
  value?: T,
  onChange?: (value: T) => void,
) {
  const [stateValue, setStateValue] = useState(defaultValue);

  const computedValue = value ?? stateValue;

  const onValueChange = (newValue: T) => {
    if (typeof onChange !== 'undefined') {
      onChange(newValue);
    } else {
      setStateValue(newValue);
    }
  };

  return [computedValue, onValueChange] as const;
}
