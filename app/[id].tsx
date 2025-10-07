import PageView from "@/components/pageView";
import {
  addDateToHabit,
  completedToday,
  deleteHabit,
  getHabitById,
  Habit,
} from "@/lib/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";
import { Button, Divider, Modal, Text, useTheme } from "react-native-paper";
import useStyles from "../assets/styles";
import { useMessage } from "./_layout";

export default function HabitDetail() {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [view, setView] = useState<"month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

  const markedDates: Record<string, { marked: boolean; dotColor: string }> = {};
  habit.trackedDates?.forEach((date) => {
    markedDates[date] = { marked: true, dotColor: "green" };
  });

  const handleTickHabit = () => {
    addDateToHabit(id[0], new Date().toISOString().split("T")[0]);
    loadData();
  };

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

  const pastScrollLength = () => {
    const earliest = habit.trackedDates?.reduce((a, b) =>
      a < b ? a : b
    ) as string;
    const earliestDate = new Date(earliest);
    const today = new Date();
    const diffInMonths =
      (today.getFullYear() - earliestDate.getFullYear()) * 12 +
      (today.getMonth() - earliestDate.getMonth());
    return diffInMonths + 1; // +1 to include the current month
  };

  const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <PageView mode="scroll">
      <View style={styles.col}>
        <Text variant="headlineLarge" style={styles.title}>
          {habit.title}
        </Text>
        <Text variant="bodyMedium">{habit.description}</Text>
        <Text variant="bodyMedium">
          Frequency: {capitalise(habit.frequency)}
        </Text>
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
      <Divider style={styles.divider} />
      <View style={styles.btnRow}>
        <Button mode="contained" onPress={handleTickHabit}>
          Mark Completed
        </Button>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.row}>
        <Button
          mode="contained"
          onPress={() =>
            router.push({ pathname: "/edit", params: { habitId: habit.id } })
          }
        >
          Edit
        </Button>
        <Button mode="contained-tonal" onPress={() => setModalVisible(true)}>
          Delete
        </Button>
      </View>

      <Divider style={styles.divider} />
      <Picker
        style={{
          backgroundColor: theme.colors.background,
          width: "100%",
          alignSelf: "center",
          marginBottom: 10,
        }}
        mode="dropdown"
        selectedValue={view}
        onValueChange={(itemValue) => setView(itemValue as "month" | "year")}
      >
        <Picker.Item
          style={{
            color: theme.colors.primary,
            backgroundColor: theme.colors.background,
          }}
          label="Month"
          value="month"
        />
        <Picker.Item
          style={{
            color: theme.colors.primary,
            backgroundColor: theme.colors.background,
          }}
          label="Year"
          value="year"
        />
      </Picker>
      {view === "year" ? (
        <CalendarList
          style={{ backgroundColor: "transparent", marginBottom: 20 }}
          theme={{
            calendarBackground: theme.colors.background,
            dayTextColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            textSectionTitleColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            textDisabledColor: "grey",
          }}
          current={selectedDate}
          horizontal
          pastScrollRange={pastScrollLength()}
          futureScrollRange={0}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType={"dot"}
        />
      ) : (
        <Calendar
          style={{ backgroundColor: "transparent", marginBottom: 20 }}
          theme={{
            calendarBackground: theme.colors.background,
            dayTextColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            textSectionTitleColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            textDisabledColor: "grey",
          }}
          current={selectedDate}
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType={"dot"}
        />
      )}

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
