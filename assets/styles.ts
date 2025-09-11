import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  col: {
    justifyContent: "space-between",
    marginVertical: 10,
    height: 100,
    width: "100%",
  },
});

export default styles;
