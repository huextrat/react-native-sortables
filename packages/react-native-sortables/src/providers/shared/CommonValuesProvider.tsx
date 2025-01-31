import { type PropsWithChildren, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  useAnimatedRef,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { useAnimatableValue } from '../../hooks';
import type {
  ActiveItemDecorationSettings,
  ActiveItemSnapSettings,
  Animatable,
  CommonValuesContextType,
  Dimensions,
  Maybe,
  Vector
} from '../../types';
import { DragActivationState } from '../../types';
import { areArraysDifferent } from '../../utils';
import { createProvider } from '../utils';

type CommonValuesProviderProps = PropsWithChildren<
  {
    sortEnabled: Animatable<boolean>;
    itemKeys: Array<string>;
    initialItemsStyleOverride?: ViewStyle;
  } & ActiveItemDecorationSettings &
    ActiveItemSnapSettings
>;

const { CommonValuesProvider, useCommonValuesContext } = createProvider(
  'CommonValues'
)<CommonValuesProviderProps, CommonValuesContextType>(({
  activeItemOpacity: _activeItemOpacity,
  activeItemScale: _activeItemScale,
  activeItemShadowOpacity: _activeItemShadowOpacity,
  enableActiveItemSnap: _enableActiveItemSnap,
  inactiveItemOpacity: _inactiveItemOpacity,
  inactiveItemScale: _inactiveItemScale,
  initialItemsStyleOverride,
  itemKeys,
  snapOffsetX: _snapOffsetX,
  snapOffsetY: _snapOffsetY,
  sortEnabled: _sortEnabled
}) => {
  const prevKeysRef = useRef<Array<string>>([]);

  // ORDER
  const indexToKey = useSharedValue<Array<string>>(itemKeys);
  const keyToIndex = useDerivedValue(() =>
    Object.fromEntries(indexToKey.value.map((key, index) => [key, index]))
  );

  // POSITIONs
  const itemPositions = useSharedValue<Record<string, Vector>>({});
  const touchPosition = useSharedValue<Vector | null>(null);
  const touchedItemPosition = useSharedValue<Vector | null>(null);

  // DIMENSIONS
  const containerWidth = useSharedValue(-1);
  const containerHeight = useSharedValue(-1);
  const touchedItemWidth = useSharedValue(-1);
  const touchedItemHeight = useSharedValue(-1);
  const itemDimensions = useSharedValue<Record<string, Dimensions>>({});
  const itemsStyleOverride = useSharedValue<Maybe<ViewStyle>>(
    initialItemsStyleOverride
  );

  // DRAG STATE
  const touchedItemKey = useSharedValue<null | string>(null);
  const activeItemKey = useSharedValue<null | string>(null);
  const activationState = useSharedValue(DragActivationState.INACTIVE);
  const activationProgress = useSharedValue(0);
  const inactiveAnimationProgress = useSharedValue(0);
  const activeItemDropped = useSharedValue(true);

  // ACTIVE ITEM DECORATION
  const activeItemOpacity = useAnimatableValue(_activeItemOpacity);
  const activeItemScale = useAnimatableValue(_activeItemScale);
  const activeItemShadowOpacity = useAnimatableValue(_activeItemShadowOpacity);
  const inactiveItemOpacity = useAnimatableValue(_inactiveItemOpacity);
  const inactiveItemScale = useAnimatableValue(_inactiveItemScale);

  // ACTIVE ITEM SNAP
  const enableActiveItemSnap = useAnimatableValue(_enableActiveItemSnap);
  const snapOffsetX = useAnimatableValue(_snapOffsetX);
  const snapOffsetY = useAnimatableValue(_snapOffsetY);

  // OTHER
  const containerRef = useAnimatedRef<Animated.View>();
  const sortEnabled = useAnimatableValue(_sortEnabled);
  const canSwitchToAbsoluteLayout = useSharedValue(false);

  useEffect(() => {
    if (areArraysDifferent(itemKeys, prevKeysRef.current)) {
      indexToKey.value = itemKeys;
      prevKeysRef.current = itemKeys;
    }
  }, [itemKeys, indexToKey]);

  return {
    value: {
      activationProgress,
      activationState,
      activeItemDropped,
      activeItemKey,
      activeItemOpacity,
      activeItemScale,
      activeItemShadowOpacity,
      canSwitchToAbsoluteLayout,
      containerHeight,
      containerRef,
      containerWidth,
      enableActiveItemSnap,
      inactiveAnimationProgress,
      inactiveItemOpacity,
      inactiveItemScale,
      indexToKey,
      itemDimensions,
      itemPositions,
      itemsStyleOverride,
      keyToIndex,
      snapOffsetX,
      snapOffsetY,
      sortEnabled,
      touchPosition,
      touchedItemHeight,
      touchedItemKey,
      touchedItemPosition,
      touchedItemWidth
    }
  };
});

export { CommonValuesProvider, useCommonValuesContext };
