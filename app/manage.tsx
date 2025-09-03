import PageView from "@/components/pageView";
import { getNotificationSettings, resetDatabase } from "@/lib/db";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, RadioButton, Switch, Text } from "react-native-paper";
import { useAppTheme, useMessage } from "./_layout";

export default function ManageScreen() {
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    const settings = getNotificationSettings();
    setRemindersEnabled(settings.remindersEnabled);
    setRepeat(settings.reminderFrequency);
    setNotificationId(settings.notificationId);
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

      // Cancel existing notification first
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Reminder",
          body: "Don't forget your task!",
        },
        trigger: {
          seconds:
            repeat === "daily" ? 86400 : repeat === "weekly" ? 604800 : 2592000,
        } as Notifications.TimeIntervalTriggerInput,
      });

      setNotificationId(id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      triggerMessage("Error scheduling reminder: " + errorMsg, "error");
      setRemindersEnabled(false);
    }
  };

  const cancelReminder = async () => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      setNotificationId(null);
    }
    // TODO: Save enabled=false in SQLite
  };

  const toggleReminder = async (value: boolean) => {
    setRemindersEnabled(value);
    if (value) await scheduleReminder();
    else await cancelReminder();
  };

  return (
    <PageView>
      <ScrollView style={{ flex: 1, padding: 10 }}>
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
        <Button
          mode="contained"
          onPress={() => {
            resetDatabase();
            triggerMessage("Database reset successfully!", "success");
          }}
        >
          Reset Database
        </Button>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <Text variant="titleLarge">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </ScrollView>
    </PageView>
  );
}
