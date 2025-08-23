import { ScrollView, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import PageView from "@/components/pageView";
import { Button, Divider, IconButton, List, Text } from "react-native-paper";
import {
  getAllHabits,
  addDateToHabit,
  completedToday,
  dueStatus,
  Habit,
} from "@/lib/db";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

const sortByFrequency = (habits: Habit[]) => {
  return habits.sort((a, b) => {
    const frequencyOrder = {
      daily: 1,
      weekly: 2,
      fortnightly: 3,
      monthly: 4,
      yearly: 5,
    };
    return frequencyOrder[a.frequency] - frequencyOrder[b.frequency];
  });
};

export default function Index() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);

  const loadData = () => {
    const fetchedHabits = getAllHabits();
    const sortedHabits = sortByFrequency(fetchedHabits);
    setHabits(sortedHabits);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const handleTickHabit = (id: string) => {
    addDateToHabit(id, new Date().toISOString().split("T")[0]);
    loadData();
  };

  return (
    <PageView>
      <Text variant="titleLarge">Track It</Text>
      <Button mode="contained-tonal" onPress={() => router.push("./add.tsx")}>
        Add Habit
      </Button>
      <Divider />
      <ScrollView style={styles.container}>
        {habits.map((habit) => (
          <List.Item
            key={habit.id}
            title={habit.title}
            titleStyle={styles[dueStatus(habit)]}
            description={habit.description}
            left={() => (
              <IconButton
                icon={
                  completedToday(habit)
                    ? "check-circle"
                    : "checkbox-blank-circle-outline"
                }
                mode="contained-tonal"
                onPress={() => handleTickHabit(habit.id)}
              />
            )}
            right={() => (
              <IconButton
                mode="contained-tonal"
                icon="eye"
                onPress={() => router.push(`./[id].tsx`)}
              />
            )}
          />
        ))}
      </ScrollView>
    </PageView>
  );
}

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
});
