import type { ReorderStrategy, Vector } from '../types';

export const getItemZIndex = (
  isActive: boolean,
  pressProgress: number,
  position: Vector,
  targetPosition?: Vector
): number => {
  'worklet';
  if (isActive) {
    return 3;
  }
  if (pressProgress > 0) {
    return 2;
  }
  // If the item is being re-ordered but is not dragged
  if (
    targetPosition &&
    (position.x !== targetPosition.x || position.y !== targetPosition.y)
  ) {
    return 1;
  }
  return 0;
};

const reorderInsert = (
  indexToKey: Array<string>,
  fromIndex: number,
  toIndex: number
): Array<string> => {
  'worklet';
  const activeKey = indexToKey[fromIndex];

  if (activeKey === undefined) {
    return indexToKey;
  }

  if (toIndex < fromIndex) {
    return [
      ...indexToKey.slice(0, toIndex),
      activeKey,
      ...indexToKey.slice(toIndex, fromIndex),
      ...indexToKey.slice(fromIndex + 1)
    ];
  }
  return [
    ...indexToKey.slice(0, fromIndex),
    ...indexToKey.slice(fromIndex + 1, toIndex + 1),
    activeKey,
    ...indexToKey.slice(toIndex + 1)
  ];
};

const reorderSwap = (
  indexToKey: Array<string>,
  fromIndex: number,
  toIndex: number
): Array<string> => {
  'worklet';
  const fromKey = indexToKey[fromIndex];
  const toKey = indexToKey[toIndex];

  if (fromKey === undefined || toKey === undefined) {
    return indexToKey;
  }

  const result = [...indexToKey];
  result[fromIndex] = toKey;
  result[toIndex] = fromKey;
  return result;
};

export const reorderItems = (
  indexToKey: Array<string>,
  fromIndex: number,
  toIndex: number,
  strategy: ReorderStrategy
): Array<string> => {
  'worklet';

  switch (strategy) {
    case 'insert':
      return reorderInsert(indexToKey, fromIndex, toIndex);
    case 'swap':
      return reorderSwap(indexToKey, fromIndex, toIndex);
  }
};
