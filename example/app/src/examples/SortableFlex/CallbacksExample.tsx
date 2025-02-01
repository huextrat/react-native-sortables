import { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Sortable, {
  type DragEndCallback,
  type DragStartCallback,
  type OrderChangeCallback
} from 'react-native-sortables';

import { AnimatedText, FlexCell, Section, Stagger } from '@/components';
import { flex, sizes, spacing } from '@/theme';
import { formatCallbackParams, getCategories, IS_WEB } from '@/utils';

import { Screen } from '../../components/layout/Screen';

const DATA = getCategories(IS_WEB ? 14 : 9);

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

  return (
    <Screen style={styles.container}>
      <Stagger wrapperStye={index => (index === 0 ? flex.fill : {})}>
        <Section title='Callback output' fill>
          <AnimatedText style={flex.fill} text={text} multiline />
        </Section>
        <Section
          description='Drag items around to see callbacks output'
          title='SortableFlex'>
          <Sortable.Flex
            columnGap={spacing.sm}
            rowGap={spacing.xs}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOrderChange={onOrderChange}>
            {DATA.map(item => (
              <FlexCell key={item} size='large'>
                {item}
              </FlexCell>
            ))}
          </Sortable.Flex>
        </Section>
      </Stagger>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: Dimensions.get('window').height - sizes.xxl
  }
});
