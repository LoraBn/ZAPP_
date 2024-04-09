import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../utils/colors';
import Card from '../components/ui/card';
import ScreenHeader from '../components/ui/screen-header';
import {BarChart, LineChart, PieChart} from 'react-native-gifted-charts';
import {useUser} from '../storage/use-user';
import client from '../API/client';

type AnalyticsData = {
  total_amount_billed: number;
  total_kwh_consumed: number;
  total_bills: string;
  average_bill_amount: number;
  billing_trends: {
    billing_month: string;
    total_amount_billed: number;
  }[];
  billing_cycle_comparison: {
    billing_month: string;
    total_billing_cycles: string;
    average_billing_amount: number;
  }[];
  plan_pricing_analysis: {
    plan_name: string;
    total_bills: string;
    total_amount_billed: number;
  }[];
  total_expenses: {
    expense_month: string;
    total_expenses: string;
  }[];
};

type ScheduleItem = {
  id: string;
  time_to_turn_on: string;
  time_to_turn_off: string;
};

type Schedule = {
  schedule_id: string;
  owner_id: number;
  schedule: ScheduleItem[];
};

type ScheduleData = {
  schedule: Schedule[];
};

const AnalyticsScreen = () => {
  const [width, setWidth] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const {type, accessToken} = useUser(state => state);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  useEffect(() => {
    fetchSchedule();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await client.get<AnalyticsData>(
        `/${type}/analytics/bills`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response && response.data) {
        setAnalyticsData(response.data);
      }
      else{
        return;
      }
    } catch (error) {
      console.log(error);
      return
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await client.get<ScheduleData>(
        `/${type}/electric-schedule`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response && response.data) {
        setScheduleData(response.data);
      }
      else {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const calculateTimeDifference = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMilliseconds = Math.abs(end.getTime() - start.getTime());
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    return diffInHours;
  };

  const renderPieChart = () => {
    if (!scheduleData || !scheduleData.schedule) {
      return null; 
    }
  
    const totalHoursInDay = 24;
  
   
    const data = [];
  
  
    const colorPattern = ['pink', 'orange', "purple" ];
  
    // Iterate over each schedule item
    let totalTimeSpent = 0;
    scheduleData.schedule.forEach((schedule) => {
      schedule.schedule.forEach((scheduleItem,index) => {
        const timeDifference = calculateTimeDifference(
          scheduleItem.time_to_turn_on,
          scheduleItem.time_to_turn_off,
        );
  
        totalTimeSpent += timeDifference;
  
        const percentage = (timeDifference / totalHoursInDay) * 100;
  
        // Assign color based on the pattern
        const color = colorPattern[index % colorPattern.length];
  
        // Push the data for the current schedule item to the data array
        data.push({
          value: percentage,
          label: `Schedule ${index + 1}`, // Adjust index for 1-based indexing
          color: color,
        });
      });
    });
  
    // Calculate the remaining available time in the day
    const remainingTime = totalHoursInDay - totalTimeSpent;
    const remainingPercentage = (remainingTime / totalHoursInDay) * 100;
  
    // Push the remaining time data to the array
    data.push({
      value: remainingPercentage,
      label: 'Remaining Time',
      color: 'green',
    });
  
    return (
      <View style={styles.PiechartContainer}>
        <Text style={styles.analyticsText}>
          Total Time Difference per Schedule (Percentage of 24 hours)
        </Text>
        <PieChart data={data} />
        <Text>Total Covered Time is: {Math.ceil(totalTimeSpent)} hours</Text>
        
        <Text>Green is the uncovered time</Text>
      </View>
    );
  };
  
  const renderBarChart = (
    data: {value: number; label?: string}[],
    label: string,
    description: string,
  ) => (
    <View style={styles.chartContainer}>
      <Text style={styles.analyticsText}>{label}</Text>
      <BarChart data={data} width={width - 120} />
      <Text style={styles.chartDescription}>{description}</Text>
    </View>
  );

  const renderLineChart = (
    data: {value: number; label?: string}[],
    label: string,
    description: string,
  ) => (
    <View style={styles.chartContainer}>
      <Text style={styles.analyticsText}>{label}</Text>
      <LineChart data={data}/>
      <Text style={styles.chartDescription}>{description}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader>Analytics</ScreenHeader>
      <ScrollView contentContainerStyle={styles.containerStyle}>
        {analyticsData && (
          <>
            <Card
              onLayout={({
                nativeEvent: {
                  layout: {width: wid},
                },
              }) => setWidth(wid)}>
              {renderLineChart(
                analyticsData.billing_trends.map(item => ({
                  value: item.total_amount_billed,
                  label: item.billing_month.split('-')[1],
                })), // Extracting month part
                'Billing Trends',
                'Shows the trend of total amount billed over time',
              )}
            </Card>
            {scheduleData && (
              <Card
                onLayout={({
                  nativeEvent: {
                    layout: {width: wid},
                  },
                }) => setWidth(wid)}>
                {renderPieChart()}
              </Card>
            )}
            <Card
              onLayout={({
                nativeEvent: {
                  layout: {width: wid},
                },
              }) => setWidth(wid)}>
              {renderBarChart(
                analyticsData.billing_cycle_comparison.map(item => ({
                  value: parseInt(item.total_billing_cycles),
                  label: item.billing_month,
                })), // Extracting month part
                'Billing Cycle Comparison',
                'Compares the billing cycles between different months',
              )}
            </Card>
            <Card
              onLayout={({
                nativeEvent: {
                  layout: {width: wid},
                },
              }) => setWidth(wid)}>
              {renderBarChart(
                analyticsData.plan_pricing_analysis.map(item => ({
                  value: parseInt(item.total_bills),
                  label: item.plan_name,
                })),
                'Plan Pricing Analysis',
                'Analyzes the total bills for different plans',
              )}
            </Card>
            <Card
              onLayout={({
                nativeEvent: {
                  layout: {width: wid},
                },
              }) => setWidth(wid)}>
              {renderLineChart(
                analyticsData.total_expenses.map(item => ({
                  value: parseInt(item.total_expenses),
                  label: item.expense_month.split('-')[1],
                })), // Extracting month part
                'Total Expenses',
                'Displays the total expenses over time',
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Colors.Background, padding: 15},
  PiechartContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 18
  },
  containerStyle: {paddingBottom: 40, gap: 25},
  analyticsText: {
    textAlign: 'center',
    color: Colors.Black,
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {marginBottom: 20},
  chartDescription: {
    textAlign: 'center',
    color: Colors.Black,
    fontSize: 14,
    marginTop: 10,
  },
});
