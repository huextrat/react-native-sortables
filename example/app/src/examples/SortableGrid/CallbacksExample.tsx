import { useCallback } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Sortable, {
  type DragEndCallback,
  type DragStartCallback,
  type OrderChangeCallback,
  type SortableGridRenderItem
} from 'react-native-sortables';

import { AnimatedText, GridCard, Section, Stagger } from '@/components';
import { flex, sizes, spacing } from '@/theme';
import { formatCallbackParams, getItems } from '@/utils';

const DATA = getItems(8);
const COLUMNS = 4;

export default function CallbacksExample() {
  const text = useSharedValue('Callback output will be displayed here');

  const onDragStart = useCallback<DragStartCallback>(
    params => {
      text.value = `onDragStart:${formatCallbackParams(params)}`;
    },
    [text]
  );

  const onDragEnd = useCallback<DragEndCallback>(
    params => {
      text.value = `onDragEnd:${formatCallbackParams(params)}`;
    },
    [text]
  );

  const onOrderChange = useCallback<OrderChangeCallback>(
    params => {
      text.value = `onOrderChange:${formatCallbackParams(params)}`;
    },
    [text]
  );

  const renderItem = useCallback<SortableGridRenderItem<(typeof DATA)[number]>>(
    ({ item }) => <GridCard>{item}</GridCard>,
    []
  );

  return (
    <View style={styles.container}>
      <Stagger wrapperStye={index => (index === 0 ? flex.fill : {})}>
        <Section title='Callback output' fill>
          <AnimatedText style={flex.fill} text={text} multiline />
        </Section>
        <Section
          description='Drag items around to see callbacks output'
          title='SortableGrid'>
          <Sortable.Grid
            columnGap={spacing.xs}
            columns={COLUMNS}
            data={DATA}
            renderItem={renderItem}
            rowGap={spacing.xs}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOrderChange={onOrderChange}
          />
        </Section>
      </Stagger>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height:
      Dimensions.get('window').height -
      (Platform.OS === 'ios' ? sizes.xxl : sizes.lg)
  }
});
