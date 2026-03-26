import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1B5E20" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* The name must match the file path relative to the app folder */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="screens/subjects"
        options={{ title: "Select Subject" }}
      />
      <Stack.Screen
        name="screens/generator"
        options={{ title: "Generate Paper" }}
      />
      <Stack.Screen name="screens/login" options={{ headerShown: false }} />
      <Stack.Screen
        name="screens/studentDashboard"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
