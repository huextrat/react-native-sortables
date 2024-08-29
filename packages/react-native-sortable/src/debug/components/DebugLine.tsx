import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { Maybe, Vector } from '../../types';
import { isPresent } from '../../utils';
import { useScreenDiagonal } from '../hooks';
import type { WrappedProps } from '../types';

export type DebugLineProps = {
  visible?: boolean;
  color?: ViewStyle['borderColor'];
  thickness?: number;
  style?: ViewStyle['borderStyle'];
  opacity?: number;
} & (
  | {
      from: Maybe<Vector>;
      to: Maybe<Vector>;
      x?: never;
      y?: never;
    }
  | {
      x: Maybe<number>;
      y?: never;
      from?: never;
      to?: never;
    }
  | {
      x?: never;
      y: Maybe<number>;
      from?: never;
      to?: never;
    }
);

export default function DebugLine({ props }: WrappedProps<DebugLineProps>) {
  const screenDiagonal = useScreenDiagonal();

  const animatedStyle = useAnimatedStyle(() => {
    const { from, thickness = 3, to, visible = true, x, y } = props.value;

    let angle = 0,
      length,
      tX = 0,
      tY = 0;

    if (from && to) {
      length = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
      angle = Math.atan2(to.y - from.y, to.x - from.x);
      tY = from.y;
      tX = from.x;
    } else if (isPresent(x)) {
      length = 3 * screenDiagonal;
      angle = Math.PI / 2;
      tY = -screenDiagonal;
      tX = x;
    } else if (isPresent(y)) {
      length = 3 * screenDiagonal;
      tY = y;
      tX = -screenDiagonal;
    } else {
      return { display: 'none' };
    }

    return {
      display: visible ? 'flex' : 'none',
      height: thickness,
      marginTop: -thickness / 2,
      opacity: props.value.opacity,
      transform: [
        { translateX: tX },
        { translateY: tY },
        { rotate: `${angle}rad` }
      ],
      width: length
    };
  }, [screenDiagonal]);

  const animatedInnerStyle = useAnimatedStyle(() => {
    const { color = 'black', style = 'dashed', thickness = 3 } = props.value;

    return {
      borderColor: color,
      borderStyle: style,
      borderWidth: thickness
    };
  });

  return (
    // A tricky way to create a dashed/dotted line (render border on both sides and
    // hide one side with overflow hidden)
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={animatedInnerStyle} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    transformOrigin: '0 0'
  }
});
