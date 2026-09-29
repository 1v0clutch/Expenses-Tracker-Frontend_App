import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { palette } from '@/constants/spendly-theme';

const tabs = [['index','/','▦','Home'],['expenses','/expenses','↗','Expenses'],['planned','/planned','◷','Plan'],['cashflow','/cashflow','⌁','Cashflow'],['account','/account','◉','Account']] as const;
export default function AppTabs() { return <Tabs><TabSlot style={{flex:1}}/><TabList style={s.bar}>{tabs.map(([name,href,icon,label])=><TabTrigger key={name} name={name} href={href as never} asChild><TabButton icon={icon} label={label}/></TabTrigger>)}</TabList></Tabs>; }
function TabButton({isFocused,icon,label,...props}:TabTriggerSlotProps & {icon:string;label:string;children?:ReactNode}){return <Pressable {...props} style={[s.button,isFocused&&s.active]}><Text style={[s.icon,isFocused&&s.selected]}>{icon}</Text><Text style={[s.label,isFocused&&s.selected]}>{label}</Text></Pressable>}
const s=StyleSheet.create({bar:{position:'absolute',left:12,right:12,bottom:12,height:61,borderRadius:18,backgroundColor:palette.panel,borderColor:palette.border,borderWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingHorizontal:4},button:{flex:1,height:49,alignItems:'center',justifyContent:'center',gap:2,borderRadius:13},active:{backgroundColor:palette.purpleWash},icon:{fontSize:15,color:palette.muted},label:{fontSize:8,color:palette.muted},selected:{color:palette.purple,fontWeight:'800'},});

