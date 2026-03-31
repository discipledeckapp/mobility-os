import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ProcessingScreen } from '../components/processing-state';
import { useAppEntry } from '../contexts/app-entry-context';
import { useAuth } from '../contexts/auth-context';
import { useSelfService } from '../contexts/self-service-context';
import { AssignmentDetailScreen } from '../features/assignments/screens/AssignmentDetailScreen';
import { AssignmentsScreen } from '../features/assignments/screens/AssignmentsScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RoleSelectionScreen } from '../features/auth/screens/RoleSelectionScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { LegalDocumentScreen } from '../features/auth/screens/LegalDocumentScreen';
import { ResetPasswordScreen } from '../features/auth/screens/ResetPasswordScreen';
import { SignupOtpScreen } from '../features/auth/screens/SignupOtpScreen';
import { SignupScreen } from '../features/auth/screens/SignupScreen';
import { NotificationsScreen } from '../features/drivers/screens/NotificationsScreen';
import { ProfileScreen } from '../features/drivers/screens/ProfileScreen';
import { BusinessEntitiesScreen } from '../features/operator/screens/BusinessEntitiesScreen';
import { BusinessEntityDetailScreen } from '../features/operator/screens/BusinessEntityDetailScreen';
import { CreateAssignmentScreen } from '../features/operator/screens/CreateAssignmentScreen';
import { OfflineQueueScreen } from '../features/operator/screens/OfflineQueueScreen';
import { OperatorAuditScreen } from '../features/operator/screens/OperatorAuditScreen';
import { DriverDetailScreen } from '../features/operator/screens/DriverDetailScreen';
import { DriversScreen } from '../features/operator/screens/DriversScreen';
import { FleetDetailScreen } from '../features/operator/screens/FleetDetailScreen';
import { FleetsScreen } from '../features/operator/screens/FleetsScreen';
import { OperatorComplianceScreen } from '../features/operator/screens/OperatorComplianceScreen';
import { OperatingUnitDetailScreen } from '../features/operator/screens/OperatingUnitDetailScreen';
import { OperatingUnitsScreen } from '../features/operator/screens/OperatingUnitsScreen';
import { OperatorAssignmentsScreen } from '../features/operator/screens/OperatorAssignmentsScreen';
import { OperatorDashboardScreen } from '../features/operator/screens/OperatorDashboardScreen';
import { OperatorInspectionsScreen } from '../features/operator/screens/OperatorInspectionsScreen';
import { OperatorMaintenanceScreen } from '../features/operator/screens/OperatorMaintenanceScreen';
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
import { DriverAccountSetupScreen } from '../features/self-service/screens/DriverAccountSetupScreen';
import { DriverGuarantorScreen } from '../features/self-service/screens/DriverGuarantorScreen';
import { GuarantorSelfServiceScreen } from '../features/self-service/screens/GuarantorSelfServiceScreen';
import { SelfServiceOtpScreen } from '../features/self-service/screens/SelfServiceOtpScreen';
import { SelfServiceReadinessScreen } from '../features/self-service/screens/SelfServiceReadinessScreen';
import { SelfServiceResumeScreen } from '../features/self-service/screens/SelfServiceResumeScreen';
import { SelfServiceVerificationScreen } from '../features/self-service/screens/SelfServiceVerificationScreen';
import { tokens } from '../theme/tokens';
import {
  getMobileSessionExperience,
  isDriverMobileSession,
  isDriverScopedSession,
} from '../utils/roles';
import { mobileLinking } from './linking';
import { rootNavigationRef } from './navigation-ref';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { selectedRole, isLoading: isEntryLoading, setSelectedRole } = useAppEntry();
  const {
    token: selfServiceToken,
    driver: selfServiceDriver,
    documents: selfServiceDocuments,
    isLoading: isSelfServiceLoading,
  } = useSelfService();
  const sessionExperience = getMobileSessionExperience(session);
  const isDriverMode = isDriverScopedSession(session);
  const isDriverMobileMode = isDriverMobileSession(session);
  const requiresSelfServiceContinuation =
    isDriverMode &&
    Boolean(
      selfServiceDriver &&
        (!selfServiceDriver.firstName ||
          !selfServiceDriver.lastName ||
          !selfServiceDriver.dateOfBirth ||
          selfServiceDriver.verificationPaymentStatus === 'driver_payment_required' ||
          selfServiceDriver.verificationPaymentStatus === 'wallet_missing' ||
          selfServiceDriver.verificationPaymentStatus === 'insufficient_balance' ||
          ((selfServiceDriver.requireIdentityVerificationForActivation ?? true) &&
            !['pending_verification', 'verified', 'review_needed', 'failed'].includes(
              selfServiceDriver.identityStatus,
            )) ||
          (selfServiceDriver.requiredDriverDocumentSlugs ?? []).some(
            (slug) =>
              !selfServiceDocuments.some((document) => document.documentType === slug),
          )),
    );

  useEffect(() => {
    if (sessionExperience === 'guarantor_self_service' && selectedRole !== 'guarantor') {
      void setSelectedRole('guarantor');
      return;
    }

    if (sessionExperience === 'driver_scoped' && selectedRole !== 'driver') {
      void setSelectedRole('driver');
      return;
    }

    if (sessionExperience === 'operator' && selectedRole !== 'operator') {
      void setSelectedRole('operator');
      return;
    }

    if (!session && selfServiceToken && selectedRole !== 'driver') {
      void setSelectedRole('driver');
    }
  }, [selectedRole, selfServiceToken, session, sessionExperience, setSelectedRole]);

  if (isLoading || isSelfServiceLoading || isEntryLoading) {
    return (
      <ProcessingScreen
        activeStep={1}
        message="Recovering your account access, restoring onboarding progress, and preparing the right surface for this session."
        steps={[
          'Checking account access',
          'Restoring onboarding progress',
          'Preparing your workspace',
        ]}
        tips={[
          'Verified onboarding progress can be resumed across sessions.',
          'Keeping access and readiness separate makes recovery faster.',
        ]}
        title="Restoring your secure session"
        variant="onboarding"
      />
    );
  }

  const initialRouteName: keyof RootStackParamList = session
    ? sessionExperience === 'guarantor_self_service'
      ? 'GuarantorSelfService'
      : isDriverMode
        ? requiresSelfServiceContinuation
          ? 'SelfServiceResume'
          : isDriverMobileMode
            ? 'Home'
            : 'SelfServiceReadiness'
        : 'OperatorDashboard'
    : selfServiceToken
      ? 'SelfServiceResume'
      : selectedRole
        ? 'Login'
        : 'RoleSelection';

  return (
    <NavigationContainer linking={mobileLinking} ref={rootNavigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
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
          sessionExperience === 'guarantor_self_service' ? (
          <>
            <Stack.Screen
              name="LegalDocument"
              component={LegalDocumentScreen}
              options={{ title: 'Legal document' }}
            />
            <Stack.Screen
              name="GuarantorSelfService"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor onboarding' }}
            />
            <Stack.Screen
              name="GuarantorSelfServiceOtp"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor access' }}
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </>
          ) : isDriverMode ? (
          <>
            <Stack.Screen
              name="LegalDocument"
              component={LegalDocumentScreen}
              options={{ title: 'Legal document' }}
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
              name="DriverAccountSetup"
              component={DriverAccountSetupScreen}
              options={{ title: 'Set up account' }}
            />
            <Stack.Screen
              name="DriverGuarantor"
              component={DriverGuarantorScreen}
              options={{ title: 'Add guarantor' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
            <Stack.Screen
              name="OfflineQueue"
              component={OfflineQueueScreen}
              options={{ title: 'Offline queue' }}
            />
            {!requiresSelfServiceContinuation && isDriverMobileMode ? (
              <>
                <Stack.Screen
                  name="Home"
                  component={AssignmentsScreen}
                  options={{ title: 'Home' }}
                />
                <Stack.Screen
                  name="AssignmentDetail"
                  component={AssignmentDetailScreen}
                  options={{ title: 'Assignment details' }}
                />
                <Stack.Screen
                  name="Remittance"
                  component={RemittanceScreen}
                  options={{ title: 'Remittance' }}
                />
                <Stack.Screen
                  name="RemittanceHistory"
                  component={RemittanceHistoryScreen}
                  options={{ title: 'Remittance history' }}
                />
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                  options={{ title: 'Alerts' }}
                />
              </>
            ) : null}
          </>
          ) : (
            <>
              <Stack.Screen
                name="LegalDocument"
                component={LegalDocumentScreen}
                options={{ title: 'Legal document' }}
              />
              <Stack.Screen
                name="OperatorDashboard"
                component={OperatorDashboardScreen}
                options={{ title: 'Dashboard' }}
              />
              <Stack.Screen
                name="OfflineQueue"
                component={OfflineQueueScreen}
                options={{ title: 'Offline queue' }}
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
                name="OperatorInspections"
                component={OperatorInspectionsScreen}
                options={{ title: 'Inspections' }}
              />
              <Stack.Screen
                name="OperatorMaintenance"
                component={OperatorMaintenanceScreen}
                options={{ title: 'Maintenance' }}
              />
              <Stack.Screen
                name="OperatorCompliance"
                component={OperatorComplianceScreen}
                options={{ title: 'Compliance queues' }}
              />
              <Stack.Screen
                name="OperatorAudit"
                component={OperatorAuditScreen}
                options={{ title: 'Audit trail' }}
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
                options={{ title: 'Verification funding' }}
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
              name="LegalDocument"
              component={LegalDocumentScreen}
              options={{ title: 'Legal document' }}
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
              name="DriverAccountSetup"
              component={DriverAccountSetupScreen}
              options={{ title: 'Set up account' }}
            />
            <Stack.Screen
              name="DriverGuarantor"
              component={DriverGuarantorScreen}
              options={{ title: 'Add guarantor' }}
            />
            <Stack.Screen
              name="GuarantorSelfService"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor onboarding' }}
            />
            <Stack.Screen
              name="GuarantorSelfServiceOtp"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor access' }}
            />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="LegalDocument"
              component={LegalDocumentScreen}
              options={{ title: 'Legal document' }}
            />
            {!selectedRole ? (
              <Stack.Screen
                name="RoleSelection"
                component={RoleSelectionScreen}
                options={{ headerShown: false }}
              />
            ) : null}
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
            <Stack.Screen
              name="DriverAccountSetup"
              component={DriverAccountSetupScreen}
              options={{ title: 'Set up account' }}
            />
            <Stack.Screen
              name="DriverGuarantor"
              component={DriverGuarantorScreen}
              options={{ title: 'Add guarantor' }}
            />
            <Stack.Screen
              name="GuarantorSelfService"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor onboarding' }}
            />
            <Stack.Screen
              name="GuarantorSelfServiceOtp"
              component={GuarantorSelfServiceScreen}
              options={{ title: 'Guarantor access' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
