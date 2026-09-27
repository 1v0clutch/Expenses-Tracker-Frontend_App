import { useState } from "react";
import {
  FlatList,
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

import { FAB } from "@/components/ui/FAB";
import { useExpensesContext } from "@/context/ExpensesContext";
import { CATEGORIES } from "@/types/expense";
import type { Category, Expense } from "@/types/expense";

function fmt(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const todayStr = new Date().toISOString().split("T")[0];

function ExpenseCard({
  item,
  onDelete,
}: {
  item: Expense;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          {item.category} · {fmtDate(item.date)}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardAmount}>{fmt(item.amount)}</Text>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense } = useExpensesContext();
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr);
  const [category, setCategory] = useState<Category>("Food");
  const [error, setError] = useState("");

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  function openModal() {
    setName("");
    setAmount("");
    setDate(todayStr);
    setCategory("Food");
    setError("");
    setModalVisible(true);
  }

  function handleAdd() {
    const parsed = parseFloat(amount);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }
    addExpense({ name: name.trim(), amount: parsed, date, category });
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
          <Text style={styles.headerSub}>
            {expenses.length} total · {fmt(total)}
          </Text>
        </View>
      </SafeAreaView>

      {/* List */}
      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses yet.</Text>
          <Text style={styles.emptyHint}>Tap + to add your first one.</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseCard item={item} onDelete={deleteExpense} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB onPress={openModal} />

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Lunch"
                  placeholderTextColor="#bbb"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                />
              </View>

              {/* Amount */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                <View style={styles.prefixWrap}>
                  <Text style={styles.prefix}>₱</Text>
                  <TextInput
                    style={[styles.input, styles.inputPrefixed]}
                    placeholder="0.00"
                    placeholderTextColor="#bbb"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DATE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#bbb"
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                />
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipRow}
                >
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c}
                      style={[styles.chip, category === c && styles.chipActive]}
                      onPress={() => setCategory(c)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          category === c && styles.chipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>

            {/* Submit */}
            <View style={styles.modalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && styles.submitBtnPressed,
                ]}
                onPress={handleAdd}
              >
                <Text style={styles.submitBtnText}>Add Expense</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerSafe: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  cardLeft: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  cardMeta: {
    fontSize: 12,
    color: "#aaa",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },
  deleteBtn: {
    fontSize: 13,
    color: "#ccc",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ccc",
  },
  emptyHint: {
    fontSize: 13,
    color: "#ddd",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    letterSpacing: -0.3,
  },
  modalClose: {
    fontSize: 16,
    color: "#aaa",
    padding: 4,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginTop: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#fafafa",
  },
  prefixWrap: {
    position: "relative",
    justifyContent: "center",
  },
  prefix: {
    position: "absolute",
    left: 14,
    fontSize: 15,
    color: "#888",
    fontWeight: "600",
    zIndex: 1,
  },
  inputPrefixed: {
    paddingLeft: 28,
  },
  chipRow: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    fontSize: 13,
    color: "#c00",
    marginTop: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  submitBtn: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnPressed: {
    opacity: 0.75,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
