import PageView from "@/components/pageView";
import { completedToday, deleteHabit, getHabitById, Habit } from "@/lib/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Divider, Modal, Text } from "react-native-paper";
import { useMessage } from "./_layout";

export default function HabitDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = () => {
    try {
      if (id) {
        const habit = getHabitById(id[0]);
        setHabit(habit);
        if (!habit) {
          triggerMessage("Habit not found", "error");
          return;
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error load habit: " + errorMsg, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (!habit) {
    return <Text>Loading...</Text>;
  }

  const deleteHabitHandler = () => {
    try {
      if (id) {
        deleteHabit(id[0]);
        triggerMessage("Habit deleted successfully", "success");
        router.push("/");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error deleting habit: " + errorMsg, "error");
    }
  };

  return (
    <PageView>
      <View style={styles.col}>
        <Text variant="titleLarge">{habit.title}</Text>
        <Text variant="bodyMedium">{habit.description}</Text>
        <Text variant="bodyMedium">{habit.frequency}</Text>
      </View>
      <Divider />
      <View style={styles.col}>
        {habit.trackedDates?.length === 0 ? (
          <Text variant="bodyMedium">Last Completed: Never</Text>
        ) : completedToday(habit) ? (
          <Text variant="bodyMedium">Last Completed: Today</Text>
        ) : (
          <Text variant="bodyMedium">
            Last Completed:{" "}
            {habit.trackedDates?.[habit.trackedDates.length - 1]}
          </Text>
        )}
      </View>
      <Divider />
      <View style={styles.row}>
        <Button onPress={() => setModalVisible(false)}>Edit</Button>
        <Button onPress={() => setModalVisible(true)}>Delete</Button>
      </View>

      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <Text variant="titleLarge">Confirm Deletion</Text>
        <Text variant="bodyMedium">
          Are you sure you want to delete this habit?
        </Text>
        <View style={styles.row}>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          <Button onPress={deleteHabitHandler}>Confirm</Button>
        </View>
      </Modal>
    </PageView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  col: {
    flexDirection: "column",
    gap: 8,
  },
});
