import { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";

export default function PageView({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        gap: 10,
        padding: 20,
        backgroundColor: theme.colors.background,
        paddingBottom: 100,
      }}
    >
      {children}
    </ScrollView>
  );
}
