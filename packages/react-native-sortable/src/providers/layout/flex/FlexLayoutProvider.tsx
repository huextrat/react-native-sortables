import type { PropsWithChildren } from 'react';
import { useMemo, useRef } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { EMPTY_OBJECT } from '../../../constants';
import { useDebugContext } from '../../../debug';
import type { Dimensions } from '../../../types';
import { haveEqualPropValues, resolveDimensionValue } from '../../../utils';
import { useCommonValuesContext } from '../../shared';
import { createProvider } from '../../utils';
import type { FlexDirection, FlexProps } from './types';
import {
  calculateLayout,
  calculateReferenceSize,
  updateLayoutDebugRects
} from './utils';

export type FlexLayoutContextType = {
  flexDirection: FlexDirection;
  itemGroups: SharedValue<Array<Array<string>>>;
  keyToGroup: SharedValue<Record<string, number>>;
  crossAxisGroupSizes: SharedValue<Array<number>>;
  crossAxisGroupOffsets: SharedValue<Array<number>>;
  rowGap: SharedValue<number>;
  columnGap: SharedValue<number>;
};

type FlexLayoutProviderProps = PropsWithChildren<
  { itemsCount: number } & FlexProps
>;

const { FlexLayoutProvider, useFlexLayoutContext } = createProvider(
  'FlexLayout'
)<FlexLayoutProviderProps, FlexLayoutContextType>(({
  alignContent,
  alignItems,
  columnGap: columnGap_,
  flexDirection,
  flexWrap,
  gap,
  height,
  itemsCount,
  justifyContent,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  padding,
  paddingBlock,
  paddingBlockEnd,
  paddingBlockStart,
  paddingBottom,
  paddingEnd,
  paddingHorizontal,
  paddingInline,
  paddingInlineEnd,
  paddingInlineStart,
  paddingLeft,
  paddingRight,
  paddingStart,
  paddingTop,
  paddingVertical,
  rowGap: rowGap_,
  width
}) => {
  const {
    containerHeight,
    containerWidth,
    indexToKey,
    itemDimensions,
    itemPositions,
    itemsStyleOverride,
    parentDimensions
  } = useCommonValuesContext();
  const debugContext = useDebugContext();

  const itemGroups = useSharedValue<Array<Array<string>>>([]);
  const keyToGroup = useDerivedValue<Record<string, number>>(() =>
    Object.fromEntries(
      itemGroups.value.flatMap((group, i) => group.map(key => [key, i]))
    )
  );
  const crossAxisGroupSizes = useSharedValue<Array<number>>([]);
  const crossAxisGroupOffsets = useSharedValue<Array<number>>([]);
  const referenceContainerDimensions =
    useSharedValue<Partial<Dimensions>>(EMPTY_OBJECT);

  const columnGap = useDerivedValue(
    () =>
      resolveDimensionValue(
        columnGap_ ?? gap,
        parentDimensions?.value?.width ?? 0
      ) ?? 0
  );
  const rowGap = useDerivedValue(
    () =>
      resolveDimensionValue(
        rowGap_ ?? gap,
        parentDimensions?.value?.height ?? 0
      ) ?? 0
  );

  const topPadding = useMemo(
    () =>
      paddingTop ??
      paddingBlockStart ??
      paddingBlock ??
      paddingVertical ??
      padding,
    [paddingTop, paddingBlockStart, paddingBlock, paddingVertical, padding]
  );
  const bottomPadding = useMemo(
    () =>
      paddingBottom ??
      paddingBlockEnd ??
      paddingBlock ??
      paddingVertical ??
      padding,
    [paddingBottom, paddingBlockEnd, paddingBlock, paddingVertical, padding]
  );
  const leftPadding = useMemo(
    () =>
      paddingLeft ??
      paddingInlineStart ??
      paddingStart ??
      paddingInline ??
      paddingHorizontal ??
      padding,
    [
      paddingLeft,
      paddingInlineStart,
      paddingStart,
      paddingInline,
      paddingHorizontal,
      padding
    ]
  );
  const rightPadding = useMemo(
    () =>
      paddingRight ??
      paddingInlineEnd ??
      paddingEnd ??
      paddingInline ??
      paddingHorizontal ??
      padding,
    [
      paddingRight,
      paddingInlineEnd,
      paddingEnd,
      paddingInline,
      paddingHorizontal,
      padding
    ]
  );

  const isHeightLimited = useMemo(
    () =>
      resolveDimensionValue(height, 0) !== undefined ||
      resolveDimensionValue(maxHeight, 0) !== undefined,
    [height, maxHeight]
  );

  // Because the number of groups can dynamically change after order change
  // and we can't detect that in the React runtime, we are creating debug
  // rects for the maximum number of groups that can be displayed (which
  // is the number of items minus 1 in the worst case for just a single group)
  const debugCrossAxisGapRects = debugContext?.useDebugRects(itemsCount - 1);
  const debugMainAxisGapRects = debugContext?.useDebugRects(itemsCount);

  const isFirstRenderRef = useRef(true);
  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false;
    itemsStyleOverride.modify(v => {
      'worklet';
      return { alignItems, flexDirection, flexGrow: 1 } as typeof v;
    }, true);
  }

  // REFERENCE CONTAINER DIMENSIONS UPDATER
  useAnimatedReaction(
    () => ({
      measuredWidth: containerWidth.value,
      parent: parentDimensions?.value
    }),
    ({ measuredWidth, parent }) => {
      if (!parent || !measuredWidth) {
        referenceContainerDimensions.value = EMPTY_OBJECT;
        return;
      }

      const { height: parentH, width: parentW } = parent;
      const tp = resolveDimensionValue(topPadding, parentH);
      const bp = resolveDimensionValue(bottomPadding, parentH);
      const lp = resolveDimensionValue(leftPadding, parentW);
      const rp = resolveDimensionValue(rightPadding, parentW);

      const paddingX = (lp ?? 0) + (rp ?? 0);
      const paddingY = (tp ?? 0) + (bp ?? 0);

      const h = calculateReferenceSize(
        minHeight,
        height,
        maxHeight,
        parentH + paddingY
      );
      const w = calculateReferenceSize(
        minWidth,
        width,
        maxWidth,
        parentW + paddingX
      );

      const current = referenceContainerDimensions.value;
      if (h !== current.height || (w ?? measuredWidth) !== current.width) {
        const newReferenceDimensions: Partial<Dimensions> = {};

        if (h !== undefined) {
          newReferenceDimensions.height = h - paddingY;
        }
        if (w !== undefined) {
          newReferenceDimensions.width = w - paddingX;
        } else {
          newReferenceDimensions.width = measuredWidth;
        }

        if (!haveEqualPropValues(newReferenceDimensions, current)) {
          referenceContainerDimensions.value = newReferenceDimensions;
        }
      }
    },
    [
      minHeight,
      minWidth,
      height,
      width,
      maxHeight,
      maxWidth,
      topPadding,
      bottomPadding,
      leftPadding,
      rightPadding
    ]
  );

  // FLEX LAYOUT UPDATER
  useAnimatedReaction(
    () => ({
      flexAlignments: {
        alignContent,
        alignItems,
        justifyContent
      },
      flexDirection,
      flexWrap,
      gaps: {
        column: columnGap.value,
        row: rowGap.value
      },
      indexToKey: indexToKey.value,
      itemDimensions: itemDimensions.value,
      referenceContainerDimensions: referenceContainerDimensions.value
    }),
    props => {
      const layout = calculateLayout(props);
      if (!layout) {
        return;
      }

      // Update item groups
      itemGroups.value = layout.itemGroups;
      // Update item positions
      itemPositions.value = layout.itemPositions;
      // Update cross axis group offsets and sizes
      crossAxisGroupOffsets.value = layout.crossAxisGroupOffsets;
      crossAxisGroupSizes.value = layout.crossAxisGroupSizes;
      // Update container height
      const referenceHeight = referenceContainerDimensions.value.height;
      if (isHeightLimited && referenceHeight !== undefined) {
        containerHeight.value = referenceHeight;
      } else {
        containerHeight.value = layout.totalHeight;
      }

      // DEBUG ONLY
      if (debugCrossAxisGapRects && debugMainAxisGapRects) {
        updateLayoutDebugRects(
          layout,
          debugCrossAxisGapRects,
          debugMainAxisGapRects,
          itemDimensions
        );
      }
    },
    [alignContent, alignItems, justifyContent, flexDirection, flexWrap]
  );

  return {
    value: {
      columnGap,
      crossAxisGroupOffsets,
      crossAxisGroupSizes,
      flexDirection,
      itemGroups,
      keyToGroup,
      rowGap
    }
  };
});

export { FlexLayoutProvider, useFlexLayoutContext };
