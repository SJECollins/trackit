import DisplayMessage from "@/components/displayMessage";
import { setupDatabase } from "@/lib/db";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

// Handle theme for app, based on device theme - darkmode by default
const ThemeContext = createContext<
  { darkMode: boolean; toggleTheme: () => void } | undefined
>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );
  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Messages/notifications
interface MessageContextType {
  message: string | null;
  messageType: "error" | "success" | null;
  triggerMessage: (message: string, type: "error" | "success") => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | null>(
    null
  );

  const triggerMessage = (msg: string, type: "error" | "success") => {
    setMessage(msg);
    setMessageType(type);
  };

  return (
    <MessageContext.Provider value={{ message, messageType, triggerMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

// Root layout - bottom tabs for navigation
function RootLayout() {
  const { darkMode } = useAppTheme();
  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const { message, messageType } = useMessage();

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <DisplayMessage
        messageText={message ?? ""}
        messageType={messageType ?? "success"}
      />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarStyle: { backgroundColor: theme.colors.surface },
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Habits",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="check-circle-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="manage"
          options={{
            title: "Manage",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cog-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Habit",
            href: null,
          }}
        />
        <Tabs.Screen
          name="edit"
          options={{
            title: "Edit Habit",
            href: null,
          }}
        />
        <Tabs.Screen
          name="[id]"
          options={{
            title: "Habit Details",
            href: null,
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}

// Layout wrapper - all the bits
export default function LayoutWrapper() {
  useEffect(() => {
    setupDatabase();
  }, []);

  return (
    <ThemeProvider>
      <MessageProvider>
        <RootLayout />
      </MessageProvider>
    </ThemeProvider>
  );
}
