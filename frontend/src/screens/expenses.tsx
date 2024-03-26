import {FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/screen-header';
import ElevatedCard from '../components/ui/elevated-card';
import ListSeperator from '../components/ui/list-seperator';
import {BillingStackNavigatorParams} from '../navigation/billing-stack-navigation';
import ExpenseEditableItem from '../components/ui/expense-editable-item';
import AddExpenseItem from '../components/ui/add-expense-item';
import {useUser} from '../storage/use-user';
import client from '../API/client';
import {ioString} from '../API/io';
import {io} from 'socket.io-client';

type ExpensesProps = StackScreenProps<BillingStackNavigatorParams, 'Expenses'>;

const Expenses = ({}: ExpensesProps) => {
  const insets = useSafeAreaInsets();

  const [isAdding, setIsAdding] = useState(false);

  const {setSocket, socket, accessToken, type} = useUser(state => state);

  const [expenses, setExpenses] = useState<any[]>([]);
  const fetchExpense = async () => {
    try {
      const responce = await client.get(`${type}/expenses`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      setExpenses(responce.data.expenses.reverse());
    } catch (error) {}
  };

  useEffect(() => {
    fetchExpense();
    establishWebSocketConnection();
  }, []);

  const establishWebSocketConnection = () => {
    if (!socket) {
      const newSocket = io(ioString);
      setSocket(newSocket);
      console.log('creating new socket');
    }
    if (socket) {
      //expense
      socket.on('newExpense', (data: any) => {
        setExpenses(prevExpenses => [data, ...prevExpenses]);
      });
      socket.on('updateExpense', (data: any) => {
        const {oldId, expense_id ,username, amount, description, expense_date} = data;
        const newExpense = {expense_id,username, amount, description, expense_date};
        setExpenses(prevExpenses => {
          const filtered = prevExpenses.filter(
            item => item.expense_id != oldId,
          );
          return [newExpense, ...filtered];
        });
      });
      socket.on('deleteExpense', (data: any) => {
        const { deletedId } = data;
        setExpenses(prevExpenses => {
          const updatedExpenses = prevExpenses.filter(item => item.expense_id != deletedId);
          return updatedExpenses;
        });
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader>Expenses</ScreenHeader>
      <ElevatedCard
        onPress={() => setIsAdding(prevIsAdding => !prevIsAdding)}
        textStyle={styles.elevatedButtonText}
        style={styles.elevatedButtonStyle}>
        Add Expenses
      </ElevatedCard>
      {isAdding && <AddExpenseItem onSuccess={() => setIsAdding(false)} />}
      <View
        style={[styles.historyContainer, {marginBottom: insets.bottom + 25}]}>
        <View style={styles.whiteCardStyle}>
          <FlatList
            data={expenses}
            ItemSeparatorComponent={ListSeperator}
            renderItem={props => <ExpenseEditableItem {...props} />}
          />
        </View>
      </View>
    </View>
  );
};

export default Expenses;

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
