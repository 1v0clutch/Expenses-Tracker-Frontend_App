import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { palette } from '@/constants/spendly-theme';

export default function AppTabs() {
 return <NativeTabs backgroundColor={palette.panel} indicatorColor={palette.purpleDark} tintColor={palette.purple} labelStyle={{default:{color:palette.muted,fontSize:9,fontWeight:'600'},selected:{color:palette.purple,fontSize:9,fontWeight:'800'}}}>
  <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="dashboard"/></NativeTabs.Trigger>
  <NativeTabs.Trigger name="expenses"><NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="list.bullet.rectangle.fill" md="receipt_long"/></NativeTabs.Trigger>
  <NativeTabs.Trigger name="planned"><NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="chart.pie.fill" md="pie_chart"/></NativeTabs.Trigger>
  <NativeTabs.Trigger name="cashflow"><NativeTabs.Trigger.Label>Cashflow</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart"/></NativeTabs.Trigger>
  <NativeTabs.Trigger name="account"><NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="account_circle"/></NativeTabs.Trigger>
 </NativeTabs>;
}
