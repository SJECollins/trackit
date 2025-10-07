import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function PageView({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "scroll" | "fixed";
}) {
  const theme = useTheme();

  if (mode === "fixed") {
    return (
      <View
        style={{
          flex: 1,
          gap: 10,
          padding: 20,
          backgroundColor: theme.colors.background,
          paddingBottom: 8,
        }}
      >
        {children}
      </View>
    );
  }

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
