'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, StyleSheet, Switch, Text } from 'react-native';
import {
  deactivateTeamMember,
  getNotificationPreferences,
  getTenantMe,
  inviteTeamMember,
  listTeamMembers,
  listUserNotifications,
  resendTeamInvite,
  syncRemittanceReminders,
  updateNotificationPreferences,
  updateProfile,
  updateTenantSettings,
} from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { tokens } from '../../../theme/tokens';
import { useState } from 'react';

export function SettingsScreen() {
  const { session, logout, refreshSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [phone, setPhone] = useState('');
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
  const teamQuery = useQuery({
    queryKey: ['operator-team'],
    queryFn: listTeamMembers,
  });
  const tenantQuery = useQuery({
    queryKey: ['operator-settings', 'tenant'],
    queryFn: getTenantMe,
  });
  const notificationsQuery = useQuery({
    queryKey: ['operator-settings', 'notifications'],
    queryFn: listUserNotifications,
  });
  const prefsQuery = useQuery({
    queryKey: ['operator-settings', 'prefs'],
    queryFn: getNotificationPreferences,
  });
  const inviteMutation = useMutation({
    mutationFn: () => inviteTeamMember({ name, email, role, phone: phone.trim() || undefined }),
    onSuccess: async () => {
      setName('');
      setEmail('');
      setPhone('');
      await teamQuery.refetch();
      Alert.alert('Team', 'Team member invited successfully.');
    },
    onError: (error) => {
      Alert.alert('Team', error instanceof Error ? error.message : 'Unable to invite this team member.');
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
  const organisationMutation = useMutation({
    mutationFn: () =>
      updateTenantSettings({
        displayName,
        logoUrl: logoUrl.trim() || undefined,
        defaultLanguage,
        guarantorMaxActiveDrivers: Number.parseInt(guarantorMax, 10),
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
        <Button
          label="Save organisation settings"
          loading={organisationMutation.isPending}
          onPress={() => organisationMutation.mutate()}
        />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Button
          label="Refresh remittance reminders"
          variant="secondary"
          loading={reminderMutation.isPending}
          onPress={() => reminderMutation.mutate()}
        />
        {(prefsQuery.data
          ? (Object.entries(prefsQuery.data) as Array<
              [keyof typeof prefsQuery.data, (typeof prefsQuery.data)[keyof typeof prefsQuery.data]]
            >)
          : []
        ).map(([topic, pref]) => (
          <Card key={topic} style={styles.innerCard}>
            <Text style={styles.memberName}>{topic.replace(/_/g, ' ')}</Text>
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
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Invite team member</Text>
        <Input label="Name" onChangeText={setName} value={name} />
        <Input label="Email" onChangeText={setEmail} value={email} />
        <Input label="Role" helperText="FLEET_MANAGER, FINANCE_OFFICER, FIELD_OFFICER, READ_ONLY" onChangeText={setRole} value={role} />
        <Input label="Phone" onChangeText={setPhone} value={phone} />
        <Button label="Invite team member" loading={inviteMutation.isPending} onPress={() => inviteMutation.mutate()} />
      </Card>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Team</Text>
        {(teamQuery.data ?? []).map((member) => (
          <Card key={member.id} style={styles.innerCard}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.meta}>{member.email}</Text>
            <Text style={styles.meta}>{member.role}</Text>
            <Text style={styles.meta}>{member.isActive ? 'Active' : 'Inactive'}</Text>
            {member.role !== 'TENANT_OWNER' && member.isActive ? (
              <>
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
});

export default SettingsScreen;
