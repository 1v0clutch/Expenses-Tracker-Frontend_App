import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpensesContext } from "@/context/ExpensesContext";
import type { Income } from "@/types/expense";

const fmt = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sameMonth = (d: string) => {
  const date = new Date(d),
    now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};
export default function CashflowScreen() {
  const { income, expenses, addIncome, deleteIncome } = useExpensesContext();
  const [name, setName] = useState(""),
    [amount, setAmount] = useState(""),
    [source, setSource] = useState("Salary");
  const earned = income
      .filter((i) => sameMonth(i.date))
      .reduce((s, i) => s + i.amount, 0),
    spent = expenses
      .filter((e) => sameMonth(e.date))
      .reduce((s, e) => s + e.amount, 0),
    max = Math.max(earned, spent, 1);
  function add() {
    if (!name.trim() || Number(amount) <= 0) {
      Alert.alert(
        "Check your entry",
        "Enter an income source and an amount above zero.",
      );
      return;
    }
    addIncome({
      name: name.trim(),
      amount: Number(amount),
      source,
      date: new Date().toISOString().slice(0, 10),
    });
    setName("");
    setAmount("");
  }
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Cashflow</Text>
          <Text style={styles.sub}>Income and spending this month</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.label}>NET CASHFLOW</Text>
          <Text style={styles.net}>{fmt(earned - spent)}</Text>
          <Text style={styles.hint}>
            {earned >= spent
              ? "More money in than out"
              : "Expenses are above income"}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Income vs. expenses</Text>
          <Text style={styles.cardSub}>Current month</Text>
          {[
            [`Income · ${fmt(earned)}`, earned, "#7658ed"],
            [`Expenses · ${fmt(spent)}`, spent, "#ed7c83"],
          ].map(([label, value, color]) => (
            <View key={String(label)} style={styles.barRow}>
              <Text style={styles.barLabel}>{label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${(Number(value) / max) * 100}%`,
                      backgroundColor: String(color),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add income</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Income source"
          />
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="decimal-pad"
          />
          <View style={styles.sourceRow}>
            {["Salary", "Freelance", "Other"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.sourceChip,
                  source === item && styles.sourceSelected,
                ]}
                onPress={() => setSource(item)}
              >
                <Text
                  style={[
                    styles.sourceText,
                    source === item && styles.selectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={add}>
            <Text style={styles.addText}>Add income</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Income history</Text>
          {income.length ? (
            income.map((item: Income) => (
              <View style={styles.incomeRow} key={item.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>
                    {item.source} · {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>+{fmt(item.amount)}</Text>
                <TouchableOpacity onPress={() => deleteIncome(item.id)}>
                  <Text style={styles.remove}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>
              Add your salary or freelance earnings to see cashflow history.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7fb" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#171827" },
  sub: { fontSize: 13, color: "#9296a5", marginTop: 3 },
  content: { padding: 16, gap: 13, paddingBottom: 120 },
  summary: { backgroundColor: "#7659ed", borderRadius: 16, padding: 20 },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#e5dcff",
  },
  net: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 9 },
  hint: { fontSize: 11, color: "#e7deff", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 17,
    borderWidth: 1,
    borderColor: "#ececf2",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#1d2030" },
  cardSub: { fontSize: 11, color: "#9296a5", marginTop: 3 },
  barRow: { marginTop: 17 },
  barLabel: { fontSize: 11, color: "#606779", marginBottom: 7 },
  track: {
    height: 10,
    backgroundColor: "#f0eff5",
    borderRadius: 10,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 10 },
  input: {
    height: 43,
    borderWidth: 1,
    borderColor: "#e8e8ee",
    borderRadius: 9,
    paddingHorizontal: 12,
    marginTop: 11,
    fontSize: 13,
  },
  sourceRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  sourceChip: {
    borderWidth: 1,
    borderColor: "#e8e8ee",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sourceSelected: { backgroundColor: "#f1edff", borderColor: "#d8ccff" },
  sourceText: { fontSize: 11, color: "#747b8c" },
  selectedText: { color: "#7658ed", fontWeight: "700" },
  addButton: {
    height: 42,
    borderRadius: 9,
    backgroundColor: "#7658ed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  addText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  incomeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#f0f0f4",
    paddingVertical: 12,
    gap: 10,
  },
  itemName: { fontSize: 12, fontWeight: "700", color: "#2b3040" },
  itemSub: { fontSize: 10, color: "#969baa", marginTop: 4 },
  itemAmount: { fontSize: 12, fontWeight: "700", color: "#319774" },
  remove: { fontSize: 20, color: "#adb1bb", paddingHorizontal: 4 },
  empty: {
    fontSize: 11,
    color: "#9ba1af",
    textAlign: "center",
    paddingVertical: 20,
  },
});
