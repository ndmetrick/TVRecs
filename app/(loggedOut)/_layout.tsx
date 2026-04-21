import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LoggedOutLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: '#340068' },
        tabBarActiveTintColor: '#36C9C6',
        tabBarInactiveTintColor: 'white',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="addShow"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="television-classic" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-add" color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
