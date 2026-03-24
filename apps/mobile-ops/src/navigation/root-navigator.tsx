import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { useSelfService } from '../contexts/self-service-context';
import { AssignmentDetailScreen } from '../features/assignments/screens/AssignmentDetailScreen';
import { AssignmentsScreen } from '../features/assignments/screens/AssignmentsScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { ProfileScreen } from '../features/drivers/screens/ProfileScreen';
import { RemittanceHistoryScreen } from '../features/remittance/screens/RemittanceHistoryScreen';
import { RemittanceScreen } from '../features/remittance/screens/RemittanceScreen';
import { SelfServiceOtpScreen } from '../features/self-service/screens/SelfServiceOtpScreen';
import { SelfServiceReadinessScreen } from '../features/self-service/screens/SelfServiceReadinessScreen';
import { SelfServiceResumeScreen } from '../features/self-service/screens/SelfServiceResumeScreen';
import { SelfServiceVerificationScreen } from '../features/self-service/screens/SelfServiceVerificationScreen';
import { tokens } from '../theme/tokens';
import { mobileLinking } from './linking';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { token: selfServiceToken, isLoading: isSelfServiceLoading } = useSelfService();

  if (isLoading || isSelfServiceLoading) {
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
            <Stack.Screen name="Home" component={AssignmentsScreen} options={{ title: 'Assignments' }} />
            <Stack.Screen
              name="AssignmentDetail"
              component={AssignmentDetailScreen}
              options={{ title: 'Assignment details' }}
            />
            <Stack.Screen
              name="Remittance"
              component={RemittanceScreen}
              options={{ title: 'Record remittance' }}
            />
            <Stack.Screen
              name="RemittanceHistory"
              component={RemittanceHistoryScreen}
              options={{ title: 'Remittance history' }}
            />
            <Stack.Screen
              name="SelfServiceResume"
              component={SelfServiceResumeScreen}
              options={{ title: 'Driver verification' }}
            />
            <Stack.Screen
              name="SelfServiceVerification"
              component={SelfServiceVerificationScreen}
              options={{ title: 'Complete verification' }}
            />
            <Stack.Screen
              name="SelfServiceReadiness"
              component={SelfServiceReadinessScreen}
              options={{ title: 'Readiness checklist' }}
            />
            <Stack.Screen
              name="SelfServiceOtp"
              component={SelfServiceOtpScreen}
              options={{ title: 'Verification access' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Verification status' }}
            />
          </>
        ) : selfServiceToken ? (
          <>
            <Stack.Screen
              name="SelfServiceResume"
              component={SelfServiceResumeScreen}
              options={{ title: 'Driver verification' }}
            />
            <Stack.Screen
              name="SelfServiceVerification"
              component={SelfServiceVerificationScreen}
              options={{ title: 'Complete verification' }}
            />
            <Stack.Screen
              name="SelfServiceReadiness"
              component={SelfServiceReadinessScreen}
              options={{ title: 'Readiness checklist' }}
            />
            <Stack.Screen
              name="SelfServiceOtp"
              component={SelfServiceOtpScreen}
              options={{ title: 'Verification access' }}
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="SelfServiceOtp"
              component={SelfServiceOtpScreen}
              options={{ title: 'Verification access' }}
            />
            <Stack.Screen
              name="SelfServiceResume"
              component={SelfServiceResumeScreen}
              options={{ title: 'Driver verification' }}
            />
            <Stack.Screen
              name="SelfServiceVerification"
              component={SelfServiceVerificationScreen}
              options={{ title: 'Complete verification' }}
            />
            <Stack.Screen
              name="SelfServiceReadiness"
              component={SelfServiceReadinessScreen}
              options={{ title: 'Readiness checklist' }}
            />
          </>
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
