import { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpensesContext } from "@/context/ExpensesContext";
import { useGuestSession } from "@/context/GuestSessionContext";
import { formatMoney, palette } from "@/constants/spendly-theme";
import { PAYMENT_METHODS } from "@/types/expense";

export default function AccountScreen() {
  const {
    expenses,
    income,
    planned,
    budgets,
    settings,
    setSettings,
    clearFinanceData,
  } = useExpensesContext();
  const { profile, requestLogout, updateGuestName } = useGuestSession();
  const [name, setName] = useState(settings.name || profile?.name || "Guest"),
    [email, setEmail] = useState(settings.email || ""),
    [newMethod, setNewMethod] = useState(""),
    [newSource, setNewSource] = useState("");
  const methods = settings.paymentMethods || PAYMENT_METHODS;
  const sources = settings.incomeSources || [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Other",
  ];
  const recordCount = expenses.length + income.length;
  function saveProfile() {
    const nextName = name.trim() || "Guest";
    setSettings((p) => ({ ...p, name: nextName, email: email.trim() }));
    void updateGuestName(nextName);
    Alert.alert(
      "Profile saved",
      "Your local guest profile has been updated on this device.",
    );
  }
  async function exportCsv() {
    const rows = [
      [
        "Type",
        "Description",
        "Category or source",
        "Date",
        "Amount",
        "Payment method",
        "Notes",
      ],
      ...expenses.map((e) => [
        "Expense",
        e.name,
        e.category,
        e.date,
        String(e.amount),
        e.paymentMethod || "",
        e.notes || "",
      ]),
      ...income.map((i) => [
        "Income",
        i.name,
        i.source,
        i.date,
        String(i.amount),
        "",
        "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => '"' + value.replaceAll('"', '""') + '"').join(","),
      )
      .join("\n");
    try {
      await Share.share({ title: "Spendly transaction export", message: csv });
    } catch {
      Alert.alert(
        "Export unavailable",
        "Your device could not open the share menu.",
      );
    }
  }
  function clearData() {
    Alert.alert(
      "Delete saved financial data?",
      `This removes ${recordCount} transactions plus budgets and goals from this device. Your guest profile stays saved.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete data",
          style: "destructive",
          onPress: clearFinanceData,
        },
      ],
    );
  }
  function addPreference(
    field: "paymentMethods" | "incomeSources",
    value: string,
  ) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSettings((p) => ({
      ...p,
      [field]: Array.from(new Set([...(p[field] || []), trimmed])),
    }));
    field === "paymentMethods" ? setNewMethod("") : setNewSource("");
  }
  function removePreference(
    field: "paymentMethods" | "incomeSources",
    value: string,
  ) {
    setSettings((p) => ({
      ...p,
      [field]: (p[field] || []).filter((item) => item !== value),
    }));
  }
  function guestLogout() {
    requestLogout();
  }
  return (
    <View style={s.page}>
      <SafeAreaView edges={["top"]}>
        <View style={s.header}>
          <Text style={s.eyebrow}>PROFILE · PREFERENCES · PRIVACY</Text>
          <Text style={s.title}>Account</Text>
          <Text style={s.subtitle}>
            Manage your local guest account and app settings.
          </Text>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.identity}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(profile?.name || name || "G")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.identityName}>
              {profile?.name || name || "Guest"}
            </Text>
            <Text style={s.identitySub}>Guest account · this device only</Text>
          </View>
          <View style={s.localBadge}>
            <Text style={s.localBadgeText}>LOCAL</Text>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Profile information</Text>
          <Text style={s.cardSub}>
            Your guest profile is stored on this device.
          </Text>
          <Text style={s.label}>DISPLAY NAME</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Guest"
            placeholderTextColor={palette.subtle}
          />
          <Text style={s.label}>EMAIL · OPTIONAL</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={palette.subtle}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={s.saveButton} onPress={saveProfile}>
            <Text style={s.saveText}>Save profile</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Preferences & notifications</Text>
          <View style={s.preference}>
            <View style={{ flex: 1 }}>
              <Text style={s.preferenceTitle}>Weekly spending alerts</Text>
              <Text style={s.helper}>
                Show a warning when your week’s plan is exceeded.
              </Text>
            </View>
            <Switch
              value={settings.weeklyAlert}
              onValueChange={(v) =>
                setSettings((p) => ({ ...p, weeklyAlert: v }))
              }
              trackColor={{ true: palette.purple }}
              thumbColor="#fff"
            />
          </View>
          <View style={s.preference}>
            <View style={{ flex: 1 }}>
              <Text style={s.preferenceTitle}>Monthly budget warnings</Text>
              <Text style={s.helper}>
                Highlight categories nearing their limits.
              </Text>
            </View>
            <Switch
              value={settings.monthlyAlert}
              onValueChange={(v) =>
                setSettings((p) => ({ ...p, monthlyAlert: v }))
              }
              trackColor={{ true: palette.purple }}
              thumbColor="#fff"
            />
          </View>
          <Text style={s.label}>CURRENCY</Text>
          <View style={s.currencyRow}>
            {[
              ["PHP", "₱ PHP"],
              ["USD", "$ USD"],
              ["EUR", "€ EUR"],
              ["GBP", "£ GBP"],
              ["JPY", "¥ JPY"],
            ].map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={[
                  s.currencyChip,
                  settings.currency === value && s.currencyActive,
                ]}
                onPress={() => setSettings((p) => ({ ...p, currency: value }))}
              >
                <Text
                  style={[
                    s.currencyText,
                    settings.currency === value && s.currencyTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Payment methods</Text>
          <Text style={s.cardSub}>
            Choose which methods appear when you add an expense.
          </Text>
          <View style={s.chips}>
            {methods.map((item) => (
              <View style={s.chip} key={item}>
                <Text style={s.chipText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removePreference("paymentMethods", item)}
                >
                  <Text style={s.removeChip}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={s.addRow}>
            <TextInput
              style={s.addInput}
              value={newMethod}
              onChangeText={setNewMethod}
              placeholder="Add a payment method"
              placeholderTextColor={palette.subtle}
            />
            <TouchableOpacity
              style={s.addSmall}
              onPress={() => addPreference("paymentMethods", newMethod)}
            >
              <Text style={s.addSmallText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Income sources</Text>
          <Text style={s.cardSub}>
            Use these sources when you record cashflow.
          </Text>
          <View style={s.chips}>
            {sources.map((item) => (
              <View style={s.chip} key={item}>
                <Text style={s.chipText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removePreference("incomeSources", item)}
                >
                  <Text style={s.removeChip}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={s.addRow}>
            <TextInput
              style={s.addInput}
              value={newSource}
              onChangeText={setNewSource}
              placeholder="Add an income source"
              placeholderTextColor={palette.subtle}
            />
            <TouchableOpacity
              style={s.addSmall}
              onPress={() => addPreference("incomeSources", newSource)}
            >
              <Text style={s.addSmallText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Data export</Text>
          <Text style={s.cardSub}>
            {recordCount} transaction and income records · CSV opens in your
            device’s share sheet.
          </Text>
          <TouchableOpacity
            style={s.exportButton}
            onPress={() => void exportCsv()}
          >
            <Text style={s.exportGlyph}>⇩</Text>
            <Text style={s.exportText}>Export transactions as CSV</Text>
            <Text style={s.arrow}>→</Text>
          </TouchableOpacity>
          <View style={s.privacyBox}>
            <Text style={s.privacyIcon}>◈</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.privacyTitle}>Privacy on this device</Text>
              <Text style={s.helper}>
                This guest account is saved locally. It does not sync to another
                device or use a cloud account.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={s.dataDelete} onPress={clearData}>
            <Text style={s.deleteTitle}>Delete financial data</Text>
            <Text style={s.deleteSub}>
              Remove {recordCount} records, budgets, and goals while keeping
              your guest profile.
            </Text>
          </TouchableOpacity>
        </View>
        <View style={s.securityCard}>
          <View style={s.securityIcon}>
            <Text style={s.securityGlyph}>▣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.securityTitle}>Guest account security</Text>
            <Text style={s.helper}>
              No password or cloud sync is used. Your local guest account can be
              resumed only from this device.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={s.logoutCard} onPress={guestLogout}>
          <View style={s.logoutIcon}>
            <Text style={s.logoutGlyph}>↪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.logoutTitle}>Log out</Text>
            <Text style={s.logoutSub}>
              End this session and keep your local account.
            </Text>
          </View>
          <Text style={s.arrow}>→</Text>
        </TouchableOpacity>
        <Text style={s.footer}>Spendly Guest · Private to this device</Text>
        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.page },
  header: { paddingHorizontal: 19, paddingTop: 7, paddingBottom: 13 },
  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#b69fff",
  },
  title: { fontSize: 23, fontWeight: "900", color: palette.text, marginTop: 4 },
  subtitle: { fontSize: 9, color: palette.muted, marginTop: 3 },
  content: { paddingHorizontal: 15, paddingTop: 3, gap: 11 },
  identity: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#302448",
    borderWidth: 1,
    borderColor: "#4b396e",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: palette.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "900", color: "#fff" },
  identityName: { fontSize: 11, fontWeight: "900", color: palette.text },
  identitySub: { fontSize: 8, color: "#cec2e7", marginTop: 3 },
  localBadge: {
    borderRadius: 10,
    backgroundColor: "#453663",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  localBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#d1c2ff",
  },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: { fontSize: 12, fontWeight: "900", color: palette.text },
  cardSub: { fontSize: 8, color: palette.muted, marginTop: 4, lineHeight: 13 },
  label: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: palette.muted,
    marginTop: 13,
    marginBottom: 6,
  },
  input: {
    height: 39,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 9,
    backgroundColor: palette.card,
    paddingHorizontal: 10,
    color: palette.text,
    fontSize: 9,
  },
  saveButton: {
    height: 36,
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: palette.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveText: { fontSize: 9, fontWeight: "900", color: "#fff" },
  preference: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  preferenceTitle: { fontSize: 9, fontWeight: "800", color: palette.text },
  helper: { fontSize: 8, lineHeight: 13, color: palette.muted, marginTop: 3 },
  currencyRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  currencyChip: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    backgroundColor: palette.card,
  },
  currencyActive: {
    backgroundColor: palette.purpleWash,
    borderColor: palette.purple,
  },
  currencyText: { fontSize: 8, color: palette.muted },
  currencyTextActive: { color: "#d9cbff", fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipText: { fontSize: 8, color: "#d8d4e2" },
  removeChip: { fontSize: 12, color: palette.coral },
  addRow: { flexDirection: "row", gap: 7, marginTop: 10 },
  addInput: {
    flex: 1,
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: 9,
    color: palette.text,
    fontSize: 8,
  },
  addSmall: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.purple,
  },
  addSmallText: { fontSize: 8, fontWeight: "900", color: "#fff" },
  exportButton: {
    marginTop: 12,
    padding: 11,
    borderRadius: 10,
    backgroundColor: palette.purpleWash,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  exportGlyph: { fontSize: 15, color: "#cbb9ff" },
  exportText: { flex: 1, fontSize: 9, fontWeight: "800", color: "#eee9ff" },
  arrow: { fontSize: 13, color: "#c7b5ff" },
  privacyBox: {
    flexDirection: "row",
    gap: 9,
    padding: 11,
    borderRadius: 10,
    backgroundColor: palette.card,
    marginTop: 12,
  },
  privacyIcon: { fontSize: 14, color: "#c3afff" },
  privacyTitle: { fontSize: 8, fontWeight: "900", color: palette.text },
  dataDelete: {
    paddingTop: 13,
    marginTop: 11,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  deleteTitle: { fontSize: 9, fontWeight: "800", color: palette.coral },
  deleteSub: {
    fontSize: 8,
    color: palette.muted,
    marginTop: 4,
    lineHeight: 13,
  },
  securityCard: {
    padding: 13,
    borderRadius: 13,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
  },
  securityIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: palette.purpleWash,
    alignItems: "center",
    justifyContent: "center",
  },
  securityGlyph: { color: "#c4b0ff", fontSize: 13 },
  securityTitle: { fontSize: 9, fontWeight: "800", color: palette.text },
  logoutCard: {
    padding: 13,
    borderRadius: 13,
    backgroundColor: palette.coralWash,
    borderColor: "#6a3944",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: "#5a303d",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutGlyph: { fontSize: 18, color: "#ffabb1" },
  logoutTitle: { fontSize: 10, fontWeight: "900", color: "#ffb2b7" },
  logoutSub: { fontSize: 8, color: "#d2a5aa", marginTop: 3 },
  footer: {
    fontSize: 8,
    color: palette.subtle,
    textAlign: "center",
    marginTop: 3,
  },
});
