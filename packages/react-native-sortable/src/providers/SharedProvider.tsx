/* eslint-disable react/jsx-key */
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { LayoutAnimationConfig } from 'react-native-reanimated';

import { DebugOutlet, DebugProvider } from '../debug';
import type {
  ActiveItemDecorationSettings,
  ActiveItemSnapSettings,
  AutoScrollSettings,
  Dimensions,
  PartialBy,
  SortableCallbacks
} from '../types';
import {
  AutoScrollProvider,
  CommonValuesProvider,
  DragProvider,
  LayerProvider,
  MeasurementsProvider
} from './shared';
import { ContextProviderComposer } from './utils';

type SharedProviderProps = PropsWithChildren<
  {
    itemKeys: Array<string>;
    sortEnabled: boolean;
    hapticsEnabled: boolean;
    debug: boolean;
    parentDimensions?: SharedValue<Dimensions | null>;
    initialItemsStyleOverride?: ViewStyle;
    dropIndicatorStyle?: ViewStyle;
  } & ActiveItemDecorationSettings &
    ActiveItemSnapSettings &
    PartialBy<AutoScrollSettings, 'scrollableRef'> &
    Required<SortableCallbacks>
>;

export default function SharedProvider({
  autoScrollActivationOffset,
  autoScrollEnabled,
  autoScrollSpeed,
  children,
  debug,
  hapticsEnabled,
  itemKeys,
  onDragEnd,
  onDragStart,
  onOrderChange,
  scrollableRef,
  ...rest
}: SharedProviderProps) {
  const providers = [
    // Provider used for layout debugging
    debug && <DebugProvider />,
    // Provider used for zIndex management when item is pressed or dragged
    <LayerProvider />,
    // Provider used for shared values between all providers below
    <CommonValuesProvider itemKeys={itemKeys} {...rest} />,
    // Provider used for measurements of items and the container
    <MeasurementsProvider itemsCount={itemKeys.length} />,
    // Provider used for auto-scrolling when dragging an item near the
    // edge of the container
    scrollableRef && (
      <AutoScrollProvider
        autoScrollActivationOffset={autoScrollActivationOffset}
        autoScrollEnabled={autoScrollEnabled}
        autoScrollSpeed={autoScrollSpeed}
        scrollableRef={scrollableRef}
      />
    ),
    // Provider used for dragging and item swapping logic
    <DragProvider
      hapticsEnabled={hapticsEnabled}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onOrderChange={onOrderChange}
    />
  ];

  return (
    <ContextProviderComposer providers={providers}>
      <LayoutAnimationConfig skipEntering skipExiting>
        {children}
        {debug && <DebugOutlet />}
      </LayoutAnimationConfig>
    </ContextProviderComposer>
  );
}
