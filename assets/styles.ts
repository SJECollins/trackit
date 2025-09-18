import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const useStyles = () => {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
    },
    section: {
      flex: 1, // half the screen each
      padding: 10,
    },
    header: {
      marginBottom: 8,
    },
    empty: {
      textAlign: "center",
      marginTop: 20,
      opacity: 0.6,
    },
    completed: {
      textDecorationLine: "line-through",
      textShadowColor: "green",
    },
    normal: {
      // default style for normal status
    },
    overdue: {
      fontStyle: "italic",
      color: "red",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginVertical: 8,
    },
    col: {
      justifyContent: "space-evenly",
      marginVertical: 10,
      minHeight: 80,
      width: "100%",
    },
    divider: {
      marginVertical: 10,
    },
    btn: {
      marginTop: 10,
      width: "auto",
    },
    btnRow: {
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      textAlign: "center",
      textTransform: "uppercase",
      fontWeight: "700",
      color: theme.colors.primary,
    },
  });
};

export default useStyles;
