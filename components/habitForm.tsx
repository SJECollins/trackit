import useStyles from "@/assets/styles";
import { addHabit, getHabitById, Habit, updateHabit } from "@/lib/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useMessage } from "../app/_layout";
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
  const styles = useStyles();
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
      <View style={styles.col}>
        <Text>Title:</Text>
        <TextInput
          label="Title"
          value={habit.title}
          onChangeText={(text) => setHabit({ ...habit, title: text })}
        />
      </View>
      <View style={styles.col}>
        <Text>Description:</Text>
        <TextInput
          label="Description"
          value={habit.description}
          onChangeText={(text) => setHabit({ ...habit, description: text })}
        />
      </View>
      <View style={styles.col}>
        <Picker
          style={{
            backgroundColor: theme.colors.background,
            width: "100%",
          }}
          mode="dropdown"
          selectedValue={habit.frequency}
          onValueChange={(itemValue) =>
            setHabit({
              ...habit,
              frequency: itemValue as
                | "daily"
                | "weekly"
                | "fortnightly"
                | "monthly"
                | "yearly",
            })
          }
        >
          <Picker.Item
            label="Daily"
            value="daily"
            style={{
              color: theme.colors.primary,
              backgroundColor: theme.colors.background,
            }}
          />
          <Picker.Item
            label="Weekly"
            value="weekly"
            style={{
              color: theme.colors.primary,
              backgroundColor: theme.colors.background,
            }}
          />
          <Picker.Item
            label="Fortnightly"
            value="fortnightly"
            style={{
              color: theme.colors.primary,
              backgroundColor: theme.colors.background,
            }}
          />
          <Picker.Item
            label="Monthly"
            value="monthly"
            style={{
              color: theme.colors.primary,
              backgroundColor: theme.colors.background,
            }}
          />
          <Picker.Item
            label="Yearly"
            value="yearly"
            style={{
              color: theme.colors.primary,
              backgroundColor: theme.colors.background,
            }}
          />
        </Picker>
      </View>
      <View style={styles.btnRow}>
        <Button mode="contained" onPress={handleSaveHabit} style={styles.btn}>
          {habitId ? "Update Habit" : "Add Habit"}
        </Button>
      </View>
    </PageView>
  );
}
