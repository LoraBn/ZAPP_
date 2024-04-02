import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import WhiteCard from './white-card';

interface OwnerHeaderProps {
  kwhPrice: string;
  profit: string;
}

const OwnerHeader: React.FC<OwnerHeaderProps> = ({ kwhPrice, profit }) => {
  return (
    <View style={styles.profitFeesContainer}>
      <Text style={styles.profitText}>Profit</Text>
      <WhiteCard style={styles.amountContainer}>
        <Text style={styles.amountText}>$ {profit ? profit : '0'} </Text>
      </WhiteCard>
      <Text style={styles.profitText}>Kwh Price</Text>
      <WhiteCard
        style={[styles.amountContainer, { backgroundColor: Colors.White }]}>
        <Text style={styles.amountText}>{kwhPrice}</Text>
      </WhiteCard>
    </View>
  );
};

export default OwnerHeader;

const styles = StyleSheet.create({
  profitFeesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderStyle: 'dotted',
    gap: 4,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profitText: { fontSize: 14, color: Colors.Black },
  amountText: { fontWeight: '400', fontSize: 14, color: Colors.Black },
  amountContainer: {
    marginTop: 15,
  },
});
