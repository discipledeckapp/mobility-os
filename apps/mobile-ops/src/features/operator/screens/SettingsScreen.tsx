'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Switch, Text } from 'react-native';
import {
  createDataSubjectRequest,
  deactivateTeamMember,
  disablePushDevice,
  disableTeamMemberPushDevice,
  changeTenantBillingPlan,
  getPrivacySupport,
  getNotificationPreferences,
  getTenantBillingSummary,
  getTenantMe,
  listDataSubjectRequests,
  listFleets,
  listVehicles,
  listTenantBillingPlans,
  inviteTeamMember,
  listPushDevices,
  listTeamMembers,
  listUserNotifications,
  resendTeamInvite,
  syncMaintenanceReminders,
  syncRemittanceReminders,
  updateTeamMemberAccess,
  updateTeamMemberMobileAccess,
  updateNotificationPreferences,
  updateProfile,
  updateTenantSettings,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import type { RootStackParamList } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    session,
    logout,
    refreshSession,
    biometricAvailable,
    biometricEnabled,
    setBiometricEnabled,
  } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [phone, setPhone] = useState('');
  const [selectedFleetIds, setSelectedFleetIds] = useState<string[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [profileName, setProfileName] = useState(session?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(session?.phone ?? '');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'fr'>(
    session?.preferredLanguage ?? session?.defaultLanguage ?? 'en',
  );
  const [displayName, setDisplayName] = useState(session?.organisationDisplayName ?? session?.tenantName ?? '');
  const [logoUrl, setLogoUrl] = useState(session?.organisationLogoUrl ?? '');
  const [defaultLanguage, setDefaultLanguage] = useState<'en' | 'fr'>(
    session?.defaultLanguage ?? 'en',
  );
  const [guarantorMax, setGuarantorMax] = useState(
    String(session?.guarantorMaxActiveDrivers ?? 2),
  );
  const [autoSendSelfServiceLink, setAutoSendSelfServiceLink] = useState(
    session?.autoSendDriverSelfServiceLinkOnCreate ?? true,
  );
  const [requireIdentityVerification, setRequireIdentityVerification] = useState(
    session?.requireIdentityVerificationForActivation ?? true,
  );
  const [requireBiometricVerification, setRequireBiometricVerification] = useState(
    session?.requireBiometricVerification ?? true,
  );
  const [requireGovernmentLookup, setRequireGovernmentLookup] = useState(
    session?.requireGovernmentVerificationLookup ?? true,
  );
  const [requiredDriverDocuments, setRequiredDriverDocuments] = useState(
    (session?.requiredDriverDocumentSlugs ?? []).join(', '),
  );
  const [requiredVehicleDocuments, setRequiredVehicleDocuments] = useState(
    (session?.requiredVehicleDocumentSlugs ?? ['vehicle-license', 'insurance']).join(', '),
  );
  const [privacyRequestType, setPrivacyRequestType] = useState<'access' | 'correction' | 'deletion' | 'restriction'>('access');
  const [privacyRequestDetails, setPrivacyRequestDetails] = useState('');
  const teamQuery = useQuery({
    queryKey: ['operator-team'],
    queryFn: listTeamMembers,
  });
  const tenantQuery = useQuery({
    queryKey: ['operator-settings', 'tenant'],
    queryFn: getTenantMe,
  });
  const fleetsQuery = useQuery({
    queryKey: ['operator-settings', 'fleets'],
    queryFn: () => listFleets(),
  });
  const vehiclesQuery = useQuery({
    queryKey: ['operator-settings', 'vehicles'],
    queryFn: () => listVehicles({ limit: 200 }),
  });
  const plansQuery = useQuery({
    queryKey: ['operator-settings', 'plans'],
    queryFn: listTenantBillingPlans,
  });
  const billingQuery = useQuery({
    queryKey: ['operator-settings', 'billing-summary'],
    queryFn: getTenantBillingSummary,
  });
  const notificationsQuery = useQuery({
    queryKey: ['operator-settings', 'notifications'],
    queryFn: listUserNotifications,
  });
  const prefsQuery = useQuery({
    queryKey: ['operator-settings', 'prefs'],
    queryFn: getNotificationPreferences,
  });
  const pushDevicesQuery = useQuery({
    queryKey: ['operator-settings', 'push-devices'],
    queryFn: listPushDevices,
  });
  const privacySupportQuery = useQuery({
    queryKey: ['operator-settings', 'privacy-support'],
    queryFn: getPrivacySupport,
  });
  const privacyRequestsQuery = useQuery({
    queryKey: ['operator-settings', 'privacy-requests'],
    queryFn: listDataSubjectRequests,
  });
  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteTeamMember({
        name,
        email,
        role,
        phone: phone.trim() || undefined,
        assignedFleetIds: selectedFleetIds,
        assignedVehicleIds: selectedVehicleIds,
        customPermissions: selectedPermissions,
      }),
    onSuccess: async () => {
      setName('');
      setEmail('');
      setPhone('');
      setSelectedFleetIds([]);
      setSelectedVehicleIds([]);
      setSelectedPermissions([]);
      await teamQuery.refetch();
      Alert.alert('Team', 'Team member invited successfully.');
    },
    onError: (error) => {
      Alert.alert('Team', error instanceof Error ? error.message : 'Unable to invite this team member.');
    },
  });
  const accessMutation = useMutation({
    mutationFn: (input: { userId: string; assignedFleetIds: string[]; assignedVehicleIds: string[]; customPermissions: string[] }) =>
      updateTeamMemberAccess(input.userId, {
        assignedFleetIds: input.assignedFleetIds,
        assignedVehicleIds: input.assignedVehicleIds,
        customPermissions: input.customPermissions,
      }),
    onSuccess: async () => {
      await teamQuery.refetch();
      Alert.alert('Team', 'Access updated.');
    },
    onError: (error) => {
      Alert.alert('Team', error instanceof Error ? error.message : 'Unable to update access.');
    },
  });
  const planMutation = useMutation({
    mutationFn: (planId: string) => changeTenantBillingPlan(planId),
    onSuccess: async () => {
      await Promise.all([plansQuery.refetch(), tenantQuery.refetch()]);
      Alert.alert('Subscription', 'Company plan updated.');
    },
    onError: (error) => {
      Alert.alert('Subscription', error instanceof Error ? error.message : 'Unable to change plan.');
    },
  });
  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateTeamMember(userId),
    onSuccess: async () => {
      await teamQuery.refetch();
      Alert.alert('Team', 'Team member deactivated.');
    },
    onError: (error) => {
      Alert.alert('Team', error instanceof Error ? error.message : 'Unable to deactivate this team member.');
    },
  });
  const memberMobileAccessMutation = useMutation({
    mutationFn: (input: { userId: string; revoked: boolean }) =>
      updateTeamMemberMobileAccess(input.userId, input.revoked),
    onSuccess: async (_, input) => {
      await teamQuery.refetch();
      Alert.alert(
        'Team',
        input.revoked ? 'Mobile access paused.' : 'Mobile access restored.',
      );
    },
    onError: (error) => {
      Alert.alert(
        'Team',
        error instanceof Error ? error.message : 'Unable to update mobile access.',
      );
    },
  });
  const memberDeviceMutation = useMutation({
    mutationFn: (input: { userId: string; deviceId: string }) =>
      disableTeamMemberPushDevice(input.userId, input.deviceId),
    onSuccess: async () => {
      await teamQuery.refetch();
      Alert.alert('Team', 'Device notifications turned off.');
    },
    onError: (error) => {
      Alert.alert(
        'Team',
        error instanceof Error ? error.message : 'Unable to turn off this device.',
      );
    },
  });
  const resendMutation = useMutation({
    mutationFn: (userId: string) => resendTeamInvite(userId),
    onSuccess: (result) => {
      Alert.alert('Team', result.message);
    },
    onError: (error) => {
      Alert.alert('Team', error instanceof Error ? error.message : 'Unable to resend this invite.');
    },
  });
  const profileMutation = useMutation({
    mutationFn: () =>
      updateProfile({
        name: profileName,
        phone: profilePhone.trim() || undefined,
        preferredLanguage,
      }),
    onSuccess: async () => {
      await refreshSession();
      Alert.alert('Settings', 'Profile updated.');
    },
    onError: (error) => {
      Alert.alert('Settings', error instanceof Error ? error.message : 'Unable to update your profile.');
    },
  });
  const privacyRequestMutation = useMutation({
    mutationFn: () =>
      createDataSubjectRequest({
        requestType: privacyRequestType,
        details: privacyRequestDetails.trim() || undefined,
      }),
    onSuccess: async () => {
      setPrivacyRequestDetails('');
      await privacyRequestsQuery.refetch();
      Alert.alert('Privacy', 'Your privacy request has been submitted for review.');
    },
    onError: (error) => {
      Alert.alert('Privacy', error instanceof Error ? error.message : 'Unable to submit this request.');
    },
  });
  const organisationMutation = useMutation({
    mutationFn: () =>
      updateTenantSettings({
        displayName,
        logoUrl: logoUrl.trim() || undefined,
        defaultLanguage,
        guarantorMaxActiveDrivers: Number.parseInt(guarantorMax, 10),
        autoSendDriverSelfServiceLinkOnCreate: autoSendSelfServiceLink,
        requireIdentityVerificationForActivation: requireIdentityVerification,
        requireBiometricVerification,
        requireGovernmentVerificationLookup: requireGovernmentLookup,
        requiredDriverDocumentSlugs: requiredDriverDocuments
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
        requiredVehicleDocumentSlugs: requiredVehicleDocuments
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      }),
    onSuccess: async () => {
      await Promise.all([refreshSession(), tenantQuery.refetch()]);
      Alert.alert('Settings', 'Organisation settings updated.');
    },
    onError: (error) => {
      Alert.alert('Settings', error instanceof Error ? error.message : 'Unable to update organisation settings.');
    },
  });
  const reminderMutation = useMutation({
    mutationFn: syncRemittanceReminders,
    onSuccess: async (result) => {
      await notificationsQuery.refetch();
      Alert.alert('Remittance reminders', `${result.created} reminders refreshed.`);
    },
    onError: (error) => {
      Alert.alert('Remittance reminders', error instanceof Error ? error.message : 'Unable to refresh reminders.');
    },
  });
  const maintenanceReminderMutation = useMutation({
    mutationFn: syncMaintenanceReminders,
    onSuccess: async (result) => {
      await notificationsQuery.refetch();
      Alert.alert('Maintenance reminders', `${result.created} reminders refreshed.`);
    },
    onError: (error) => {
      Alert.alert('Maintenance reminders', error instanceof Error ? error.message : 'Unable to refresh reminders.');
    },
  });
  const disableDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => disablePushDevice(deviceId),
    onSuccess: async (result) => {
      await pushDevicesQuery.refetch();
      Alert.alert('Notifications', result.message);
    },
    onError: (error) => {
      Alert.alert(
        'Notifications',
        error instanceof Error ? error.message : 'Unable to turn off this device.',
      );
    },
  });

  const updatePreference = async (
    topic: keyof NonNullable<typeof prefsQuery.data>,
    channel: 'email' | 'inApp' | 'push',
    value: boolean,
  ) => {
    const current = prefsQuery.data;
    if (!current) {
      return;
    }
    try {
      await updateNotificationPreferences({
        [topic]: {
          ...current[topic],
          [channel]: value,
        },
      });
      await prefsQuery.refetch();
    } catch (error) {
      Alert.alert('Notifications', error instanceof Error ? error.message : 'Unable to update this preference.');
    }
  };

  const toggleSelection = (current: string[], value: string) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.meta}>Organisation: {session?.organisationDisplayName ?? session?.tenantName ?? 'Unknown organisation'}</Text>
        <Text style={styles.meta}>User: {session?.name ?? 'Unknown user'}</Text>
        <Text style={styles.meta}>Role: {session?.role ?? 'Unknown role'}</Text>
        <Text style={styles.meta}>Email: {session?.email}</Text>
        <Button label="Sign out" variant="secondary" onPress={() => void logout()} />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Device access</Text>
        <Text style={styles.meta}>
          Keep the last successful session available offline and optionally protect device access
          with biometrics.
        </Text>
        <PreferenceRow
          label={
            biometricAvailable
              ? 'Enable biometric sign-in'
              : 'Biometric sign-in unavailable on this device'
          }
          value={biometricEnabled}
          onValueChange={(value) => {
            void setBiometricEnabled(value)
              .then(() => {
                Alert.alert(
                  'Device access',
                  value
                    ? 'Biometric sign-in has been enabled for cached offline access.'
                    : 'Biometric sign-in has been turned off.',
                );
              })
              .catch((error) => {
                Alert.alert(
                  'Device access',
                  error instanceof Error
                    ? error.message
                    : 'Unable to update biometric sign-in.',
                );
              });
          }}
        />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Input label="Name" onChangeText={setProfileName} value={profileName} />
        <Input label="Phone" onChangeText={setProfilePhone} value={profilePhone} />
        <Input
          label="Preferred language"
          helperText="Use en or fr"
          onChangeText={(value) => setPreferredLanguage(value.trim().toLowerCase() === 'fr' ? 'fr' : 'en')}
          value={preferredLanguage}
        />
        <Button label="Save profile" loading={profileMutation.isPending} onPress={() => profileMutation.mutate()} />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Organisation</Text>
        <Input label="Display name" onChangeText={setDisplayName} value={displayName} />
        <Input label="Logo URL" onChangeText={setLogoUrl} value={logoUrl} />
        <Input
          label="Default language"
          helperText="Use en or fr"
          onChangeText={(value) => setDefaultLanguage(value.trim().toLowerCase() === 'fr' ? 'fr' : 'en')}
          value={defaultLanguage}
        />
        <Input
          label="Max active drivers per guarantor"
          keyboardType="number-pad"
          onChangeText={setGuarantorMax}
          value={guarantorMax}
        />
        <PreferenceRow
          label="Send self-verification link when a driver is added"
          value={autoSendSelfServiceLink}
          onValueChange={setAutoSendSelfServiceLink}
        />
        <PreferenceRow
          label="Require identity verification before activation"
          value={requireIdentityVerification}
          onValueChange={setRequireIdentityVerification}
        />
        <PreferenceRow
          label="Require biometric verification"
          value={requireBiometricVerification}
          onValueChange={setRequireBiometricVerification}
        />
        <PreferenceRow
          label="Require government/provider lookup"
          value={requireGovernmentLookup}
          onValueChange={setRequireGovernmentLookup}
        />
        <Input
          label="Required driver document slugs"
          helperText="Comma-separated. Example: national-id, drivers-license"
          onChangeText={setRequiredDriverDocuments}
          value={requiredDriverDocuments}
        />
        <Input
          label="Required vehicle document slugs"
          helperText="Comma-separated. Example: vehicle-license, insurance"
          onChangeText={setRequiredVehicleDocuments}
          value={requiredVehicleDocuments}
        />
        <Button
          label="Save organisation settings"
          loading={organisationMutation.isPending}
          onPress={() => organisationMutation.mutate()}
        />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Button
          label="Privacy Policy"
          variant="secondary"
          onPress={() => navigation.navigate('LegalDocument', { document: 'privacy' })}
        />
        <Button
          label="Terms of Use"
          variant="secondary"
          onPress={() => navigation.navigate('LegalDocument', { document: 'terms' })}
        />
        <Button
          label="Refresh remittance reminders"
          variant="secondary"
          loading={reminderMutation.isPending}
          onPress={() => reminderMutation.mutate()}
        />
        <Button
          label="Refresh maintenance reminders"
          variant="secondary"
          loading={maintenanceReminderMutation.isPending}
          onPress={() => maintenanceReminderMutation.mutate()}
        />
        {(prefsQuery.data
          ? (Object.entries(prefsQuery.data) as Array<
              [keyof typeof prefsQuery.data, (typeof prefsQuery.data)[keyof typeof prefsQuery.data]]
            >)
          : []
        ).map(([topic, pref]) => (
          <Card key={topic} style={styles.innerCard}>
            <Text style={styles.memberName}>{notificationTopicLabel(topic)}</Text>
            <PreferenceRow
              label="Email"
              value={pref.email}
              onValueChange={(value) => void updatePreference(topic, 'email', value)}
            />
            <PreferenceRow
              label="In-app"
              value={pref.inApp}
              onValueChange={(value) => void updatePreference(topic, 'inApp', value)}
            />
            <PreferenceRow
              label="Push"
              value={pref.push}
              onValueChange={(value) => void updatePreference(topic, 'push', value)}
            />
          </Card>
        ))}
        {(notificationsQuery.data ?? []).slice(0, 5).map((notification) => (
          <Card key={notification.id} style={styles.innerCard}>
            <Text style={styles.memberName}>{notification.title}</Text>
            <Text style={styles.meta}>{notification.body}</Text>
            <Text style={styles.meta}>{notification.readAt ? 'Read' : 'New'}</Text>
          </Card>
        ))}
        <Card style={styles.innerCard}>
          <Text style={styles.memberName}>Registered devices</Text>
          <Text style={styles.meta}>
            Review which phones and browsers can receive alerts for this account.
          </Text>
          {(pushDevicesQuery.data ?? []).length === 0 ? (
            <Text style={styles.meta}>No registered devices yet.</Text>
          ) : null}
          {(pushDevicesQuery.data ?? []).map((device) => (
            <Card key={device.id} style={styles.innerCard}>
              <Text style={styles.memberName}>
                {device.platform === 'ios'
                  ? 'iPhone or iPad'
                  : device.platform === 'android'
                    ? 'Android device'
                    : 'Web browser'}
              </Text>
              <Text style={styles.meta}>Token: {device.tokenPreview}</Text>
              <Text style={styles.meta}>
                Last seen: {new Date(device.lastSeenAt).toLocaleString()}
              </Text>
              <Text style={styles.meta}>
                {device.disabledAt
                  ? `Notifications turned off on ${new Date(device.disabledAt).toLocaleString()}`
                  : 'Notifications active'}
              </Text>
              {!device.disabledAt ? (
                <Button
                  label="Turn off notifications on this device"
                  variant="secondary"
                  loading={disableDeviceMutation.isPending}
                  onPress={() => disableDeviceMutation.mutate(device.id)}
                />
              ) : null}
            </Card>
          ))}
        </Card>
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy and data rights</Text>
        <Text style={styles.meta}>
          Submit access, correction, deletion, or processing-restriction requests without leaving the app.
        </Text>
        <Input
          label="Request type"
          helperText="Use access, correction, deletion, or restriction"
          onChangeText={(value) => {
            const normalized = value.trim().toLowerCase();
            setPrivacyRequestType(
              normalized === 'correction' ||
                normalized === 'deletion' ||
                normalized === 'restriction'
                ? normalized
                : 'access',
            );
          }}
          value={privacyRequestType}
        />
        <Input
          label="Details"
          helperText="Explain what you want us to review or correct."
          multiline
          onChangeText={setPrivacyRequestDetails}
          style={styles.multilineInput}
          textAlignVertical="top"
          value={privacyRequestDetails}
        />
        <Text style={styles.meta}>
          Support: {privacySupportQuery.data?.supportEmail ?? 'support@mobiris.ng'}
        </Text>
        <Text style={styles.meta}>
          Policy version: {privacySupportQuery.data?.privacyPolicyVersion ?? '2026-03-27'}
        </Text>
        <Button
          label="Submit privacy request"
          loading={privacyRequestMutation.isPending}
          onPress={() => privacyRequestMutation.mutate()}
        />
        {(privacyRequestsQuery.data ?? []).map((request) => (
          <Card key={request.id} style={styles.innerCard}>
            <Text style={styles.memberName}>{request.requestType.toUpperCase()}</Text>
            <Text style={styles.meta}>Status: {request.status}</Text>
            <Text style={styles.meta}>Submitted: {new Date(request.createdAt).toLocaleString()}</Text>
            {request.details ? <Text style={styles.meta}>{request.details}</Text> : null}
            {request.resolutionNotes ? <Text style={styles.meta}>Resolution: {request.resolutionNotes}</Text> : null}
          </Card>
        ))}
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Invite team member</Text>
        <Input label="Name" onChangeText={setName} value={name} />
        <Input label="Email" onChangeText={setEmail} value={email} />
        <Input label="Role" helperText="FLEET_MANAGER, FINANCE_OFFICER, FIELD_OFFICER, READ_ONLY" onChangeText={setRole} value={role} />
        <Input label="Phone" onChangeText={setPhone} value={phone} />
        <Text style={styles.meta}>Visible fleets</Text>
        {(fleetsQuery.data ?? []).map((fleet) => (
          <Button
            key={fleet.id}
            label={`${selectedFleetIds.includes(fleet.id) ? 'Remove' : 'Allow'} ${fleet.name}`}
            variant="secondary"
            onPress={() => setSelectedFleetIds((current) => toggleSelection(current, fleet.id))}
          />
        ))}
        <Text style={styles.meta}>Selected vehicles</Text>
        {(vehiclesQuery.data?.data ?? []).map((vehicle) => (
          <Button
            key={vehicle.id}
            label={`${selectedVehicleIds.includes(vehicle.id) ? 'Remove' : 'Allow'} ${vehicle.tenantVehicleCode || vehicle.systemVehicleCode}`}
            variant="secondary"
            onPress={() => setSelectedVehicleIds((current) => toggleSelection(current, vehicle.id))}
          />
        ))}
        <Text style={styles.meta}>Extra access</Text>
        {[
          ['drivers:write', 'Manage drivers'],
          ['vehicles:write', 'Manage vehicles'],
          ['assignments:write', 'Manage assignments'],
          ['remittance:approve', 'Approve remittance'],
          ['operational_wallets:write', 'Manage company wallet'],
        ].map(([value, label]) => (
          <Button
            key={value}
            label={`${selectedPermissions.includes(value) ? 'Remove' : 'Grant'} ${label}`}
            variant="secondary"
            onPress={() => setSelectedPermissions((current) => toggleSelection(current, value))}
          />
        ))}
        <Button label="Invite team member" loading={inviteMutation.isPending} onPress={() => inviteMutation.mutate()} />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Company plan</Text>
        {(plansQuery.data ?? []).map((plan) => (
          <Card key={plan.id} style={styles.innerCard}>
            <Text style={styles.memberName}>{plan.name}</Text>
            <Text style={styles.meta}>
              {plan.currency} {plan.basePriceMinorUnits / 100} / {plan.billingInterval}
            </Text>
            <Button
              label={plan.id === billingQuery.data?.subscription.planId ? 'Current plan' : 'Switch plan'}
              variant="secondary"
              disabled={planMutation.isPending || plan.id === billingQuery.data?.subscription.planId}
              onPress={() => planMutation.mutate(plan.id)}
            />
          </Card>
        ))}
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Team</Text>
        {(teamQuery.data ?? []).map((member) => (
          <Card key={member.id} style={styles.innerCard}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.meta}>{member.email}</Text>
            <Text style={styles.meta}>{member.role}</Text>
            <Text style={styles.meta}>
              {member.assignedVehicleIds.length > 0
                ? `${member.assignedVehicleIds.length} vehicles`
                : member.assignedFleetIds.length === 0
                  ? 'All company fleets'
                  : `${member.assignedFleetIds.length} fleets`}
            </Text>
            <Text style={styles.meta}>{member.isActive ? 'Active' : 'Inactive'}</Text>
            <Text style={styles.meta}>
              Mobile access: {member.mobileAccessRevoked ? 'Paused' : 'Enabled'}
            </Text>
            <Text style={styles.meta}>
              Active devices: {member.activePushDeviceCount}
            </Text>
            {member.lastPushDeviceSeenAt ? (
              <Text style={styles.meta}>
                Last device seen: {new Date(member.lastPushDeviceSeenAt).toLocaleString()}
              </Text>
            ) : null}
            {member.pushDevices.map((device) => (
              <Card key={device.id} style={styles.innerCard}>
                <Text style={styles.memberName}>
                  {device.platform === 'ios'
                    ? 'iPhone or iPad'
                    : device.platform === 'android'
                      ? 'Android device'
                      : 'Web browser'}
                </Text>
                <Text style={styles.meta}>Token: {device.tokenPreview}</Text>
                <Text style={styles.meta}>
                  Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                </Text>
                <Text style={styles.meta}>
                  {device.disabledAt
                    ? `Notifications turned off on ${new Date(device.disabledAt).toLocaleString()}`
                    : 'Notifications active'}
                </Text>
                {!device.disabledAt ? (
                  <Button
                    label="Turn off this device"
                    variant="secondary"
                    loading={memberDeviceMutation.isPending}
                    onPress={() =>
                      memberDeviceMutation.mutate({
                        userId: member.id,
                        deviceId: device.id,
                      })
                    }
                  />
                ) : null}
              </Card>
            ))}
            {member.role !== 'TENANT_OWNER' && member.isActive ? (
              <>
                <Button
                  label={member.mobileAccessRevoked ? 'Restore mobile access' : 'Pause mobile access'}
                  variant="secondary"
                  loading={memberMobileAccessMutation.isPending}
                  onPress={() =>
                    memberMobileAccessMutation.mutate({
                      userId: member.id,
                      revoked: !member.mobileAccessRevoked,
                    })
                  }
                />
                <Button
                  label="Grant all fleet access"
                  variant="secondary"
                  loading={accessMutation.isPending}
                  onPress={() =>
                    accessMutation.mutate({
                      userId: member.id,
                      assignedFleetIds: [],
                      assignedVehicleIds: [],
                      customPermissions: member.customPermissions,
                    })
                  }
                />
                <Button
                  label="Resend invite"
                  variant="secondary"
                  loading={resendMutation.isPending}
                  onPress={() => resendMutation.mutate(member.id)}
                />
                <Button
                  label="Deactivate"
                  variant="secondary"
                  loading={deactivateMutation.isPending}
                  onPress={() => deactivateMutation.mutate(member.id)}
                />
              </>
            ) : null}
          </Card>
        ))}
      </Card>
    </Screen>
  );
}

function PreferenceRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Card style={styles.preferenceRow}>
      <Text style={styles.meta}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </Card>
  );
}

function notificationTopicLabel(topic: string) {
  const labels: Record<string, string> = {
    verification_payment_receipt: 'Verification payment receipts',
    driver_verification_status: 'Driver verification updates',
    driver_licence_review_pending: 'Licence review pending alerts',
    driver_licence_review_resolved: 'Licence review decisions',
    guarantor_status: 'Guarantor status updates',
    assignment_issued: 'Assignment issued alerts',
    assignment_accepted: 'Assignment accepted alerts',
    assignment_changed: 'Assignment changed alerts',
    assignment_ended: 'Assignment ended alerts',
    remittance_due: 'Remittance due reminders',
    remittance_overdue: 'Overdue remittance follow-up',
    remittance_reconciled: 'Reconciled remittance updates',
    late_remittance_risk: 'Late remittance risk signals',
    compliance_risk: 'Compliance and risk alerts',
    maintenance_due: 'Maintenance due reminders',
    maintenance_overdue: 'Overdue maintenance alerts',
    vehicle_incident_reported: 'Vehicle incident alerts',
    self_service_invite: 'Driver verification invites',
    billing_updates: 'Billing and renewal updates',
    trial_guidance: 'Trial onboarding and ending reminders',
    product_updates: 'Product improvements and feature announcements',
    marketing_updates: 'Campaigns, offers, and optional marketing updates',
  };
  return labels[topic] ?? topic.replace(/_/g, ' ');
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  innerCard: { gap: tokens.spacing.xs },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.xs,
  },
  memberName: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
  multilineInput: {
    minHeight: 112,
    paddingTop: 12,
  },
});

export default SettingsScreen;
