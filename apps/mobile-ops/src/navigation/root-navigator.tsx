import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { type RootStackParamList, Screens } from '../screens';
import { tokens } from '../theme/tokens';
import { mobileLinking } from './linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={tokens.colors.primary} size="large" />
        <Text style={styles.loadingText}>Restoring secure session…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer linking={mobileLinking}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: tokens.colors.ink,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          contentStyle: {
            backgroundColor: tokens.colors.background,
          },
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="Home" component={Screens.Home} options={{ title: 'Assignments' }} />
            <Stack.Screen
              name="AssignmentDetail"
              component={Screens.AssignmentDetail}
              options={{ title: 'Assignment details' }}
            />
            <Stack.Screen
              name="Remittance"
              component={Screens.Remittance}
              options={{ title: 'Record remittance' }}
            />
            <Stack.Screen
              name="Profile"
              component={Screens.Profile}
              options={{ title: 'Verification status' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={Screens.Login} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  loadingText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
  },
});
