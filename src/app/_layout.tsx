import { DarkTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  GuestSessionProvider,
  useGuestSession,
} from "@/context/GuestSessionContext";
import {
  ExpensesProvider,
  useExpensesContext,
} from "@/context/ExpensesContext";
import SessionGate from "@/components/session/SessionGate";
void SplashScreen.preventAutoHideAsync();
function AppEntry() {
  const { ready } = useGuestSession();
  const { loaded } = useExpensesContext();
  useEffect(() => {
    if (ready && loaded) void SplashScreen.hideAsync();
  }, [ready, loaded]);
  return <SessionGate />;
}
export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <GuestSessionProvider>
        <ExpensesProvider>
          <AppEntry />
        </ExpensesProvider>
      </GuestSessionProvider>
    </ThemeProvider>
  );
}
