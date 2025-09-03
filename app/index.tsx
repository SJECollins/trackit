import PageView from "@/components/pageView";
import {
  addDateToHabit,
  completedToday,
  dueStatus,
  getAllHabits,
  Habit,
} from "@/lib/db";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Divider, IconButton, List, Text } from "react-native-paper";

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
      <Button mode="contained-tonal" onPress={() => router.push("./add")}>
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
                onPress={() =>
                  router.push({
                    pathname: "./[id]",
                    params: { id: habit.id },
                  })
                }
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
