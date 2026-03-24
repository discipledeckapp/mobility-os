import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { useSelfService } from '../contexts/self-service-context';
import { AssignmentDetailScreen } from '../features/assignments/screens/AssignmentDetailScreen';
import { AssignmentsScreen } from '../features/assignments/screens/AssignmentsScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../features/auth/screens/ResetPasswordScreen';
import { SignupOtpScreen } from '../features/auth/screens/SignupOtpScreen';
import { SignupScreen } from '../features/auth/screens/SignupScreen';
import { ProfileScreen } from '../features/drivers/screens/ProfileScreen';
import { BusinessEntitiesScreen } from '../features/operator/screens/BusinessEntitiesScreen';
import { BusinessEntityDetailScreen } from '../features/operator/screens/BusinessEntityDetailScreen';
import { CreateAssignmentScreen } from '../features/operator/screens/CreateAssignmentScreen';
import { DriverDetailScreen } from '../features/operator/screens/DriverDetailScreen';
import { DriversScreen } from '../features/operator/screens/DriversScreen';
import { FleetDetailScreen } from '../features/operator/screens/FleetDetailScreen';
import { FleetsScreen } from '../features/operator/screens/FleetsScreen';
import { OperatingUnitDetailScreen } from '../features/operator/screens/OperatingUnitDetailScreen';
import { OperatingUnitsScreen } from '../features/operator/screens/OperatingUnitsScreen';
import { OperatorAssignmentsScreen } from '../features/operator/screens/OperatorAssignmentsScreen';
import { OperatorDashboardScreen } from '../features/operator/screens/OperatorDashboardScreen';
import { OperatorMoreScreen } from '../features/operator/screens/OperatorMoreScreen';
import { OperatorRemittanceDetailScreen } from '../features/operator/screens/OperatorRemittanceDetailScreen';
import { OperatorRemittanceScreen } from '../features/operator/screens/OperatorRemittanceScreen';
import { ReportsScreen } from '../features/operator/screens/ReportsScreen';
import { SettingsScreen } from '../features/operator/screens/SettingsScreen';
import { VehicleCreateScreen } from '../features/operator/screens/VehicleCreateScreen';
import { VehicleDetailScreen } from '../features/operator/screens/VehicleDetailScreen';
import { VehiclesScreen } from '../features/operator/screens/VehiclesScreen';
import { WalletScreen } from '../features/operator/screens/WalletScreen';
import { RemittanceHistoryScreen } from '../features/remittance/screens/RemittanceHistoryScreen';
import { RemittanceScreen } from '../features/remittance/screens/RemittanceScreen';
import { SelfServiceOtpScreen } from '../features/self-service/screens/SelfServiceOtpScreen';
import { SelfServiceReadinessScreen } from '../features/self-service/screens/SelfServiceReadinessScreen';
import { SelfServiceResumeScreen } from '../features/self-service/screens/SelfServiceResumeScreen';
import { SelfServiceVerificationScreen } from '../features/self-service/screens/SelfServiceVerificationScreen';
import { tokens } from '../theme/tokens';
import { isDriverMobileSession } from '../utils/roles';
import { mobileLinking } from './linking';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { token: selfServiceToken, isLoading: isSelfServiceLoading } = useSelfService();
  const isDriverMode = isDriverMobileSession(session);

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
          isDriverMode ? (
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
          ) : (
            <>
              <Stack.Screen
                name="OperatorDashboard"
                component={OperatorDashboardScreen}
                options={{ title: 'Dashboard' }}
              />
              <Stack.Screen
                name="OperatorDrivers"
                component={DriversScreen}
                options={{ title: 'Drivers' }}
              />
              <Stack.Screen
                name="OperatorDriverDetail"
                component={DriverDetailScreen}
                options={{ title: 'Driver detail' }}
              />
              <Stack.Screen
                name="OperatorAssignments"
                component={OperatorAssignmentsScreen}
                options={{ title: 'Assignments' }}
              />
              <Stack.Screen
                name="OperatorAssignmentCreate"
                component={CreateAssignmentScreen}
                options={{ title: 'Create assignment' }}
              />
              <Stack.Screen
                name="OperatorRemittance"
                component={OperatorRemittanceScreen}
                options={{ title: 'Remittance' }}
              />
              <Stack.Screen
                name="OperatorRemittanceDetail"
                component={OperatorRemittanceDetailScreen}
                options={{ title: 'Remittance detail' }}
              />
              <Stack.Screen
                name="OperatorVehicles"
                component={VehiclesScreen}
                options={{ title: 'Vehicles' }}
              />
              <Stack.Screen
                name="OperatorVehicleCreate"
                component={VehicleCreateScreen}
                options={{ title: 'Create vehicle' }}
              />
              <Stack.Screen
                name="OperatorVehicleDetail"
                component={VehicleDetailScreen}
                options={{ title: 'Vehicle detail' }}
              />
              <Stack.Screen
                name="OperatorBusinessEntities"
                component={BusinessEntitiesScreen}
                options={{ title: 'Business entities' }}
              />
              <Stack.Screen
                name="OperatorBusinessEntityDetail"
                component={BusinessEntityDetailScreen}
                options={{ title: 'Business entity' }}
              />
              <Stack.Screen
                name="OperatorOperatingUnits"
                component={OperatingUnitsScreen}
                options={{ title: 'Operating units' }}
              />
              <Stack.Screen
                name="OperatorOperatingUnitDetail"
                component={OperatingUnitDetailScreen}
                options={{ title: 'Operating unit' }}
              />
              <Stack.Screen
                name="OperatorFleets"
                component={FleetsScreen}
                options={{ title: 'Fleets' }}
              />
              <Stack.Screen
                name="OperatorFleetDetail"
                component={FleetDetailScreen}
                options={{ title: 'Fleet' }}
              />
              <Stack.Screen
                name="OperatorReports"
                component={ReportsScreen}
                options={{ title: 'Reports' }}
              />
              <Stack.Screen
                name="OperatorWallet"
                component={WalletScreen}
                options={{ title: 'Wallet' }}
              />
              <Stack.Screen
                name="OperatorSettings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen
                name="OperatorMore"
                component={OperatorMoreScreen}
                options={{ title: 'More' }}
              />
            </>
          )
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
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create organisation' }} />
            <Stack.Screen
              name="SignupOtp"
              component={SignupOtpScreen}
              options={{ title: 'Verify organisation' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Forgot password' }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ title: 'Reset password' }}
            />
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
