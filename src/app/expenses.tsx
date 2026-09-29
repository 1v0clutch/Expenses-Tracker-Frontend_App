import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useExpensesContext } from "@/context/ExpensesContext";
import { CATEGORIES, PAYMENT_METHODS, type Expense } from "@/types/expense";
import {
  formatMoney,
  isCurrentMonth,
  palette,
} from "@/constants/spendly-theme";

const today = () => new Date().toISOString().slice(0, 10);
export default function ExpensesScreen() {
  const {
    expenses,
    categories,
    addExpense,
    updateExpense,
    deleteExpense,
    settings,
  } = useExpensesContext();
  const [formOpen, setFormOpen] = useState(false),
    [search, setSearch] = useState(""),
    [filterCategory, setFilterCategory] = useState("All"),
    [filterPayment, setFilterPayment] = useState("All"),
    [dateFilter, setDateFilter] = useState("All dates"),
    [sort, setSort] = useState<"Newest" | "Oldest" | "Highest" | "Lowest">(
      "Newest",
    ),
    [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState(""),
    [amount, setAmount] = useState(""),
    [date, setDate] = useState(today()),
    [category, setCategory] = useState<string>(
      categories[0] || "Food & Dining",
    ),
    [payment, setPayment] = useState("Cash"),
    [notes, setNotes] = useState(""),
    [receiptUri, setReceiptUri] = useState(""),
    [error, setError] = useState("");
  const methods = settings.paymentMethods?.length
    ? settings.paymentMethods
    : PAYMENT_METHODS;
  const filtered = useMemo(
    () =>
      expenses
        .filter((e) => {
          const matchesQuery = (
            e.name +
            " " +
            e.category +
            " " +
            (e.notes || "")
          )
            .toLowerCase()
            .includes(search.trim().toLowerCase());
          const matchesCategory =
            filterCategory === "All" || e.category === filterCategory;
          const matchesPayment =
            filterPayment === "All" ||
            (e.paymentMethod || "Cash") === filterPayment;
          const matchesDate =
            dateFilter === "All dates" ||
            (dateFilter === "This month"
              ? isCurrentMonth(e.date)
              : Date.now() - new Date(e.date + "T00:00:00").getTime() <
                30 * 86400000);
          return (
            matchesQuery && matchesCategory && matchesPayment && matchesDate
          );
        })
        .sort((a, b) =>
          sort === "Newest"
            ? b.date.localeCompare(a.date)
            : sort === "Oldest"
              ? a.date.localeCompare(b.date)
              : sort === "Highest"
                ? b.amount - a.amount
                : a.amount - b.amount,
        ),
    [expenses, search, filterCategory, filterPayment, dateFilter, sort],
  );
  function reset() {
    setEditId(null);
    setName("");
    setAmount("");
    setDate(today());
    setCategory(categories[0] || "Food & Dining");
    setPayment("Cash");
    setNotes("");
    setReceiptUri("");
    setError("");
  }
  function openAdd() {
    reset();
    setFormOpen(true);
  }
  function openEdit(item: Expense) {
    setEditId(item.id);
    setName(item.name);
    setAmount(String(item.amount));
    setDate(item.date);
    setCategory(item.category);
    setPayment(item.paymentMethod || "Cash");
    setNotes(item.notes || "");
    setReceiptUri(item.receiptUri || "");
    setError("");
    setFormOpen(true);
  }
  async function pickReceipt() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Allow photo access to attach a receipt image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.82,
    });
    if (!result.canceled && result.assets[0])
      setReceiptUri(result.assets[0].uri);
  }
  function submit() {
    const numeric = Number(amount);
    if (!name.trim()) {
      setError("Add a description for this expense.");
      return;
    }
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Use a date in YYYY-MM-DD format.");
      return;
    }
    const item = {
      name: name.trim(),
      amount: numeric,
      date,
      category,
      paymentMethod: payment,
      notes: notes.trim() || undefined,
      receiptUri: receiptUri.trim() || undefined,
    };
    if (editId) updateExpense(editId, item);
    else addExpense(item);
    setFormOpen(false);
    reset();
  }
  function remove(item: Expense) {
    Alert.alert("Delete this expense?", item.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteExpense(item.id),
      },
    ]);
  }
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  return (
    <View style={s.page}>
      <SafeAreaView edges={["top"]}>
        <View style={s.header}>
          <View>
            <Text style={s.eyebrow}>YOUR SPENDING</Text>
            <Text style={s.title}>Expenses</Text>
            <Text style={s.subtitle}>
              {expenses.length} transactions recorded
            </Text>
          </View>
          <TouchableOpacity style={s.addButton} onPress={openAdd}>
            <Text style={s.addText}>＋</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>MATCHING EXPENSES</Text>
          <Text style={s.totalValue}>
            {formatMoney(total, settings.currency)}
          </Text>
          <Text style={s.totalSub}>
            {filtered.length}{" "}
            {filtered.length === 1 ? "transaction" : "transactions"}
          </Text>
        </View>
        <View style={s.searchBox}>
          <Text style={s.searchGlyph}>⌕</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search expenses or notes"
            placeholderTextColor={palette.subtle}
            value={search}
            onChangeText={setSearch}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={s.clearSearch}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.filterLabel}>CATEGORY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {["All", ...categories].map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setFilterCategory(c)}
              style={[s.chip, filterCategory === c && s.chipActive]}
            >
              <Text
                style={[s.chipText, filterCategory === c && s.chipTextActive]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={s.filterHeader}>
          <Text style={s.filterLabel}>PAYMENT METHOD</Text>
          <Text style={s.filterLabel}>DATE</Text>
        </View>
        <View style={s.filterPair}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
          >
            {["All", ...methods].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setFilterPayment(m)}
                style={[
                  s.chip,
                  s.smallChip,
                  filterPayment === m && s.chipActive,
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    s.smallChipText,
                    filterPayment === m && s.chipTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {["All dates", "This month", "Last 30 days"].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDateFilter(d)}
              style={[s.chip, s.smallChip, dateFilter === d && s.chipActive]}
            >
              <Text
                style={[
                  s.chipText,
                  s.smallChipText,
                  dateFilter === d && s.chipTextActive,
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={s.listHeading}>
          <Text style={s.sectionTitle}>Transactions</Text>
          <View style={s.sortRow}>
            {(["Newest", "Oldest", "Highest", "Lowest"] as const).map(
              (item) => (
                <TouchableOpacity key={item} onPress={() => setSort(item)}>
                  <Text style={[s.sortOption, sort === item && s.sortActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
        {filtered.length ? (
          filtered.map((item) => (
            <View key={item.id} style={s.expenseCard}>
              <View style={s.expenseIcon}>
                <Text style={s.expenseIconText}>
                  {item.category.toLowerCase().includes("food")
                    ? "◉"
                    : item.category.toLowerCase().includes("transport")
                      ? "↗"
                      : "◈"}
                </Text>
              </View>
              <View style={s.expenseInfo}>
                <Text style={s.expenseName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={s.expenseMeta}>
                  {item.category} ·{" "}
                  {new Date(item.date + "T00:00:00").toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={s.expenseMeta}>
                  {item.paymentMethod || "Cash"}
                  {item.notes ? ` · ${item.notes}` : ""}
                </Text>
              </View>
              <View style={s.expenseRight}>
                <Text style={s.expenseAmount}>
                  −{formatMoney(item.amount, settings.currency)}
                </Text>
                {item.receiptUri && (
                  <Image
                    source={{ uri: item.receiptUri }}
                    style={s.receiptThumb}
                  />
                )}
                <View style={s.rowActions}>
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Text style={s.editAction}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item)}>
                    <Text style={s.deleteAction}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>⌕</Text>
            <Text style={s.emptyTitle}>No expenses found</Text>
            <Text style={s.emptyText}>
              Try changing your search or filters.
            </Text>
            <TouchableOpacity onPress={openAdd}>
              <Text style={s.emptyLink}>＋ Add an expense</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 95 }} />
      </ScrollView>
      <Modal
        visible={formOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormOpen(false)}
      >
        <KeyboardAvoidingView
          style={s.modal}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>
                  {editId ? "Edit expense" : "Add expense"}
                </Text>
                <Text style={s.modalSub}>
                  Enter the details of your purchase.
                </Text>
              </View>
              <Pressable
                onPress={() => setFormOpen(false)}
                style={s.closeButton}
              >
                <Text style={s.closeText}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={s.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={s.formLabel}>DESCRIPTION</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Weekly groceries"
                placeholderTextColor={palette.subtle}
                value={name}
                onChangeText={setName}
              />
              <Text style={s.formLabel}>AMOUNT</Text>
              <TextInput
                style={s.input}
                placeholder="0.00"
                placeholderTextColor={palette.subtle}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={s.formLabel}>DATE · YYYY-MM-DD</Text>
              <TextInput
                style={s.input}
                placeholder="2026-09-29"
                placeholderTextColor={palette.subtle}
                value={date}
                onChangeText={setDate}
              />
              <Text style={s.formLabel}>CATEGORY</Text>
              <View style={s.formChips}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[s.chip, s.formChip, category === c && s.chipActive]}
                  >
                    <Text
                      style={[s.chipText, category === c && s.chipTextActive]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.formLabel}>PAYMENT METHOD</Text>
              <View style={s.formChips}>
                {methods.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPayment(m)}
                    style={[s.chip, s.formChip, payment === m && s.chipActive]}
                  >
                    <Text
                      style={[s.chipText, payment === m && s.chipTextActive]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.formLabel}>NOTES · OPTIONAL</Text>
              <TextInput
                style={[s.input, s.notes]}
                placeholder="Add a note"
                placeholderTextColor={palette.subtle}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
              <Text style={s.formLabel}>RECEIPT PHOTO · OPTIONAL</Text>
              <TouchableOpacity
                style={s.photoButton}
                onPress={() => void pickReceipt()}
              >
                <Text style={s.photoButtonText}>
                  {receiptUri
                    ? "Change receipt photo"
                    : "＋ Choose receipt photo"}
                </Text>
              </TouchableOpacity>
              {receiptUri !== "" && (
                <View style={s.receiptPreview}>
                  <Image source={{ uri: receiptUri }} style={s.receiptImage} />
                  <TouchableOpacity onPress={() => setReceiptUri("")}>
                    <Text style={s.deleteAction}>Remove photo</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={s.localHelp}>
                Receipt image stays on this device.
              </Text>
              {error !== "" && <Text style={s.error}>{error}</Text>}
            </ScrollView>
            <View style={s.modalFooter}>
              <TouchableOpacity style={s.submitButton} onPress={submit}>
                <Text style={s.submitText}>
                  {editId ? "Save changes" : "Save expense"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.page },
  header: {
    paddingHorizontal: 19,
    paddingTop: 7,
    paddingBottom: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#b49dff",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: palette.text,
    marginTop: 3,
  },
  subtitle: { fontSize: 10, color: palette.muted, marginTop: 3 },
  addButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: palette.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { fontSize: 24, color: "#fff", lineHeight: 27 },
  content: { paddingHorizontal: 15, paddingTop: 4, gap: 11, paddingBottom: 20 },
  totalCard: {
    backgroundColor: "#33264e",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#4b3b6e",
    padding: 15,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: "#c5b5e9",
  },
  totalValue: { fontSize: 23, fontWeight: "900", color: "#fff", marginTop: 7 },
  totalSub: { fontSize: 9, color: "#c8bce4", marginTop: 3 },
  searchBox: {
    height: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
  },
  searchGlyph: { fontSize: 18, color: "#bba7fa", marginRight: 8 },
  searchInput: {
    flex: 1,
    color: palette.text,
    fontSize: 11,
    paddingVertical: 0,
  },
  clearSearch: { color: palette.muted, fontSize: 19, paddingHorizontal: 4 },
  filterLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: palette.muted,
  },
  chips: { gap: 7, paddingVertical: 1 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
  },
  chipActive: { borderColor: "#8060df", backgroundColor: palette.purpleWash },
  chipText: { fontSize: 9, color: palette.muted, fontWeight: "600" },
  chipTextActive: { color: "#d2c3ff", fontWeight: "800" },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 5,
    marginTop: 1,
  },
  filterPair: { marginTop: -5 },
  smallChip: { paddingHorizontal: 8, paddingVertical: 7 },
  smallChipText: { fontSize: 8 },
  listHeading: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 13, fontWeight: "900", color: palette.text },
  sortRow: { flexDirection: "row", gap: 7 },
  sortOption: { fontSize: 8, color: palette.subtle },
  sortActive: { color: "#c7b6ff", fontWeight: "800" },
  expenseCard: {
    backgroundColor: palette.panel,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  expenseIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: palette.purpleWash,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseIconText: { color: "#d2c2ff", fontSize: 14 },
  expenseInfo: { flex: 1, minWidth: 0, gap: 3 },
  expenseName: { fontSize: 10, fontWeight: "800", color: palette.text },
  expenseMeta: { fontSize: 8, color: palette.muted },
  expenseRight: { alignItems: "flex-end", gap: 7 },
  expenseAmount: { fontSize: 9, fontWeight: "900", color: palette.text },
  rowActions: { flexDirection: "row", gap: 11 },
  editAction: { fontSize: 8, fontWeight: "800", color: "#b9a3ff" },
  deleteAction: { fontSize: 8, fontWeight: "700", color: palette.coral },
  empty: {
    alignItems: "center",
    padding: 28,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
  },
  emptyIcon: { fontSize: 22, color: palette.purple },
  emptyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.text,
    marginTop: 8,
  },
  emptyText: { fontSize: 9, color: palette.muted, marginTop: 4 },
  emptyLink: {
    fontSize: 9,
    fontWeight: "800",
    color: "#bca8ff",
    marginTop: 12,
  },
  modal: { flex: 1, backgroundColor: palette.page },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: palette.text },
  modalSub: { fontSize: 9, color: palette.muted, marginTop: 3 },
  closeButton: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 20, color: palette.muted, lineHeight: 23 },
  modalContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 25 },
  formLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: palette.muted,
    marginTop: 15,
    marginBottom: 7,
  },
  input: {
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    paddingHorizontal: 12,
    fontSize: 11,
    color: palette.text,
  },
  notes: { height: 70, paddingTop: 11, textAlignVertical: "top" },
  formChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  formChip: { paddingVertical: 8 },
  localHelp: { fontSize: 8, color: palette.subtle, marginTop: 6 },
  photoButton: {
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: palette.purple,
    backgroundColor: palette.purpleWash,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonText: { fontSize: 9, fontWeight: "800", color: "#d0c0ff" },
  receiptPreview: { marginTop: 8, gap: 7 },
  receiptImage: {
    width: 92,
    height: 92,
    borderRadius: 9,
    backgroundColor: palette.card,
  },
  receiptThumb: { width: 32, height: 32, borderRadius: 5, marginTop: 5 },
  error: { color: palette.coral, fontSize: 10, marginTop: 12 },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  submitButton: {
    height: 47,
    backgroundColor: palette.purple,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 11, fontWeight: "900", color: "#fff" },
});


