import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
          },
          default: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e9ecef',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      
      {/* Dashboard Principal */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? 'house.fill' : 'house'} 
              color={color} 
            />
          ),
          tabBarBadge: undefined, // Peut être utilisé pour afficher des notifications
        }}
      />

      {/* Scanner */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? 'camera.fill' : 'camera'} 
              color={color} 
            />
          ),
        }}
      />

      {/* Historique/Fichiers */}
      <Tabs.Screen
        name="files"
        options={{
          title: 'Fichiers',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? 'doc.fill' : 'doc'} 
              color={color} 
            />
          ),
        }}
      />

      {/* Explorer */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? 'sparkles' : 'sparkles'} 
              color={color} 
            />
          ),
        }}
      />

      {/* Profil/Paramètres */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24} 
              name={focused ? 'person.fill' : 'person'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}