import useStyles from "@/assets/styles";
import PageView from "@/components/pageView";
import {
  getNotificationSettings,
  resetDatabase,
  saveNotificationSettings,
} from "@/lib/db";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, Divider, RadioButton, Switch, Text } from "react-native-paper";
import { useAppTheme, useMessage } from "./_layout";

export default function ManageScreen() {
  const styles = useStyles();
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<"daily" | "weekly" | "monthly">("daily");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const settings = getNotificationSettings();
    setRemindersEnabled(settings.remindersEnabled);
    setRepeat(settings.reminderFrequency);
    setNotificationId(settings.notificationId);
    setReminderTime(
      settings.reminderTime ? new Date(settings.reminderTime) : new Date()
    );
  }, []);

  const scheduleReminder = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Enable notifications to use reminders."
        );
        setRemindersEnabled(false);
        return;
      }

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      console.log("Raw reminderTime:", reminderTime);
      console.log(
        "Is valid date:",
        reminderTime instanceof Date && !isNaN(reminderTime.getTime())
      );

      let validReminderTime = reminderTime;
      if (!(reminderTime instanceof Date) || isNaN(reminderTime.getTime())) {
        validReminderTime = new Date();
        validReminderTime.setMinutes(validReminderTime.getMinutes() + 1);
        setReminderTime(validReminderTime);
        console.log("Using fallback time:", validReminderTime.toISOString());
      }

      const now = new Date();
      let nextTriggerTime;

      const todayAtReminderTime = new Date();
      todayAtReminderTime.setHours(
        validReminderTime.getHours(),
        validReminderTime.getMinutes(),
        validReminderTime.getSeconds(),
        validReminderTime.getMilliseconds()
      );

      console.log("Current time:", now);
      console.log("Valid reminder time:", validReminderTime);
      console.log("Today at reminder time:", todayAtReminderTime);

      if (todayAtReminderTime > now) {
        nextTriggerTime = todayAtReminderTime;
      } else {
        switch (repeat) {
          case "daily":
            nextTriggerTime = new Date(todayAtReminderTime);
            nextTriggerTime.setDate(nextTriggerTime.getDate() + 1);
            break;
          case "weekly":
            nextTriggerTime = new Date(todayAtReminderTime);
            nextTriggerTime.setDate(nextTriggerTime.getDate() + 7);
            break;
          case "monthly":
            nextTriggerTime = new Date(todayAtReminderTime);

            const nextMonth = nextTriggerTime.getMonth() + 1;
            const nextYear =
              nextMonth > 11
                ? nextTriggerTime.getFullYear() + 1
                : nextTriggerTime.getFullYear();
            const targetMonth = nextMonth > 11 ? 0 : nextMonth;

            nextTriggerTime.setFullYear(nextYear, targetMonth, 1);
            const day = Number(todayAtReminderTime.getDate()) || 1;
            const daysInTargetMonth = new Date(
              nextYear,
              targetMonth + 1,
              0
            ).getDate();
            nextTriggerTime.setDate(Math.min(day, daysInTargetMonth));

            break;
        }
      }

      console.log("Next trigger time:", nextTriggerTime);

      const secondsUntilTrigger = Math.round(
        (nextTriggerTime.getTime() - now.getTime()) / 1000
      );

      console.log("Seconds until trigger:", secondsUntilTrigger);

      if (secondsUntilTrigger <= 0) {
        throw new Error(
          `Invalid trigger time: ${secondsUntilTrigger} seconds. Next trigger: ${nextTriggerTime}`
        );
      }

      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(secondsUntilTrigger, 1),
        repeats: false,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Habit Reminder",
          body: "Time to check your habits!",
          data: {
            type: "habit_reminder",
            frequency: repeat,
            originalTime: reminderTime.toISOString(),
          },
        },
        trigger,
      });

      setNotificationId(id);
      saveNotificationSettings(
        remindersEnabled,
        repeat,
        id,
        reminderTime.toISOString()
      );

      const nextTriggerStr = nextTriggerTime.toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      triggerMessage(`Next reminder: ${nextTriggerStr}`, "success");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error scheduling reminder: " + errorMsg, "error");
      setRemindersEnabled(false);
    }
  };

  useEffect(() => {
    const settings = getNotificationSettings();
    setRemindersEnabled(settings.remindersEnabled);
    setRepeat(settings.reminderFrequency);
    setNotificationId(settings.notificationId);

    const dbTime = settings.reminderTime
      ? new Date(settings.reminderTime)
      : new Date();
    const validTime = isNaN(dbTime.getTime()) ? new Date() : dbTime;

    setReminderTime(validTime);
  }, []);

  const cancelReminder = async () => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      setNotificationId(null);
      saveNotificationSettings(
        remindersEnabled,
        repeat,
        null,
        reminderTime.toISOString()
      );
    }
  };

  const toggleReminder = async (value: boolean) => {
    setRemindersEnabled(value);
    if (value) {
      await scheduleReminder();
    } else {
      await cancelReminder();
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowPicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
      if (remindersEnabled) {
        scheduleReminder();
      } else {
        saveNotificationSettings(
          remindersEnabled,
          repeat,
          notificationId,
          selectedTime.toISOString()
        );
      }
    }
  };

  return (
    <PageView>
      <ScrollView style={{ flex: 1, padding: 10 }}>
        {/* Reminders Toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
            alignItems: "center",
          }}
        >
          <Text variant="titleLarge">Reminders</Text>
          <Switch value={remindersEnabled} onValueChange={toggleReminder} />
        </View>

        {/* Reminder Time Picker */}
        {remindersEnabled && (
          <View style={{ marginTop: 10 }}>
            <Text>
              Reminder Time:{" "}
              {reminderTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Button onPress={() => setShowPicker(true)}>Change Time</Button>
            {showPicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>
        )}

        {/* Repeat Frequency */}
        <RadioButton.Group
          onValueChange={(value) =>
            setRepeat(value as "daily" | "weekly" | "monthly")
          }
          value={repeat}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <RadioButton value="daily" />
            <Text>Daily</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <RadioButton value="weekly" />
            <Text>Weekly</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <RadioButton value="monthly" />
            <Text>Monthly</Text>
          </View>
        </RadioButton.Group>

        <Divider style={styles.divider} />

        {/* Reset Database */}
        <View style={styles.btnRow}>
          <Button
            mode="contained"
            style={styles.btn}
            onPress={() => {
              resetDatabase();
              triggerMessage("Database reset successfully!", "success");
            }}
          >
            Reset Database
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Dark Mode */}
        <View style={styles.row}>
          <Text variant="titleLarge">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </ScrollView>
    </PageView>
  );
}
