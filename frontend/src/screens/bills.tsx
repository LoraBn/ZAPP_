import {SectionList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/screen-header';
import ListSeperator from '../components/ui/list-seperator';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import {DUMMY_BILLS} from './bills-nav-page';
import {getMonthAndYear} from '../utils/date-utils';
import BillsItem from '../components/ui/bills-item';
import client from '../API/client';
import {useUser} from '../storage/use-user';
import {Bill} from './user-details-screen';

type ExpensesProps = StackScreenProps<BillingStackNavigatorParams, 'Bills'>;

function formatBillsSections(bills: Bill[]) {
  let finalBills: {data: Bill[]; title: string}[] = [];

  let dates: Record<string, number> = {};

  for (let i = 0; i < bills.length; i++) {
    const monthAndYear = getMonthAndYear(new Date(bills[i].billing_date));
    const monthAndYearFromHashMap = dates[monthAndYear];

    if (monthAndYearFromHashMap !== undefined) {
      finalBills[monthAndYearFromHashMap].data.push(bills[i]);
    } else {
      dates[monthAndYear] = finalBills.length;
      finalBills.push({data: [bills[i]], title: monthAndYear});
    }
  }

  return finalBills;
}

const Expenses = ({}) => {
  const insets = useSafeAreaInsets();

  const {type, accessToken} = useUser(state => state);

  const [bills, setBills] = useState<any>([]);

  const fetchAllBills = async () => {
    try {
      const responce = await client.get(`/${type}/bills`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce) {
        const formated = formatBillsSections(responce.data.bills);
        setBills(formated);
        console.log(bills);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllBills();
  }, []);

  return (
    <View style={styles.screen}>
      <ScreenHeader>Bills</ScreenHeader>
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.whiteCardStyle}>
          {bills.length > 0 ? (
            <SectionList
              sections={bills}
              ItemSeparatorComponent={ListSeperator}
              renderSectionHeader={({section: {title}}) => (
                <Text style={styles.text}>{title}</Text>
              )}
              renderItem={props => <BillsItem {...props} />}
            />
          ) : (
            <Text>No bills available</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {color: Colors.Black, textAlign: 'center', fontSize: 21, padding: 10},
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

export default Expenses;
