import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { type SharedValue } from 'react-native-reanimated';

import { useAutoScrollContext } from '../AutoScrollProvider';
import { useCommonValuesContext } from '../CommonValuesProvider';
import { useDragContext } from '../DragProvider';

export default function useItemPanGesture(
  key: string,
  pressProgress: SharedValue<number>
) {
  const { sortEnabled, touchedItemKey } = useCommonValuesContext();
  const { handleDragEnd, handleTouchStart, handleTouchesMove } =
    useDragContext();
  const { updateStartScrollOffset } = useAutoScrollContext() ?? {};

  return useMemo(
    () =>
      Gesture.Manual()
        .manualActivation(true)
        .onTouchesDown((e, manager) => {
          // Ignore touch if another item is already being touched/activated
          // or sorting is disabled
          if (touchedItemKey.value !== null || !sortEnabled.value) {
            manager.fail();
            return;
          }
          handleTouchStart(e, key, pressProgress, manager.activate);
        })
        .onTouchesCancelled((_, manager) => {
          manager.fail();
        })
        .onTouchesUp((_, manager) => {
          manager.end();
        })
        .onTouchesMove((e, manager) => {
          handleTouchesMove(e, manager.fail);
        })
        .onFinalize(() => {
          updateStartScrollOffset?.(-1);
          handleDragEnd(key, pressProgress);
        }),
    [
      key,
      pressProgress,
      touchedItemKey,
      handleTouchStart,
      handleTouchesMove,
      handleDragEnd,
      updateStartScrollOffset,
      sortEnabled
    ]
  );
}
