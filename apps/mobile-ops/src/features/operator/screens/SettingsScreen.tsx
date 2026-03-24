'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, StyleSheet, Text } from 'react-native';
import { deactivateTeamMember, inviteTeamMember, listTeamMembers } from '../../../api';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Input } from '../../../components/input';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { tokens } from '../../../theme/tokens';
import { useState } from 'react';

export function SettingsScreen() {
  const { session, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [phone, setPhone] = useState('');
  const teamQuery = useQuery({
    queryKey: ['operator-team'],
    queryFn: listTeamMembers,
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

  return (
    <Screen>
      <Card style={styles.section}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.meta}>Tenant: {session?.tenantName ?? 'Unknown tenant'}</Text>
        <Text style={styles.meta}>User: {session?.name ?? 'Unknown user'}</Text>
        <Text style={styles.meta}>Role: {session?.role ?? 'Unknown role'}</Text>
        <Text style={styles.meta}>Email: {session?.email}</Text>
        <Button label="Sign out" variant="secondary" onPress={() => void logout()} />
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
              <Button
                label="Deactivate"
                variant="secondary"
                loading={deactivateMutation.isPending}
                onPress={() => deactivateMutation.mutate(member.id)}
              />
            ) : null}
          </Card>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: tokens.colors.ink, fontSize: 18, fontWeight: '700' },
  innerCard: { gap: tokens.spacing.xs },
  memberName: { color: tokens.colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default SettingsScreen;
