import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import {
  SortableGrid,
  type SortableGridRenderItem
} from 'react-native-sortable';

import { Button, GridCard, Group, Section, Stagger } from '@/components';
import { colors, flex, spacing } from '@/theme';
import { getItems } from '@/utils';

const AVAILABLE_DATA = getItems(18);
const COLUMNS = 3;

export default function DataChangeExample() {
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const [data, setData] = useState(AVAILABLE_DATA.slice(0, 6));

  const getNewItemName = useCallback(() => {
    if (data.length >= AVAILABLE_DATA.length) {
      return null;
    }
    for (const item of AVAILABLE_DATA) {
      if (!data.includes(item)) {
        return item;
      }
    }
    return null;
  }, [data]);

  const prependItem = useCallback(() => {
    setData(prevData => {
      const newItem = getNewItemName();
      if (newItem) {
        return [newItem, ...prevData];
      }
      return prevData;
    });
  }, [getNewItemName]);

  const insertItem = useCallback(() => {
    setData(prevData => {
      const newItem = getNewItemName();
      if (newItem) {
        const index = Math.floor(Math.random() * (prevData.length - 1));
        return [...prevData.slice(0, index), newItem, ...prevData.slice(index)];
      }
      return prevData;
    });
  }, [getNewItemName]);

  const appendItem = useCallback(() => {
    setData(prevData => {
      const newItem = getNewItemName();
      if (newItem) {
        return [...prevData, newItem];
      }
      return prevData;
    });
  }, [getNewItemName]);

  const shuffleItems = useCallback(() => {
    setData(prevData => {
      const shuffledData = [...prevData];
      for (let i = shuffledData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledData[i], shuffledData[j]] = [
          shuffledData[j]!,
          shuffledData[i]!
        ];
      }
      return shuffledData;
    });
  }, []);

  const sortItems = useCallback(() => {
    setData(prevData => [...prevData].sort());
  }, []);

  const onRemoveItem = useCallback((item: string) => {
    setData(prevData => prevData.filter(i => i !== item));
  }, []);

  const renderItem = useCallback<SortableGridRenderItem<string>>(
    ({ item }) => (
      <Pressable
        onPress={() => {
          onRemoveItem(item);
        }}>
        <GridCard>{item}</GridCard>
      </Pressable>
    ),
    [onRemoveItem]
  );

  const additionDisabled = data.length >= AVAILABLE_DATA.length;
  const reorderDisabled = data.length < 2;

  const menuSections = [
    {
      buttons: [
        { disabled: additionDisabled, onPress: prependItem, title: 'Prepend' },
        { disabled: additionDisabled, onPress: insertItem, title: 'Insert' },
        { disabled: additionDisabled, onPress: appendItem, title: 'Append' }
      ],
      description: 'Prepend/Insert/Append items to the list',
      title: 'Modify number of items'
    },
    {
      buttons: [
        { disabled: reorderDisabled, onPress: shuffleItems, title: 'Shuffle' },
        { disabled: reorderDisabled, onPress: sortItems, title: 'Sort' }
      ],
      description: 'Reorder items in the list',
      title: 'Change order of items'
    }
  ];

  return (
    // Need to set flex: 1 for the ScrollView parent component in order
    // to ensure that it occupies the entire available space
    <Stagger wrapperStye={index => (index === 2 ? flex.fill : {})}>
      {menuSections.map(({ buttons, description, title }) => (
        <Section description={description} key={title} title={title}>
          <View style={styles.row}>
            {buttons.map(btnProps => (
              <Button {...btnProps} key={btnProps.title} />
            ))}
          </View>
        </Section>
      ))}

      <Group style={[flex.fill, styles.scrollViewGroup]}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollViewContent}
          ref={scrollableRef}
          style={styles.scrollView}>
          <Group withMargin={false} bordered center>
            <Text style={styles.title}>Above SortableGrid</Text>
          </Group>

          <SortableGrid
            columnGap={spacing.sm}
            columns={COLUMNS}
            data={data}
            renderItem={renderItem}
            rowGap={spacing.xs}
            scrollableRef={scrollableRef}
          />

          <Group withMargin={false} bordered center>
            <Text style={styles.title}>Below SortableGrid</Text>
          </Group>
        </Animated.ScrollView>
      </Group>
    </Stagger>
  );
}

const styles = StyleSheet.create({
  row: {
    columnGap: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs
  },
  scrollView: {
    flex: 1
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
    color: colors.foreground3,
    fontSize: 16,
    fontWeight: 'bold'
  }
});
