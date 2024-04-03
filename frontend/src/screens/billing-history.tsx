import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import Card from '../components/ui/card';
import BillListItem from '../components/ui/bill-list-item';
import ListSeperator from '../components/ui/list-seperator';
import {Bill} from './user-details-screen';
import {useUser} from '../storage/use-user';
import client from '../API/client';

type DUMMY_FILTERS = string[];

const BillingHistory = () => {

  const [bills, setBills] = useState<Bill>();

  const {type, accessToken} = useUser(state => state);

  useEffect(() => {
    fetchAllBills();
  }, []);

  const fetchAllBills = async () => {
    try {
      const responce = await client.get(`/${type}/bills`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      if (responce) {
        setBills(responce.data.bills);
        calculateBillsAverage(responce.data.bills);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [totalKwh, setTotalKwh] = useState<any>('No Value');
  const [averageBill, setAverageBill] = useState<any>('No Value');
  const [averageKwh, setAverageKwh] = useState<any>('No Value');

  const calculateBillsAverage = (bills: Bill[]) => {
    if (bills) {
      const totals = bills.reduce(
        (acc, bill) => {
          acc.totalKwh += parseFloat(bill.total_kwh);
          acc.totalAmount += parseFloat(bill.total_amount);
          return acc;
        },
        {totalKwh: 0, totalAmount: 0},
      );

      // Calculate average kWh consumption per month
      const averageKwh = totals.totalKwh / bills.length;

      // Calculate average bill amount
      const averageBill = totals.totalAmount / bills.length;

      setAverageKwh(averageKwh.toFixed(1));
      setAverageBill(averageBill.toFixed(1));
      setTotalKwh(totals.totalKwh.toFixed(0));

      // Output the results (you can modify this part according to your UI)
      console.log('Avg Consumption Per Month:', averageKwh.toFixed(2), 'kWh');
      console.log('Avg Bill:', averageBill.toFixed(2), 'USD');
      console.log('Total Consumed:', totals.totalKwh.toFixed(2), 'kWh');
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader>Billing History</ScreenHeader>
      <View style={styles.empUsersContainer}>
        <Text></Text>
      </View>
      {bills && (
        <FlatList
          data={bills}
          ItemSeparatorComponent={ListSeperator}
          contentContainerStyle={styles.flatlistContentContainer}
          renderItem={props => <BillListItem {...props} />}
          // eslint-disable-next-line react/no-unstable-nested-components
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <ScreenHeader inverted>Overall Results</ScreenHeader>
              <Card style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                  Avg kwh Per Month: {averageKwh} kwh
                </Text>
                <Text style={styles.resultsText}>
                  Avg Bill: {averageBill} $
                </Text>
                <Text style={styles.resultsText}>
                  Total Consumed: {totalKwh} kwh
                </Text>
              </Card>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default BillingHistory;

const styles = StyleSheet.create({
  flatlistContentContainer: {paddingHorizontal: 15},
  footerContainer: {paddingTop: 20},
  resultsText: {
    color: Colors.Black,
    fontWeight: '700',
    fontSize: 18,
  },
  resultsContainer: {
    gap: 15,
    padding: 12,
  },
  screen: {flex: 1, backgroundColor: Colors.Background},
  empUsersContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  text: {
    color: Colors.Black,
    fontSize: 11,
    lineHeight: 11 * 1.3,
    fontWeight: '700',
  },
  cardContainer: {
    paddingVertical: 1,
  },
});
