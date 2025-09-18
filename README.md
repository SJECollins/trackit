# TRACK IT

Habit tracking app built with [Expo](https://expo.dev).

## Features

#### Habits

Add and edit habits you want to track (with a brief description).
The screen displaying details of a habit shows the name, brief description and the last time completed.
There are options to complete, edit or delete the habit on the details page.
React native calendars is used to visualise dates when the habit has been completed on a caledar.

#### Habit List

The index lists each habit by incomplete to complete (then frequency so daily ones come first).
From the index you can view the details of the habit or mark the habit as completed.
The last time the habit was completed is visible in this list.
The habit appearance changes if overdue.

#### Notifications

The user can enable notifications to remind them to check in daily/weekly/monthly. Not per habit as that might overdo things if you have multiple daily habits.

TODO: test notification timing

## Dependencies

- [react-native-paper](https://reactnativepaper.com/)
- [react-native-picker](https://www.npmjs.com/package/@react-native-picker/picker)
- [react-native-calendars](https://www.npmjs.com/package/react-native-calendars)

## Issues

<sub>Notes for myself on some issues I ran into.</sub>

### Calendar background

Found it hard to get the background colour of the calendar cells to match the theme background colour instead of just staying white. Solution which worked was setting style background colour to transparent and then the theme calendar background to the actual theme background colour.

```
<Calendar
   style={{ backgroundColor: "transparent" }}
   theme={{ calendarBackground: theme.colors.background }}
/>
```

### Picker background <sub>Not really resolved</sub>

Picker background colour is difficult to match the background colour of theme, particular in the default mode. Using **dropdown** mode removes top and bottom bars of the default colour and works best with using the theme background.

```
<Picker mode="dropdown">
```

## Running the App Yourself

### Fork the repo

>     Select "Fork" > "Create a new fork" to create a copy of the repo under your own account

### Clone the repo

To clone the app locally, in your terminal:

>     git clone https://github.com/username/reponame.git

- the url depends on whether cloning from your own fork or this repository

### Run the app

- Open the project in your editor
- Install dependencies with:

>     npm install

- Run the app with:

>     npx expo start

**Important**: This project uses expo-sqlite and initializes a database on startup so a physical phone is needed. [Expo Go](https://expo.dev/go) can be downloaded from the Google Play or App Store to connect your device and run the app.
