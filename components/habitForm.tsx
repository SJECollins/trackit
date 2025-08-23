import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useMessage } from "../app/_layout";
import { getHabitById, addHabit, updateHabit, Habit } from "@/lib/db";
import { useTheme, Button, TextInput, Text } from "react-native-paper";
import PageView from "./pageView";

const initialHabitState: Omit<Habit, "id"> = {
  title: "",
  description: "",
  frequency: "daily",
  streak: 0,
  remind: false,
  paused: false,
  trackedDates: [],
};

export default function HabitForm({ habitId }: { habitId: string | null }) {
  const router = useRouter();
  const { triggerMessage } = useMessage();
  const theme = useTheme();
  const [habit, setHabit] = useState<Omit<Habit, "id">>(initialHabitState);

  const loadData = async () => {
    if (habitId) {
      try {
        const habit = getHabitById(habitId);
        if (habit) {
          setHabit({
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency,
            streak: habit.streak,
            remind: habit.remind,
            paused: habit.paused,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        triggerMessage("Error loading habit: " + errorMsg, "error");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [habitId])
  );

  const handleSaveHabit = async () => {
    if (habitId) {
      try {
        updateHabit(habitId, habit as Habit);
        triggerMessage("Habit updated successfully!", "success");
        router.push("/");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        triggerMessage("Error updating habit: " + errorMsg, "error");
      }
    } else {
      try {
        addHabit(habit as Omit<Habit, "id">);
        triggerMessage("Habit added successfully!", "success");
        router.push("/");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        triggerMessage("Error adding habit: " + errorMsg, "error");
      }
    }
  };

  return (
    <PageView>
      <Text variant="titleLarge">{habitId ? "Edit Habit" : "Add Habit"}</Text>
      {/* Form fields for title, description, frequency, etc. would go here */}
      <Button
        mode="contained"
        onPress={handleSaveHabit}
        style={{ marginTop: 16 }}
      >
        {habitId ? "Update Habit" : "Add Habit"}
      </Button>
    </PageView>
  );
}
