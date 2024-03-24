import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import ScreenHeader from '../components/ui/screen-header';
import Card from '../components/ui/card';
import {DUMMY_BILLS} from './bills-nav-page';
import BillListItem from '../components/ui/bill-list-item';
import ListSeperator from '../components/ui/list-seperator';

type DUMMY_FILTERS = string[];

const DUMMY_FILT = ['Pending', 'Paid', 'Date'];

const BillingHistory = () => {
  const [filters, setFilters] = useState<DUMMY_FILTERS>([]);

  return (
    <View style={styles.screen}>
      <ScreenHeader>Billing History</ScreenHeader>
      <View style={styles.empUsersContainer}>
        {DUMMY_FILT.map(filt => (
          <Card
            onPress={() => {
              const alreadyInFilters = filters.find(filter => filter === filt);

              if (alreadyInFilters) {
                const newFilters = filters.filter(filter => filter !== filt);

                return setFilters(newFilters);
              }

              return setFilters([...filters, filt]);
            }}
            key={filt}
            style={styles.cardContainer}
            selected={!!filters.find(filter => filter === filt)}>
            <Text style={styles.text}>{filt}</Text>
          </Card>
        ))}
      </View>
      <FlatList
        data={DUMMY_BILLS}
        ItemSeparatorComponent={ListSeperator}
        contentContainerStyle={styles.flatlistContentContainer}
        renderItem={props => <BillListItem {...props} />}
        // eslint-disable-next-line react/no-unstable-nested-components
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            <ScreenHeader inverted>Overall Results</ScreenHeader>
            <Card style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                Avg Consumption Per Month: 50kwh
              </Text>
              <Text style={styles.resultsText}>Avg Bill: 50kwh</Text>
              <Text style={styles.resultsText}>Total Consumed: 50kwh</Text>
            </Card>
          </View>
        )}
      />
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
