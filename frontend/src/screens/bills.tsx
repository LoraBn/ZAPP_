import {SectionList, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Colors} from '../utils/colors';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/screen-header';
import ListSeperator from '../components/ui/list-seperator';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import {Bill, DUMMY_BILLS} from './bills-nav-page';
import {getMonthAndYear} from '../utils/date-utils';
import BillsItem from '../components/ui/bills-item';

type ExpensesProps = StackScreenProps<BillingStackNavigatorParams, 'Bills'>;

function formatBillsSections(bills: Bill[]) {
  let finalBills: {data: Bill[]; title: string}[] = [];

  let dates: Record<string, number> = {};

  let index = 0;

  for (let i = 0; i < bills.length; i++) {
    const monthAndYear = getMonthAndYear(bills[i].date);

    const monthAndYearFromHashMap = dates[monthAndYear];

    if (monthAndYearFromHashMap !== undefined) {
      finalBills[monthAndYearFromHashMap]?.data.push(bills[i]);
    } else {
      dates[monthAndYear] = index;
      finalBills[index] = {data: [bills[i]], title: monthAndYear};
      index++;
    }
  }

  return finalBills;
}

const Expenses = ({}: ExpensesProps) => {
  const insets = useSafeAreaInsets();

  const bills = formatBillsSections(DUMMY_BILLS);

  return (
    <View style={styles.screen}>
      <ScreenHeader>Bills</ScreenHeader>
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.whiteCardStyle}>
          <SectionList
            sections={bills}
            ItemSeparatorComponent={ListSeperator}
            renderSectionHeader={({section: {title}}) => (
              <Text style={styles.text}>{title}</Text>
            )}
            renderItem={props => <BillsItem {...props} />}
          />
        </View>
      </View>
    </View>
  );
};

export default Expenses;

const styles = StyleSheet.create({
  text: {color: Colors.Black, textAlign: 'center', fontSize: 16},
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
