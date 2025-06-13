import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        This Stack.Screen is not strictly necessary here if you only have login/register
        and want no headers, as the parent _layout.tsx already hides them.
        But it's good practice for potential future screens within this group.
        You can also add a common header here if all auth screens should have one.
      */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}