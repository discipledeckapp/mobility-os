'use client';

import { Alert, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Screen } from '../../../components/screen';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { buildSelfServiceVerificationDeepLink } from '../../../navigation/linking';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { initiateDriverKycCheckout } from '../../../api';

export function SelfServiceReadinessScreen({ navigation }: ScreenProps<'SelfServiceReadiness'>) {
  const { showToast } = useToast();
  const { token, driver, documents, isLoading, isRefreshing, refreshSelfService, clearSelfService } =
    useSelfService();

  const onPayKyc = async () => {
    if (!token) return;
    try {
      const checkout = await initiateDriverKycCheckout(
        token,
        'paystack',
        buildSelfServiceVerificationDeepLink(),
      );
      if (checkout.status === 'already_paid' || !checkout.checkoutUrl) {
        await refreshSelfService();
        showToast('Your verification payment has already been received.', 'success');
        navigation.navigate('SelfServiceVerification');
        return;
      }
      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert(
        'Payment error',
        error instanceof Error ? error.message : 'Unable to start KYC payment. Try again.',
      );
    }
  };

  const onRefresh = async () => {
    try {
      await refreshSelfService();
      showToast('Readiness status refreshed.', 'success');
    } catch (error) {
      Alert.alert(
        'Driver readiness',
        error instanceof Error ? error.message : 'Unable to refresh readiness status.',
      );
    }
  };

  const onReset = async () => {
    await clearSelfService();
    navigation.replace('SelfServiceOtp');
  };

  if (isLoading || !token || !driver) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <EmptyState
          actionLabel="Enter verification code"
          message="There is no active self-service session on this device."
          title="Readiness session missing"
          onAction={() => navigation.replace('SelfServiceOtp')}
        />
      </Screen>
    );
  }

  const signInReady =
    driver.authenticationAccess === 'ready' &&
    driver.hasMobileAccess === true &&
    driver.mobileAccessStatus === 'linked';
  const allReasons = [
    ...(driver.authenticationAccessReasons ?? []),
    ...(driver.activationReadinessReasons ?? []),
    ...(driver.assignmentReadinessReasons ?? []),
    ...(driver.remittanceReadinessReasons ?? []),
  ].filter((reason, index, items) => items.indexOf(reason) === index);

  const requiresIdentity =
    driver.identityStatus !== 'verified' && driver.identityStatus !== 'review_needed';
  const requiresManualReview = driver.identityStatus === 'review_needed';
  const hasDocumentBlockers =
    !driver.hasApprovedLicence ||
    driver.pendingDocumentCount > 0 ||
    driver.rejectedDocumentCount > 0 ||
    driver.expiredDocumentCount > 0;
  const canResumeVerification = requiresIdentity || hasDocumentBlockers;
  const hasUsableVerificationEntitlement =
    driver.verificationEntitlementState === 'paid' ||
    driver.verificationEntitlementState === 'reserved';
  const needsVerificationPayment =
    driver.driverPaysKyc && driver.verificationPaymentStatus === 'driver_payment_required';
  const mobileAccessLabel = formatMobileAccessLabel(driver.mobileAccessStatus);
  const mobileAccessTone = mobileAccessStatusTone(driver.mobileAccessStatus);

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.kicker}>Driver readiness</Text>
        <Text style={styles.title}>Access and operations checklist</Text>
        <Text style={styles.copy}>
          Track your sign-in access separately from activation, assignment eligibility, and remittance readiness.
        </Text>
        <View style={styles.badgeRow}>
          <Badge
            label={`Sign in: ${formatReadinessLabel(driver.authenticationAccess ?? 'not_ready')}`}
            tone={readinessTone(driver.authenticationAccess ?? 'not_ready')}
          />
          <Badge
            label={formatIdentityStatus(driver.identityStatus)}
            tone={identityTone(driver.identityStatus)}
          />
          <Badge
            label={`Activation: ${formatReadinessLabel(driver.activationReadiness ?? 'not_ready')}`}
            tone={readinessTone(driver.activationReadiness ?? 'not_ready')}
          />
          <Badge
            label={`Assignments: ${formatReadinessLabel(driver.assignmentReadiness ?? 'not_ready')}`}
            tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Status summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Sign-in access</Text>
          <Badge
            label={formatReadinessLabel(driver.authenticationAccess ?? 'not_ready')}
            tone={readinessTone(driver.authenticationAccess ?? 'not_ready')}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile account status</Text>
          <Badge label={mobileAccessLabel} tone={mobileAccessTone} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Identity verification</Text>
          <Badge
            label={formatIdentityStatus(driver.identityStatus)}
            tone={identityTone(driver.identityStatus)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Approved licence</Text>
          <Badge
            label={driver.hasApprovedLicence ? 'Available' : 'Missing'}
            tone={driver.hasApprovedLicence ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Activation readiness</Text>
          <Badge
            label={formatReadinessLabel(driver.activationReadiness ?? 'not_ready')}
            tone={readinessTone(driver.activationReadiness ?? 'not_ready')}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Assignment readiness</Text>
          <Badge
            label={formatReadinessLabel(driver.assignmentReadiness ?? 'not_ready')}
            tone={readinessTone(driver.assignmentReadiness ?? 'not_ready')}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Remittance readiness</Text>
          <Badge
            label={formatReadinessLabel(driver.remittanceReadiness ?? 'not_ready')}
            tone={readinessTone(driver.remittanceReadiness ?? 'not_ready')}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Uploaded documents</Text>
          <Text style={styles.meta}>{documents.length}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pending documents</Text>
          <Text style={styles.meta}>{driver.pendingDocumentCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rejected documents</Text>
          <Text style={styles.meta}>{driver.rejectedDocumentCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expired documents</Text>
          <Text style={styles.meta}>{driver.expiredDocumentCount}</Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Current blockers</Text>
        {allReasons.length ? (
          allReasons.map((reason) => (
            <View key={reason} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={styles.reason}>{reason}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.meta}>No blockers are currently reported.</Text>
        )}
      </Card>

      {needsVerificationPayment ? (
        <Card style={[styles.section, styles.kycPaymentCard]}>
          <Text style={styles.sectionTitle}>Identity verification payment</Text>
          <Text style={styles.copy}>
            {driver.verificationPaymentMessage ??
              'Your organisation requires you to pay the verification fee before your identity check can proceed.'}
          </Text>
          <Button
            label="Pay verification fee"
            onPress={() => void onPayKyc()}
          />
          <Text style={styles.kycNote}>
            You will be redirected to a secure payment page. Return here after payment completes.
          </Text>
        </Card>
      ) : driver.driverPaysKyc && hasUsableVerificationEntitlement ? (
        <Card style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Verification payment</Text>
            <Badge
              label={
                driver.verificationEntitlementState === 'reserved'
                  ? 'Payment received'
                  : 'Paid'
              }
              tone="success"
            />
          </View>
          <Text style={styles.copy}>
            {driver.verificationPaymentMessage ??
              'Your verification payment has already been received. You can continue from where you stopped.'}
          </Text>
        </Card>
      ) : null}

      {driver.requiresGuarantor && !driver.hasGuarantor ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Guarantor</Text>
          <Text style={styles.copy}>
            {driver.guarantorBlocking
              ? 'Your organisation requires a guarantor before you can be assigned. Add contact details for someone who can vouch for you.'
              : 'Your organisation encourages adding a guarantor. You can proceed, but adding one reduces your risk rating.'}
          </Text>
          <Button
            label="Add your guarantor"
            variant={driver.guarantorBlocking ? 'primary' : 'ghost'}
            onPress={() => navigation.navigate('DriverGuarantor')}
          />
        </Card>
      ) : driver.requiresGuarantor && driver.hasGuarantor ? (
        <Card style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Guarantor</Text>
            <Badge label="Submitted" tone="success" />
          </View>
        </Card>
      ) : null}

      {driver.mobileAccessStatus === 'missing' ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Sign-in account</Text>
          <Text style={styles.copy}>
            Create your email and password so you can sign in to the app. Account access does not
            wait for assignment approval.
          </Text>
          <Button
            label="Set up sign-in account"
            onPress={() => navigation.navigate('DriverAccountSetup')}
          />
        </Card>
      ) : !signInReady ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Sign-in account</Text>
          <Text style={styles.copy}>
            Your account exists, but access is currently {mobileAccessLabel.toLowerCase()}. Contact
            your operator if this status looks wrong.
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Access state</Text>
            <Badge label={mobileAccessLabel} tone={mobileAccessTone} />
          </View>
        </Card>
      ) : (
        <Card style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Sign-in account</Text>
            <Badge label="Ready" tone="success" />
          </View>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended next action</Text>
        <Text style={styles.copy}>
          {recommendedAction({
            authenticationAccess: driver.authenticationAccess ?? 'not_ready',
            mobileAccessStatus: driver.mobileAccessStatus ?? null,
            identityStatus: driver.identityStatus,
            hasDocumentBlockers,
            signInReady,
          })}
        </Text>
        {canResumeVerification ? (
          <Button
            label="Open verification tasks"
            onPress={() => navigation.navigate('SelfServiceVerification')}
          />
        ) : null}
        {requiresManualReview ? (
          <Button
            label="Refresh review status"
            variant="secondary"
            onPress={() => void onRefresh()}
          />
        ) : null}
        {signInReady ? (
          <Button
            label="Return to sign in"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
          />
        ) : null}
        <Button label="Use another verification code" variant="secondary" onPress={() => void onReset()} />
      </Card>
    </Screen>
  );
}

function formatIdentityStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function identityTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'review_needed' || status === 'pending_verification') {
    return 'warning';
  }
  return 'neutral';
}

function formatReadinessLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function readinessTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'blocked' || status === 'not_ready') {
    return 'danger';
  }
  return 'warning';
}

function formatMobileAccessLabel(status?: string | null) {
  if (status === 'linked') return 'Active';
  if (status === 'inactive') return 'Inactive';
  if (status === 'revoked') return 'Revoked';
  return 'Not created';
}

function mobileAccessStatusTone(status?: string | null): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'linked') return 'success';
  if (status === 'revoked') return 'danger';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

function recommendedAction(input: {
  authenticationAccess: string;
  mobileAccessStatus?: string | null;
  identityStatus: string;
  hasDocumentBlockers: boolean;
  signInReady: boolean;
}) {
  if (!input.mobileAccessStatus || input.mobileAccessStatus === 'missing') {
    return 'Set up your sign-in account first so you can access the app while the rest of your onboarding continues.';
  }
  if (input.authenticationAccess !== 'ready') {
    return 'Your account exists, but access is not active yet. Refresh this screen or contact your operator if the restriction should already be cleared.';
  }
  if (input.signInReady && input.identityStatus !== 'verified') {
    return 'You can sign in already, but you still need to finish identity verification before operational approval can move forward.';
  }
  if (input.signInReady && input.hasDocumentBlockers) {
    return 'You can sign in already. Next, upload or replace the required documents so activation and assignment approval can continue.';
  }
  if (input.signInReady) {
    return 'Your app access is ready. Sign in now, then monitor this checklist for any remaining operational restrictions.';
  }
  if (input.identityStatus === 'review_needed') {
    return 'Your verification is under manual review. Refresh this screen for updates or contact your fleet manager if the delay continues.';
  }
  if (input.identityStatus !== 'verified') {
    return 'Complete the identity section and live selfie capture before operations can continue.';
  }
  if (input.hasDocumentBlockers) {
    return 'Upload or replace the required driver documents so the organisation can approve your readiness.';
  }
  return 'Refresh the checklist after your organisation updates your readiness state.';
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  section: {
    gap: tokens.spacing.sm,
  },
  kicker: {
    color: tokens.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  copy: {
    color: tokens.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  sectionTitle: {
    color: tokens.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  label: {
    color: tokens.colors.ink,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  meta: {
    color: tokens.colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.xs,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
    marginTop: 7,
  },
  reason: {
    color: tokens.colors.ink,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  kycPaymentCard: {
    borderWidth: 1,
    borderColor: tokens.colors.primary + '40',
    backgroundColor: '#eff6ff',
  },
  kycNote: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: tokens.spacing.xs,
  },
});

export default SelfServiceReadinessScreen;
