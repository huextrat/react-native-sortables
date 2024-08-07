import { useCallback, useEffect, useMemo } from 'react';
import { Platform, type ViewProps, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

import {
  ACTIVATE_PAN_ANIMATION_DELAY,
  TIME_TO_ACTIVATE_PAN
} from '../../constants';
import {
  useAutoScrollContext,
  useDragContext,
  useItemPosition,
  useItemZIndex,
  useMeasurementsContext
} from '../../contexts';
import ItemDecoration from './ItemDecoration';

const RELATIVE_STYLE: ViewStyle = { position: 'relative' };

type DraggableViewProps = {
  itemKey: string;
  reverseXAxis?: boolean;
} & ViewProps;

export default function DraggableView({
  children,
  itemKey: key,
  reverseXAxis,
  style,
  ...viewProps
}: DraggableViewProps) {
  const {
    canSwitchToAbsoluteLayout,
    handleItemMeasurement,
    handleItemRemoval,
    overrideItemDimensions,
    updateTouchedItemDimensions
  } = useMeasurementsContext();
  const {
    activationProgress,
    enabled,
    handleDragEnd,
    handleDragStart,
    handleDragUpdate,
    handleTouchStart,
    inactiveAnimationProgress,
    touchedItemKey
  } = useDragContext();
  const { updateStartScrollOffset } = useAutoScrollContext() ?? {};
  const viewRef = useAnimatedRef<Animated.View>();
  const pressProgress = useSharedValue(0);

  const position = useItemPosition(key);
  const zIndex = useItemZIndex(key, pressProgress, position);
  const overriddenDimensions = useDerivedValue(
    () => overrideItemDimensions.value[key]
  );

  useEffect(() => {
    return () => handleItemRemoval(key);
  }, [key, handleItemRemoval]);

  const onDragEnd = useCallback(() => {
    'worklet';
    pressProgress.value = withTiming(0, { duration: TIME_TO_ACTIVATE_PAN });
    updateStartScrollOffset?.(-1);
    handleDragEnd(key);
  }, [key, pressProgress, handleDragEnd, updateStartScrollOffset]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(TIME_TO_ACTIVATE_PAN)
        .onTouchesDown(e => {
          // Ignore touch if another item is already being touched/activated
          if (touchedItemKey.value !== null) {
            return;
          }

          handleTouchStart(e, key);
          updateTouchedItemDimensions(key);

          const animate = () =>
            withDelay(
              ACTIVATE_PAN_ANIMATION_DELAY,
              withTiming(1, {
                duration: TIME_TO_ACTIVATE_PAN - ACTIVATE_PAN_ANIMATION_DELAY
              })
            );
          pressProgress.value = animate();
          activationProgress.value = animate();
          inactiveAnimationProgress.value = animate();
        })
        .onStart(() => {
          if (touchedItemKey.value === null) {
            return;
          }
          updateStartScrollOffset?.();
          handleDragStart(key);
        })
        .onUpdate(e => {
          if (touchedItemKey.value !== key) {
            return;
          }
          handleDragUpdate(e, reverseXAxis);
        })
        .onFinalize(onDragEnd)
        .onTouchesCancelled(onDragEnd)
        .enabled(enabled),
    [
      key,
      enabled,
      reverseXAxis,
      activationProgress,
      touchedItemKey,
      pressProgress,
      inactiveAnimationProgress,
      handleTouchStart,
      handleDragUpdate,
      handleDragStart,
      onDragEnd,
      updateStartScrollOffset,
      updateTouchedItemDimensions
    ]
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (!canSwitchToAbsoluteLayout.value) {
      return RELATIVE_STYLE;
    }

    const x = position.x.value;
    const y = position.y.value;

    if (x === null || y === null) {
      return RELATIVE_STYLE;
    }

    console.log(Platform.OS, key, x, y);

    return {
      position: 'absolute',
      transform: [{ translateX: x }, { translateY: y }],
      zIndex: zIndex.value,
      ...overriddenDimensions.value
    };
  });

  return (
    <Animated.View ref={viewRef} {...viewProps} style={[style, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <ItemDecoration
          itemKey={key}
          pressProgress={pressProgress}
          // Keep onLayout the closest to the children to measure the real item size
          // (without paddings or other style changes made to the wrapper component)
          onLayout={({ nativeEvent: { layout } }) =>
            handleItemMeasurement(key, {
              height: layout.height,
              width: layout.width
            })
          }>
          {children}
        </ItemDecoration>
      </GestureDetector>
    </Animated.View>
  );
}
