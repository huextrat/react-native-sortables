import type { ComponentType } from 'react';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

import {
  useDragContext,
  useItemDimensions,
  useItemPosition,
  usePositionsContext
} from '../../contexts';
import type { Position } from '../../types';

export type DropIndicatorComponentProps = {
  activationProgress: SharedValue<number>;
  touchedItemKey: SharedValue<null | string>;
  dropIndex: SharedValue<number>;
  dropPosition: SharedValue<Position>;
};

type DropIndicatorProps = {
  DropIndicatorComponent: ComponentType<DropIndicatorComponentProps>;
};

function DropIndicator({ DropIndicatorComponent }: DropIndicatorProps) {
  const { activationProgress, activeItemDropped, touchedItemKey } =
    useDragContext();
  const { itemPositions, keyToIndex } = usePositionsContext();

  const { x, y } = useItemPosition(touchedItemKey, {
    easing: Easing.out(Easing.ease),
    ignoreActive: true
  });
  const { height, width } = useItemDimensions(touchedItemKey);

  const dropIndex = useSharedValue(0);
  const dropPosition = useSharedValue<Position>({ x: 0, y: 0 });

  useAnimatedReaction(
    () => ({
      kToI: keyToIndex.value,
      key: touchedItemKey.value,
      positions: itemPositions.value
    }),
    ({ kToI, key, positions }) => {
      if (key !== null) {
        dropIndex.value = kToI[key] ?? 0;
        dropPosition.value = positions[key] ?? { x: 0, y: 0 };
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = x.value;
    const translateY = y.value;

    if (
      (activeItemDropped.value && activationProgress.value === 0) ||
      translateX === null ||
      translateY === null
    ) {
      return { opacity: 0 };
    }

    return {
      height: height.value,
      opacity: 1,
      transform: [{ translateX }, { translateY }],
      width: width.value
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <DropIndicatorComponent
        activationProgress={activationProgress}
        dropIndex={dropIndex}
        dropPosition={dropPosition}
        touchedItemKey={touchedItemKey}
      />
    </Animated.View>
  );
}

export function DefaultDropIndicator({
  activationProgress
}: DropIndicatorComponentProps): JSX.Element {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: activationProgress.value,
    transform: [
      {
        scale: interpolate(
          Math.pow(activationProgress.value, 1 / 3),
          [0, 1],
          [1.1, 1]
        )
      }
    ]
  }));

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute'
  },
  indicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'black',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 2,
    flex: 1
  }
});

export default memo(DropIndicator);
