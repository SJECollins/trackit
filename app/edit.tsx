import HabitForm from "@/components/habitForm";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native-paper";

export default function EditTask() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  if (!habitId) {
    return <Text>No habit ID provided</Text>;
  }
  return <HabitForm habitId={habitId} />;
}
