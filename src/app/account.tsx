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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpensesContext } from "@/context/ExpensesContext";

export default function AccountScreen() {
  const { expenses, income } = useExpensesContext();
  const [name, setName] = useState("Guest"),
    [email, setEmail] = useState(""),
    [alerts, setAlerts] = useState(true);
  async function exportData() {
    const lines = [
      "type,name,category_or_source,date,amount",
      ...expenses.map(
        (e) => `expense,"${e.name}","${e.category}",${e.date},${e.amount}`,
      ),
      ...income.map(
        (i) => `income,"${i.name}","${i.source}",${i.date},${i.amount}`,
      ),
    ];
    await Share.share({
      title: "Spendly data export",
      message: lines.join("\n"),
    });
  }
  function deleteData() {
    Alert.alert(
      "Delete local data?",
      "This clears saved expenses and income from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => AsyncStorage.clear(),
        },
      ],
    );
  }
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.sub}>Profile, preferences, and your data</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{name || "Guest"}</Text>
          <Text style={styles.profileSub}>
            {email || "Guest account · saved on this device"}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.note}>
            Profile changes are kept in this app session.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.preference}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Weekly spending alerts</Text>
              <Text style={styles.note}>
                Show a warning when weekly spending is high.
              </Text>
            </View>
            <Switch
              value={alerts}
              onValueChange={setAlerts}
              trackColor={{ true: "#8061ed" }}
            />
          </View>
          <TouchableOpacity
            style={styles.action}
            onPress={() => Alert.alert("Currency", "PHP · Philippine peso (₱)")}
          >
            <Text style={styles.actionTitle}>Currency</Text>
            <Text style={styles.actionValue}>PHP ₱　›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() =>
              Alert.alert(
                "Password & security",
                "Sign-in and password reset require a connected authentication service.",
              )
            }
          >
            <Text style={styles.actionTitle}>Password & security</Text>
            <Text style={styles.actionValue}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your data</Text>
          <Text style={styles.note}>
            Export transaction data or remove it from this device.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={exportData}>
            <Text style={styles.primaryText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() =>
              Alert.alert(
                "Privacy policy",
                "This prototype stores transaction data locally on this device. It does not connect to an account server.",
              )
            }
          >
            <Text style={styles.actionTitle}>Privacy policy</Text>
            <Text style={styles.actionValue}>Read ›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.action, { borderBottomWidth: 0 }]}
            onPress={deleteData}
          >
            <Text style={styles.danger}>Delete local data</Text>
            <Text style={styles.actionValue}>›</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.tutorial}
          onPress={() =>
            Alert.alert(
              "Welcome to Spendly",
              "Track expenses, make a monthly plan, and record your income from the tabs below.",
            )
          }
        >
          <Text style={styles.tutorialText}>ⓘ　App tutorial</Text>
        </TouchableOpacity>
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
  profile: { alignItems: "center", paddingVertical: 13 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#eee7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 23, fontWeight: "800", color: "#7959e8" },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#202334",
    marginTop: 9,
  },
  profileSub: { fontSize: 10, color: "#9399a7", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 17,
    borderWidth: 1,
    borderColor: "#ececf2",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d2030",
    marginBottom: 13,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#687286",
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    height: 41,
    borderWidth: 1,
    borderColor: "#e8e8ee",
    borderRadius: 9,
    paddingHorizontal: 11,
    fontSize: 12,
  },
  note: { fontSize: 10, color: "#979dac", lineHeight: 16, marginTop: 7 },
  preference: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f4",
  },
  prefTitle: { fontSize: 12, fontWeight: "700", color: "#353b4c" },
  action: {
    height: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#f0f0f4",
  },
  actionTitle: { fontSize: 12, color: "#383e4e" },
  actionValue: { fontSize: 11, color: "#9299a8" },
  primaryButton: {
    height: 42,
    borderRadius: 9,
    backgroundColor: "#7859ed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 7,
  },
  primaryText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  danger: { fontSize: 12, color: "#c75d68" },
  tutorial: { alignItems: "center", padding: 10 },
  tutorialText: { fontSize: 11, color: "#7658ed", fontWeight: "700" },
});
