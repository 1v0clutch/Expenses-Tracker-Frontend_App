import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useExpensesContext } from '@/context/ExpensesContext';
import { PRIORITY_ORDER } from '@/types/expense';

function fmt(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardScreen() {
  const { expenses, planned, income } = useExpensesContext();

  const thisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const incomeThisMonth = useMemo(() => income.filter(item => { const d = new Date(item.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((sum, item) => sum + item.amount, 0), [income]);
  const thisWeek = useMemo(() => expenses.filter(item => Date.now() - new Date(item.date).getTime() < 7 * 24 * 60 * 60 * 1000).reduce((sum, item) => sum + item.amount, 0), [expenses]);

  const recent = useMemo(() => expenses.slice(0, 3), [expenses]);

  const highPriority = useMemo(
    () =>
      planned
        .filter(p => p.priority === 'High')
        .sort((a, b) => {
          const po = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          if (po !== 0) return po;
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }),
    [planned]
  );

  const stats = [
    { label: 'Balance this month', value: fmt(incomeThisMonth - thisMonth) },
    { label: 'Income this month', value: fmt(incomeThisMonth) },
    { label: 'Monthly spending', value: fmt(thisMonth) },
    { label: 'This week', value: fmt(thisWeek) },
    { label: 'Planned', value: String(planned.length) },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Your financial overview</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Stat Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity accessibilityRole="link">
              <Text style={styles.sectionLink}>See all →</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No expenses yet.</Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recent.map(e => (
                <View key={e.id} style={styles.recentItem}>
                  <View style={styles.recentLeft}>
                    <Text style={styles.recentName}>{e.name}</Text>
                    <Text style={styles.recentMeta}>
                      {e.category} · {fmtDate(e.date)}
                    </Text>
                  </View>
                  <Text style={styles.recentAmount}>{fmt(e.amount)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* High Priority */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>High Priority</Text>
            <TouchableOpacity accessibilityRole="link">
              <Text style={styles.sectionLink}>See all →</Text>
            </TouchableOpacity>
          </View>

          {highPriority.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No high priority items.</Text>
            </View>
          ) : (
            <View style={styles.priorityList}>
              {highPriority.map(p => (
                <View key={p.id} style={styles.priorityItem}>
                  <View style={styles.priorityLeft}>
                    <PriorityBadge priority={p.priority} />
                    <View style={styles.priorityInfo}>
                      <Text style={styles.priorityName}>{p.name}</Text>
                      <Text style={styles.priorityMeta}>
                        {p.category}
                        {p.dueDate ? ` · Due ${fmtDate(p.dueDate)}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.priorityAmount}>{fmt(p.amount)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSafe: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 2,
  },
  scroll: {
    paddingTop: 20,
  },
  // Stats
  statsRow: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  statCard: {
    width: 150,
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.4,
  },
  // Sections
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLink: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '500',
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#ccc',
  },
  // Recent list
  recentList: {
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 8,
  },
  recentLeft: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  recentMeta: {
    fontSize: 12,
    color: '#aaa',
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  // Priority list
  priorityList: {
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  priorityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  priorityInfo: {
    flex: 1,
    gap: 2,
  },
  priorityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  priorityMeta: {
    fontSize: 12,
    color: '#aaa',
  },
  priorityAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    flexShrink: 0,
  },
});
