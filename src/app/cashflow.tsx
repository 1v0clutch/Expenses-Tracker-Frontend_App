import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpensesContext } from "@/context/ExpensesContext";
import {
  formatMoney,
  isCurrentMonth,
  palette,
} from "@/constants/spendly-theme";
import type { Income } from "@/types/expense";
const today = () => new Date().toISOString().slice(0, 10);
export default function CashflowScreen() {
  const { income, expenses, addIncome, updateIncome, deleteIncome, settings } =
    useExpensesContext();
  const [open, setOpen] = useState(false),
    [editing, setEditing] = useState<string | null>(null),
    [name, setName] = useState(""),
    [amount, setAmount] = useState(""),
    [source, setSource] = useState(settings.incomeSources?.[0] || "Salary"),
    [date, setDate] = useState(today()),
    [search, setSearch] = useState("");
  const monthIncome = income.filter((i) => isCurrentMonth(i.date)),
    monthExpenses = expenses.filter((e) => isCurrentMonth(e.date));
  const earned = monthIncome.reduce((s, i) => s + i.amount, 0),
    spent = monthExpenses.reduce((s, e) => s + e.amount, 0),
    max = Math.max(earned, spent, 1);
  const sourceTotals = Object.entries(
    monthIncome.reduce<Record<string, number>>((a, i) => {
      a[i.source] = (a[i.source] || 0) + i.amount;
      return a;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const categoryTotals = Object.entries(
    monthExpenses.reduce<Record<string, number>>((a, e) => {
      a[e.category] = (a[e.category] || 0) + e.amount;
      return a;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const history = useMemo(
    () =>
      income
        .filter((i) =>
          (i.name + " " + i.source)
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [income, search],
  );
  const trend = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const month = d.getMonth(),
      year = d.getFullYear();
    const inc = income
      .filter((i) => {
        const x = new Date(i.date + "T00:00:00");
        return x.getMonth() === month && x.getFullYear() === year;
      })
      .reduce((s, i) => s + i.amount, 0);
    const exp = expenses
      .filter((e) => {
        const x = new Date(e.date + "T00:00:00");
        return x.getMonth() === month && x.getFullYear() === year;
      })
      .reduce((s, e) => s + e.amount, 0);
    return { label: d.toLocaleDateString("en", { month: "short" }), inc, exp };
  });
  function openAdd() {
    setEditing(null);
    setName("");
    setAmount("");
    setDate(today());
    setSource(settings.incomeSources?.[0] || "Salary");
    setOpen(true);
  }
  function edit(item: Income) {
    setEditing(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setDate(item.date);
    setSource(item.source);
    setOpen(true);
  }
  function save() {
    if (!name.trim() || !Number(amount) || Number(amount) <= 0) {
      Alert.alert(
        "Check your entry",
        "Enter an income name and an amount above zero.",
      );
      return;
    }
    const item = { name: name.trim(), amount: Number(amount), source, date };
    if (editing) updateIncome(editing, item);
    else addIncome(item);
    setOpen(false);
  }
  function remove(item: Income) {
    Alert.alert("Delete income?", item.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteIncome(item.id),
      },
    ]);
  }
  return (
    <View style={s.page}>
      <SafeAreaView edges={["top"]}>
        <View style={s.header}>
          <Text style={s.eyebrow}>INCOME · EXPENSES · NET</Text>
          <Text style={s.title}>Cashflow</Text>
          <Text style={s.subtitle}>Follow the movement of your money.</Text>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.stats}>
          {[
            ["INCOME", earned, palette.green],
            ["EXPENSES", spent, palette.coral],
            [
              "NET CASHFLOW",
              earned - spent,
              earned >= spent ? palette.green : palette.coral,
            ],
          ].map(([label, value, color]) => (
            <View style={s.stat} key={String(label)}>
              <Text style={s.statLabel}>{label}</Text>
              <Text style={[s.statValue, { color: String(color) }]}>
                {formatMoney(Number(value), settings.currency)}
              </Text>
              <Text style={s.statSub}>This month</Text>
            </View>
          ))}
        </View>
        <View style={s.card}>
          <View style={s.cardHeading}>
            <View>
              <Text style={s.cardTitle}>Cashflow history</Text>
              <Text style={s.cardSub}>Income compared with expenses</Text>
            </View>
            <View style={s.legend}>
              <Text style={s.legendIn}>● In</Text>
              <Text style={s.legendOut}>● Out</Text>
            </View>
          </View>
          <View style={s.chart}>
            {trend.map((item, i) => (
              <View style={s.monthCol} key={i}>
                <Text style={s.monthTotal}>
                  {item.inc || item.exp
                    ? formatMoney(item.inc, settings.currency)
                    : ""}
                </Text>
                <View style={s.bars}>
                  <View
                    style={[
                      s.bar,
                      {
                        height: `${Math.max((item.inc / max) * 100, item.inc ? 5 : 0)}%`,
                        backgroundColor: palette.purple,
                      },
                    ]}
                  />
                  <View
                    style={[
                      s.bar,
                      {
                        height: `${Math.max((item.exp / max) * 100, item.exp ? 5 : 0)}%`,
                        backgroundColor: palette.coral,
                      },
                    ]}
                  />
                </View>
                <Text style={s.monthLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.scale}>
            <Text style={s.scaleText}>Monthly income and expenses</Text>
            <Text style={s.scaleText}>{new Date().getFullYear()}</Text>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.cardHeading}>
            <View>
              <Text style={s.cardTitle}>Income sources</Text>
              <Text style={s.cardSub}>Sources received this month</Text>
            </View>
          </View>
          {sourceTotals.length ? (
            sourceTotals.map(([label, value], i) => (
              <View style={s.breakdown} key={label}>
                <View style={s.breakdownTop}>
                  <Text style={s.breakdownName}>{label}</Text>
                  <Text style={s.breakdownAmount}>
                    {formatMoney(value, settings.currency)} ·{" "}
                    {earned ? Math.round((value / earned) * 100) : 0}%
                  </Text>
                </View>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${(value / max) * 100}%`,
                        backgroundColor: [
                          palette.purple,
                          palette.blue,
                          palette.green,
                          palette.amber,
                        ][i % 4],
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={s.empty}>
              Add an income entry to build your source summary.
            </Text>
          )}
        </View>
        <View style={s.card}>
          <View style={s.cardHeading}>
            <View>
              <Text style={s.cardTitle}>Expense categories</Text>
              <Text style={s.cardSub}>
                How this month’s spending is distributed
              </Text>
            </View>
          </View>
          {categoryTotals.length ? (
            categoryTotals.map(([label, value], i) => (
              <View style={s.breakdown} key={label}>
                <View style={s.breakdownTop}>
                  <Text style={s.breakdownName}>{label}</Text>
                  <Text style={s.breakdownAmount}>
                    {formatMoney(value, settings.currency)} ·{" "}
                    {spent ? Math.round((value / spent) * 100) : 0}%
                  </Text>
                </View>
                <View style={s.track}>
                  <View
                    style={[
                      s.fill,
                      {
                        width: `${(value / max) * 100}%`,
                        backgroundColor: [
                          palette.coral,
                          palette.purple,
                          palette.amber,
                          palette.blue,
                        ][i % 4],
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={s.empty}>Expenses will appear here by category.</Text>
          )}
        </View>
        <View style={s.historyHeading}>
          <View>
            <Text style={s.cardTitle}>Income history</Text>
            <Text style={s.cardSub}>{income.length} income entries</Text>
          </View>
          <TouchableOpacity style={s.addButton} onPress={openAdd}>
            <Text style={s.addText}>＋ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            style={s.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search income"
            placeholderTextColor={palette.subtle}
          />
        </View>
        {history.length ? (
          history.map((item) => (
            <View style={s.incomeCard} key={item.id}>
              <View style={s.incomeIcon}>
                <Text style={s.incomeGlyph}>↙</Text>
              </View>
              <View style={s.incomeInfo}>
                <Text style={s.incomeName}>{item.name}</Text>
                <Text style={s.incomeMeta}>
                  {item.source} ·{" "}
                  {new Date(item.date + "T00:00:00").toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={s.incomeRight}>
                <Text style={s.incomeAmount}>
                  +{formatMoney(item.amount, settings.currency)}
                </Text>
                <View style={s.actions}>
                  <TouchableOpacity onPress={() => edit(item)}>
                    <Text style={s.edit}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item)}>
                    <Text style={s.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyText}>No income history yet.</Text>
            <TouchableOpacity onPress={openAdd}>
              <Text style={s.link}>Add salary or freelance income →</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={s.modal}>
          <View style={s.modalHead}>
            <Text style={s.cardTitle}>
              {editing ? "Edit income" : "Add income"}
            </Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={s.close}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalContent}>
            <Text style={s.fieldLabel}>INCOME NAME</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Monthly payroll"
              placeholderTextColor={palette.subtle}
            />
            <Text style={s.fieldLabel}>AMOUNT</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={palette.subtle}
            />
            <Text style={s.fieldLabel}>DATE · YYYY-MM-DD</Text>
            <TextInput
              style={s.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-09-29"
              placeholderTextColor={palette.subtle}
            />
            <Text style={s.fieldLabel}>SOURCE</Text>
            <View style={s.sources}>
              {(
                settings.incomeSources || [
                  "Salary",
                  "Freelance",
                  "Business",
                  "Investment",
                  "Other",
                ]
              ).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[s.sourceChip, source === v && s.sourceActive]}
                  onPress={() => setSource(v)}
                >
                  <Text
                    style={[s.sourceText, source === v && s.sourceSelected]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.submit} onPress={save}>
              <Text style={s.submitText}>
                {editing ? "Save changes" : "Add income"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.page },
  header: { paddingHorizontal: 19, paddingTop: 7, paddingBottom: 14 },
  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: "#b59eff",
  },
  title: { fontSize: 23, fontWeight: "900", color: palette.text, marginTop: 4 },
  subtitle: { fontSize: 10, color: palette.muted, marginTop: 3 },
  content: { paddingHorizontal: 15, paddingTop: 3, gap: 11 },
  stats: { flexDirection: "row", gap: 7 },
  stat: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: palette.muted,
  },
  statValue: { fontSize: 11, fontWeight: "900", marginTop: 8 },
  statSub: { fontSize: 7, color: palette.subtle, marginTop: 4 },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 12, fontWeight: "900", color: palette.text },
  cardSub: { fontSize: 8, color: palette.muted, marginTop: 3 },
  legend: { flexDirection: "row", gap: 8 },
  legendIn: { fontSize: 8, color: "#c5adff" },
  legendOut: { fontSize: 8, color: palette.coral },
  chart: {
    height: 130,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  monthCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  monthTotal: { height: 12, fontSize: 6, color: palette.muted },
  bars: {
    height: 99,
    width: "76%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  bar: { width: 9, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  monthLabel: { fontSize: 7, color: palette.muted, marginTop: 6 },
  scale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleText: { fontSize: 7, color: palette.subtle },
  breakdown: { marginTop: 13 },
  breakdownTop: { flexDirection: "row", justifyContent: "space-between" },
  breakdownName: { fontSize: 9, fontWeight: "700", color: palette.text },
  breakdownAmount: { fontSize: 8, color: palette.muted },
  track: {
    height: 5,
    backgroundColor: palette.raised,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 6,
  },
  fill: { height: "100%", borderRadius: 5 },
  empty: {
    fontSize: 9,
    color: palette.muted,
    textAlign: "center",
    paddingVertical: 17,
  },
  emptyText: { fontSize: 9, color: palette.muted },
  historyHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  addButton: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: palette.purple,
  },
  addText: { fontSize: 9, fontWeight: "900", color: "#fff" },
  searchWrap: {
    height: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 16, color: "#bba7fa", marginRight: 7 },
  search: { flex: 1, fontSize: 10, color: palette.text, paddingVertical: 0 },
  incomeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 11,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    backgroundColor: palette.panel,
  },
  incomeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.greenWash,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeGlyph: { fontSize: 16, color: palette.green },
  incomeInfo: { flex: 1 },
  incomeName: { fontSize: 9, fontWeight: "800", color: palette.text },
  incomeMeta: { fontSize: 7, color: palette.muted, marginTop: 3 },
  incomeRight: { alignItems: "flex-end", gap: 5 },
  incomeAmount: { fontSize: 9, fontWeight: "900", color: palette.green },
  actions: { flexDirection: "row", gap: 9 },
  edit: { fontSize: 8, color: "#bca8ff", fontWeight: "800" },
  delete: { fontSize: 8, color: palette.coral },
  link: { fontSize: 9, color: "#bca8ff", fontWeight: "800", marginTop: 7 },
  modal: { flex: 1, backgroundColor: palette.page },
  modalHead: {
    padding: 19,
    borderBottomWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  close: { fontSize: 21, color: palette.muted },
  modalContent: { paddingHorizontal: 19, paddingBottom: 30 },
  fieldLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: palette.muted,
    marginTop: 15,
    marginBottom: 7,
  },
  input: {
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    paddingHorizontal: 11,
    color: palette.text,
    fontSize: 10,
  },
  sources: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  sourceChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
  },
  sourceActive: {
    backgroundColor: palette.purpleWash,
    borderColor: palette.purple,
  },
  sourceText: { fontSize: 8, color: palette.muted },
  sourceSelected: { color: "#d8caff", fontWeight: "800" },
  submit: {
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.purple,
    marginTop: 20,
  },
  submitText: { fontSize: 10, fontWeight: "900", color: "#fff" },
});

