import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export enum ExamplesScreenRoute {
  AutoScrollFlashListExample = 'AutoScrollFlashListExample',
  AutoScrollFlatListExample = 'AutoScrollFlatListExample',
  AutoScrollScrollViewExample = 'AutoScrollScrollViewExample',
  DropIndicatorExamples = 'DropIndicatorExamples',
  ExamplesList = 'ExamplesList',
  SortableCallbacks = 'SortableCallbacks',
  SortableFlexExamples = 'SortableFlexExamples',
  SortableGridExamples = 'SortableGridExamples'
}

export type ExamplesStackParamList = {
  [ExamplesScreenRoute.ExamplesList]: undefined;
  [ExamplesScreenRoute.SortableFlexExamples]: undefined;
  [ExamplesScreenRoute.SortableGridExamples]: undefined;
  [ExamplesScreenRoute.AutoScrollScrollViewExample]: undefined;
  [ExamplesScreenRoute.AutoScrollFlatListExample]: undefined;
  [ExamplesScreenRoute.DropIndicatorExamples]: undefined;
  [ExamplesScreenRoute.AutoScrollFlashListExample]: undefined;
  [ExamplesScreenRoute.SortableCallbacks]: undefined;
};

type CombinedNavigationProps = ExamplesStackParamList;

export type AppNavigation = NativeStackNavigationProp<CombinedNavigationProps>;

export const useAppNavigation = () => useNavigation<AppNavigation>();
