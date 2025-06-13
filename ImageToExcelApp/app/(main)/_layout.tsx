import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    // Les écrans dans (main) auront leurs propres en-têtes ou pourront être configurés ici
    <Stack>
      <Stack.Screen
        name="dashboard" // Reflète app/(main)/dashboard.tsx
        options={{
          title: 'Tableau de bord', // Titre dans l'en-tête de la Stack
          headerShown: true, // Afficher l'en-tête pour les écrans authentifiés
        }}
      />
      {/* Ajoutez d'autres écrans authentifiés ici si nécessaire */}
    </Stack>
  );
}