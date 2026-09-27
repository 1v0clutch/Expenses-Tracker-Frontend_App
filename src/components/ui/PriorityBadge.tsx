import { StyleSheet, Text, View } from 'react-native';
import type { Priority } from '@/types/expense';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <View style={[styles.badge, styles[priority]]}>
      <Text style={[styles.text, priority === 'Low' ? styles.textLow : styles.textDark]}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  High: {
    backgroundColor: '#000',
  },
  Medium: {
    backgroundColor: '#555',
  },
  Low: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  textDark: {
    color: '#fff',
  },
  textLow: {
    color: '#aaa',
  },
});
