import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {Colors} from '../utils/colors';
import Card from '../components/ui/card';
import ScreenHeader from '../components/ui/screen-header';
import {BarChart, LineChart} from 'react-native-gifted-charts';

const AnalyticsScreen = () => {
  const [width, setWidth] = useState(0);

  const barData = [
    {value: 1.5, label: 'A', frontColor: '#3373a1'},
    {value: 3, label: 'B', frontColor: '#e1812b'},
    {value: 4.5, label: 'C', frontColor: '#3a923b'},
    {value: 2, label: 'D', frontColor: '#bf3d3d'},
    {value: 5, label: 'E', frontColor: '#9272b1'},
  ];

  const data = [
    {value: 15},
    {value: 30},
    {value: 26},
    {value: 40},
    {value: 43},
    {value: 46},
  ];

  return (
    <View style={styles.screen}>
      <ScreenHeader>Analytics</ScreenHeader>
      <ScrollView contentContainerStyle={styles.containerStyle}>
        <Card
          onLayout={({
            nativeEvent: {
              layout: {width: wid},
            },
          }) => {
            setWidth(wid);
          }}>
          <Text style={styles.analyticsText}>Voltage Graph</Text>
          <LineChart
            data={data}
            color={Colors.Red}
            thickness={0.5}
            dataPointsColor={'red'}
          />
          <View style={styles.graphTexts}>
            <Text style={styles.text}>Current Value Hours: 102</Text>
            <Text style={styles.text}>Average Value: 224</Text>
          </View>
        </Card>
        <Card
          onLayout={({
            nativeEvent: {
              layout: {width: wid},
            },
          }) => {
            setWidth(wid);
          }}>
          <Text style={styles.analyticsText}>Current Graph</Text>
          <LineChart
            data={data}
            color={Colors.Red}
            thickness={0.5}
            dataPointsColor={'red'}
          />
          <View style={styles.graphTexts}>
            <Text style={styles.text}>Current Value Hours: 102</Text>
            <Text style={styles.text}>Average Value: 224</Text>
          </View>
        </Card>
        <Card
          onLayout={({
            nativeEvent: {
              layout: {width: wid},
            },
          }) => {
            setWidth(wid);
          }}>
          <Text style={styles.analyticsText}>Uptime Graph</Text>
          <BarChart data={barData} width={width - 120} maxValue={5} />
          <Text style={styles.uptimeText}>Uptime Hours: 102</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  text: {
    color: Colors.Black,
    fontWeight: '700',
    paddingVertical: 15,
    fontSize: 10,
  },
  screen: {flex: 1, backgroundColor: Colors.Background, gap: 25},
  dummyView: {height: 200},
  containerStyle: {paddingHorizontal: 15, paddingBottom: 40, gap: 25},
  analyticsText: {
    textAlign: 'center',
    color: Colors.Black,
    elevation: 4,
    fontSize: 24,
    fontWeight: '700',
  },
  uptimeText: {
    color: Colors.Black,
    fontWeight: '700',
    paddingLeft: 15,
    paddingVertical: 15,
  },
  graphTexts: {flexDirection: 'row', justifyContent: 'space-between'},
});
