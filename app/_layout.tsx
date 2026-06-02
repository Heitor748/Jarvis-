import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000814" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
