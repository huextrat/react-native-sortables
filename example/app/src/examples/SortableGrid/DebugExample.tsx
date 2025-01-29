import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';

import {
  Button,
  GridCard,
  Group,
  OptionGroup,
  Section,
  Stagger
} from '@/components';
import { colors, flex, sizes, spacing, style, text } from '@/theme';
import { getItems } from '@/utils';

const DATA = getItems(12);
const COLUMNS = 3;

export default function DebugExample() {
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();

  const [debugEnabled, setDebugEnabled] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const renderItem = useCallback<SortableGridRenderItem<string>>(
    ({ item }) => <GridCard>{item}</GridCard>,
    []
  );

  return (
    <View style={[flex.fill, style.contentContainer]}>
      <Stagger wrapperStye={index => (index === 3 ? flex.fill : {})}>
        <Section
          description='Press the buttons to change settings'
          title='Settings'
        />

        <OptionGroup
          label='Debug'
          value={debugEnabled ? 'Enabled' : 'Disabled'}>
          <Button
            style={styles.button}
            title={debugEnabled ? 'Disable' : 'Enable'}
            onPress={() => setDebugEnabled(prev => !prev)}
          />
        </OptionGroup>

        <OptionGroup
          label='Auto Scroll'
          value={autoScrollEnabled ? 'Enabled' : 'Disabled'}>
          <Button
            style={styles.button}
            title={autoScrollEnabled ? 'Disable' : 'Enable'}
            onPress={() => setAutoScrollEnabled(prev => !prev)}
          />
        </OptionGroup>

        <Group style={[flex.fill, styles.scrollViewGroup]}>
          <Animated.ScrollView
            // We set key here to dismiss the property change on the fly warning
            // (scrollableRef and debug properties of the sortable component
            // shouldn't be changed on the fly)
            contentContainerStyle={styles.scrollViewContent}
            key={2 * +debugEnabled + +autoScrollEnabled}
            ref={scrollableRef}
            style={flex.fill}>
            <Group style={styles.boundGroup} withMargin={false} bordered center>
              <Text style={styles.title}>Above SortableGrid</Text>
            </Group>

            <Sortable.Grid
              columnGap={spacing.sm}
              columns={COLUMNS}
              data={DATA}
              debug={debugEnabled}
              renderItem={renderItem}
              rowGap={spacing.xs}
              scrollableRef={autoScrollEnabled ? scrollableRef : undefined}
            />

            <Group style={styles.boundGroup} withMargin={false} bordered center>
              <Text style={styles.title}>Below SortableGrid</Text>
            </Group>
          </Animated.ScrollView>
        </Group>
      </Stagger>
    </View>
  );
}

const styles = StyleSheet.create({
  boundGroup: {
    height: 100
  },
  button: {
    alignItems: 'center',
    width: sizes.xl
  },
  scrollViewContent: {
    gap: spacing.sm,
    padding: spacing.sm
  },
  scrollViewGroup: {
    overflow: 'hidden',
    paddingHorizontal: spacing.none,
    paddingVertical: spacing.none
  },
  title: {
    ...text.subHeading2,
    color: colors.foreground3
  }
});
