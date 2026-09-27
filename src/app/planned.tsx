import { useMemo, useState } from "react";
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
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { useExpensesContext } from "@/context/ExpensesContext";
import { CATEGORIES, PRIORITIES, PRIORITY_ORDER } from "@/types/expense";
import type { Category, PlannedExpense, Priority } from "@/types/expense";

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

const PRIORITY_TOP_BORDER: Record<Priority, string> = {
  High: "#000",
  Medium: "#555",
  Low: "#ccc",
};

function PlannedCard({
  item,
  onDelete,
}: {
  item: PlannedExpense;
  onDelete: (id: string) => void;
}) {
  return (
    <View
      style={[
        styles.card,
        { borderTopColor: PRIORITY_TOP_BORDER[item.priority] },
      ]}
    >
      <View style={styles.cardHeader}>
        <PriorityBadge priority={item.priority} />
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardAmount}>{fmt(item.amount)}</Text>
      <View style={styles.cardMeta}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{item.category}</Text>
        </View>
        {item.dueDate && (
          <Text style={styles.dueDate}>Due {fmtDate(item.dueDate)}</Text>
        )}
      </View>
    </View>
  );
}

export default function PlannedScreen() {
  const { planned, addPlannedExpense, deletePlannedExpense } =
    useExpensesContext();
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const sorted = useMemo(
    () =>
      [...planned].sort((a, b) => {
        const po = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (po !== 0) return po;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [planned],
  );

  function openModal() {
    setName("");
    setAmount("");
    setCategory("Food");
    setPriority("Medium");
    setDueDate("");
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
    addPlannedExpense({
      name: name.trim(),
      amount: parsed,
      category,
      priority,
      dueDate: dueDate || undefined,
    });
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Planned</Text>
          <Text style={styles.headerSub}>
            {planned.length} planned · sorted by priority
          </Text>
        </View>
      </SafeAreaView>

      {/* List */}
      {sorted.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No planned expenses yet.</Text>
          <Text style={styles.emptyHint}>Tap + to plan one.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlannedCard item={item} onDelete={deletePlannedExpense} />
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
              <Text style={styles.modalTitle}>Plan an Expense</Text>
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
                  placeholder="e.g. New laptop"
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

              {/* Priority */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map((p) => {
                    const active = priority === p;
                    const activeBg =
                      p === "High"
                        ? "#000"
                        : p === "Medium"
                          ? "#555"
                          : "#e0e0e0";
                    const activeText = p === "Low" ? "#333" : "#fff";
                    return (
                      <Pressable
                        key={p}
                        style={[
                          styles.priorityBtn,
                          active && {
                            backgroundColor: activeBg,
                            borderColor: activeBg,
                          },
                        ]}
                        onPress={() => setPriority(p)}
                      >
                        <Text
                          style={[
                            styles.priorityBtnText,
                            active && { color: activeText, fontWeight: "700" },
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
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

              {/* Due Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  DUE DATE <Text style={styles.optional}>(OPTIONAL)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#bbb"
                  value={dueDate}
                  onChangeText={setDueDate}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={{ height: 24 }} />
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
                <Text style={styles.submitBtnText}>Add to Plan</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  // Planned Card
  card: {
    borderWidth: 1,
    borderColor: "#ebebeb",
    borderTopWidth: 3,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteBtn: {
    fontSize: 13,
    color: "#ccc",
    padding: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    lineHeight: 22,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    letterSpacing: -0.5,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  dueDate: {
    fontSize: 12,
    color: "#aaa",
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
  optional: {
    fontWeight: "400",
    color: "#ccc",
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
  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  priorityBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#aaa",
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
