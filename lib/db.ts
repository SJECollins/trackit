import * as SQLite from "expo-sqlite";

// Habit interface
export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "fortnightly" | "monthly" | "yearly";
  streak: number; // longest streak of habit completion
  remind: boolean;
  paused: boolean;
  trackedDates?: string[]; // dates when habit was completed
}

export interface AppSettings {
  id: number;
  remindersEnabled: boolean;
  reminderFrequency: "daily" | "weekly" | "monthly";
  notificationId: string | null;
}

const db = SQLite.openDatabaseSync("habits.db");

// Setup database
export const setupDatabase = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            frequency TEXT NOT NULL,
            streak INTEGER NOT NULL,
            remind BOOLEAN NOT NULL,
            paused BOOLEAN NOT NULL,
            trackedDates TEXT NOT NULL
        );`
  );

  // Add settings table
  db.execSync(
    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      remindersEnabled BOOLEAN NOT NULL DEFAULT 0,
      reminderFrequency TEXT NOT NULL DEFAULT 'daily',
      notificationId TEXT
    );`
  );

  // Insert default settings if none exist
  const settingsCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM settings;`
  );
  if (settingsCount?.count === 0) {
    db.runSync(
      `INSERT INTO settings (id, remindersEnabled, reminderFrequency, notificationId) VALUES (1, 0, 'daily', NULL);`
    );
  }
};

// Get all habits
export const getAllHabits = (): Habit[] => {
  const result = db.getAllSync(`SELECT * FROM habits;`);
  return result.map(
    (result: any): Habit => ({
      id: result.id.toString(),
      title: result.title,
      description: result.description,
      frequency: result.frequency,
      streak: result.streak,
      remind: result.remind,
      paused: result.paused,
      trackedDates: JSON.parse(result.trackedDates || "[]"),
    })
  );
};

// Get habit by ID
export const getHabitById = (id: string): Habit | null => {
  const result = db.getFirstSync<Habit>(`SELECT * FROM habits WHERE id = ?;`, [
    id,
  ]);
  if (!result) return null;

  return {
    id: result.id.toString(),
    title: result.title,
    description: result.description,
    frequency: result.frequency,
    streak: result.streak,
    remind: result.remind,
    paused: result.paused,
    trackedDates: JSON.parse(
      typeof result.trackedDates === "string" ? result.trackedDates : "[]"
    ),
  };
};

// Add a new habit
export const addHabit = (habit: Omit<Habit, "id">) => {
  db.runSync(
    `INSERT INTO habits (title, description, frequency, streak, remind, paused, trackedDates) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      habit.title,
      habit.description,
      habit.frequency,
      habit.streak,
      habit.remind,
      habit.paused,
      JSON.stringify(habit.trackedDates || []),
    ]
  );
};

// Update an existing habit
export const updateHabit = (id: string, habit: Habit) => {
  db.runSync(
    `UPDATE habits SET title = ?, description = ?, frequency = ?, streak = ?, remind = ?, paused = ?, trackedDates = ? WHERE id = ?;`,
    [
      habit.title,
      habit.description,
      habit.frequency,
      habit.streak,
      habit.remind,
      habit.paused,
      JSON.stringify(habit.trackedDates || []),
      id,
    ]
  );
};

// Checks if a habit was tracked yesterday by searching trackedDates for yesterday's date string
export const wasTrackedYesterday = (trackedDates: string[] = []) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestStr = yesterday.toISOString().split("T")[0];
  return trackedDates.includes(yestStr);
};

export const completedToday = (habit: Habit) => {
  const today = new Date().toISOString().split("T")[0];
  return habit.trackedDates?.includes(today);
};

export const checkOverdue = (habit: Habit) => {
  const today = new Date();
  const lastCompleted = habit.trackedDates?.[habit.trackedDates.length - 1];
  if (!lastCompleted) return true;

  const lastDate = new Date(lastCompleted);

  switch (habit.frequency) {
    case "daily":
      return today.toDateString() !== lastDate.toDateString();
    case "weekly": {
      const diff =
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 7;
    }
    case "fortnightly": {
      const diff =
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 14;
    }
    case "monthly": {
      let months =
        (today.getFullYear() - lastDate.getFullYear()) * 12 +
        (today.getMonth() - lastDate.getMonth());
      if (months > 1) return true;
      if (months === 1) return today.getDate() >= lastDate.getDate();
      return false;
    }
    case "yearly": {
      const years = today.getFullYear() - lastDate.getFullYear();
      if (years > 1) return true;
      if (years === 1)
        return (
          today.getMonth() > lastDate.getMonth() ||
          (today.getMonth() === lastDate.getMonth() &&
            today.getDate() >= lastDate.getDate())
        );
      return false;
    }
    default:
      return false;
  }
};

export const dueStatus = (habit: Habit) => {
  if (completedToday(habit)) {
    return "completed";
  } else if (checkOverdue(habit)) {
    return "overdue";
  } else {
    return "normal";
  }
};

// Record a date for a habit
export const addDateToHabit = (id: string, date: string) => {
  const habit = getHabitById(id);
  if (!habit) return;

  habit.trackedDates = habit.trackedDates || [];
  habit.trackedDates.push(date);
  // If yesterday was tracked, increment the streak
  if (wasTrackedYesterday(habit.trackedDates)) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }
  updateHabit(id, habit);
};

// Delete a habit
export const deleteHabit = (id: string) => {
  db.runSync(`DELETE FROM habits WHERE id = ?;`, [id]);
};

// Get notification settings
export const getNotificationSettings = (): AppSettings => {
  const result = db.getFirstSync<any>(`SELECT * FROM settings WHERE id = 1;`);
  return {
    id: 1,
    remindersEnabled: Boolean(result?.remindersEnabled),
    reminderFrequency: result?.reminderFrequency || "daily",
    notificationId: result?.notificationId || null,
  };
};

// Save notification settings
export const saveNotificationSettings = (
  remindersEnabled: boolean,
  reminderFrequency: "daily" | "weekly" | "monthly",
  notificationId: string | null
) => {
  db.runSync(
    `UPDATE settings SET remindersEnabled = ?, reminderFrequency = ?, notificationId = ? WHERE id = 1;`,
    [remindersEnabled ? 1 : 0, reminderFrequency, notificationId]
  );
};

// Reset database
export const resetDatabase = () => {
  db.execSync(`DROP TABLE IF EXISTS habits;`);
  db.execSync(`DROP TABLE IF EXISTS settings;`);
  setupDatabase();
};
