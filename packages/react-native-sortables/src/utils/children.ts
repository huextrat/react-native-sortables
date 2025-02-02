import type { ReactElement, ReactNode } from 'react';
import { Children, isValidElement } from 'react';

export const validateChildren = (
  children: ReactNode
): Array<[string, ReactElement]> =>
  Children.toArray(children).reduce(
    (acc: Array<[string, ReactElement]>, child, index) => {
      if (!isValidElement(child)) {
        return acc;
      }

      const key = child.key as string;

      if (!key) {
        console.warn(
          `[react-native-sortables] Child at index ${index} is missing a key prop. Using index as fallback.`
        );
      }

      acc.push([key || String(index), child]);

      return acc;
    },
    []
  );
