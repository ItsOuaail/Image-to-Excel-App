import { Stack } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth.tsx'; // Make sure this is .tsx now

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Your welcome screen (index.tsx) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* The (auth) group will handle its own navigation logic via app/(auth)/_layout.tsx */}
        {/* You reference the group by its folder name */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* You'll later add a (main) group for authenticated screens */}
        {/* <Stack.Screen name="(main)" options={{ headerShown: false }} /> */}
      </Stack>
    </AuthProvider>
  );
}