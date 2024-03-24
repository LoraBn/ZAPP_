import {FlatList, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/screen-header';
import ElevatedCard from '../components/ui/elevated-card';
import ListSeperator from '../components/ui/list-seperator';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import SubscriptionEditableItem from '../components/ui/subscription-editable-item';
import {DUMMY_PLANS} from './bills-nav-page';
import AddSubscriptionItem from '../components/ui/add-subscription-item';

type SubscriptionPlansProps = StackScreenProps<
  BillingStackNavigatorParams,
  'SubscriptionPlans'
>;

const SubscriptionPlans = ({}: SubscriptionPlansProps) => {
  const insets = useSafeAreaInsets();

  const [isAdding, setIsAdding] = useState(false);

  return (
    <View style={styles.screen}>
      <ScreenHeader>Subscription Plans</ScreenHeader>
      <ElevatedCard
        onPress={() => setIsAdding(prevIsAdding => !prevIsAdding)}
        textStyle={styles.elevatedButtonText}
        style={styles.elevatedButtonStyle}>
        Add Plan
      </ElevatedCard>
      {isAdding && <AddSubscriptionItem onSuccess={() => setIsAdding(false)} />}
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.whiteCardStyle}>
          <FlatList
            data={DUMMY_PLANS}
            ItemSeparatorComponent={ListSeperator}
            renderItem={props => <SubscriptionEditableItem {...props} />}
          />
        </View>
      </View>
    </View>
  );
};

export default SubscriptionPlans;

const styles = StyleSheet.create({
  whiteCardStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.Gray,
    borderRadius: 25,
  },
  elevatedButtonText: {fontSize: 16, fontWeight: '700', color: Colors.White},
  elevatedButtonStyle: {alignSelf: 'center'},
  screen: {
    flex: 1,
    backgroundColor: Colors.Background,
    paddingHorizontal: 15,
    gap: 25,
  },
  historyContainer: {
    backgroundColor: Colors.VeryLightBlue,
    padding: 25,
    borderRadius: 25,
    flex: 1,
  },
  historyTitle: {
    color: Colors.White,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 24 * 1.2,
  },
  historyTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
  },
  plusContainer: {
    backgroundColor: Colors.Blue,
    borderRadius: 100,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
