'use client';

import { useEffect } from 'react';
import { Alert, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { initiateDriverKycCheckout, notifyDriverSelfServiceOrganisation } from '../../../api';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Screen } from '../../../components/screen';
import { useAuth } from '../../../contexts/auth-context';
import { useSelfService } from '../../../contexts/self-service-context';
import { useToast } from '../../../contexts/toast-context';
import { buildSelfServiceVerificationDeepLink } from '../../../navigation/linking';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';
import { isDriverMobileSession } from '../../../utils/roles';
import { buildDriverOnboardingSteps, resolveNextDriverAction } from '../verification-flow';

export function SelfServiceReadinessScreen({ navigation }: ScreenProps<'SelfServiceReadiness'>) {
  const { showToast } = useToast();
  const { session } = useAuth();
  const {
    token,
    driver,
    documents,
    isLoading,
    isRefreshing,
    refreshSelfService,
    clearSelfService,
  } = useSelfService();

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

  const onNotifyOrganisation = async () => {
    if (!token) return;
    try {
      const result = await notifyDriverSelfServiceOrganisation(token);
      showToast(result.message, 'success');
    } catch (error) {
      Alert.alert(
        'Notify organisation',
        error instanceof Error ? error.message : 'Unable to notify your organisation right now.',
      );
    }
  };

  const driverWorkspaceReady =
    !!driver &&
    isDriverMobileSession(session) &&
    driver.authenticationAccess === 'ready' &&
    driver.activationReadiness === 'ready';

  useEffect(() => {
    if (driverWorkspaceReady) {
      navigation.replace('Home');
    }
  }, [driverWorkspaceReady, navigation]);

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
  const requiresLicenceStep =
    (driver.verificationTierComponents ?? []).includes('drivers_license') ||
    driver.verificationComponents?.some(
      (component) => component.key === 'drivers_license' && component.required,
    ) === true;
  const requiresManualReview = driver.identityStatus === 'review_needed';
  const hasDocumentBlockers =
    (requiresLicenceStep && !driver.hasApprovedLicence) ||
    driver.pendingDocumentCount > 0 ||
    driver.rejectedDocumentCount > 0 ||
    driver.expiredDocumentCount > 0;
  const canResumeVerification = requiresIdentity || hasDocumentBlockers;
  const hasUsableVerificationEntitlement =
    driver.verificationEntitlementState === 'paid' ||
    driver.verificationEntitlementState === 'reserved';
  const needsVerificationPayment =
    driver.driverPaysKyc && driver.verificationPaymentStatus === 'driver_payment_required';
  const companyFundingBlocked =
    !driver.driverPaysKyc &&
    (driver.verificationPaymentStatus === 'wallet_missing' ||
      driver.verificationPaymentStatus === 'insufficient_balance');
  const mobileAccessLabel = formatMobileAccessLabel(driver.mobileAccessStatus);
  const mobileAccessTone = mobileAccessStatusTone(driver.mobileAccessStatus);
  const onboardingSteps = buildDriverOnboardingSteps(driver).filter((step) => step.key !== 'account');
  const nextAction = resolveNextDriverAction(driver, documents.length);

  const openNextAction = () => {
    navigation.navigate(nextAction.target);
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <Card style={styles.section}>
        <Text style={styles.kicker}>Mobiris Fleet OS</Text>
        <Text style={styles.title}>Your next driver step</Text>
        <Text style={styles.copy}>
          We only show the steps needed for {driver.verificationTierLabel ?? 'your organisation’s verification level'}.
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
        <Text style={styles.sectionTitle}>Do this next</Text>
        <Text style={styles.label}>{nextAction.title}</Text>
        <Text style={styles.copy}>{nextAction.description}</Text>
        <Button label={nextAction.cta} onPress={openNextAction} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          {driver.verificationTierLabel ?? 'Verification level'}
        </Text>
        <Text style={styles.copy}>
          {driver.verificationTierDescription ??
            'Your organisation decides which checks must be completed before you can operate.'}
        </Text>
        {onboardingSteps.map((step) => (
          <View key={step.key} style={styles.reasonRow}>
            <View
              style={[
                styles.reasonDot,
                step.status === 'completed'
                  ? styles.reasonDotSuccess
                  : step.status === 'not_required'
                    ? styles.reasonDotMuted
                    : null,
              ]}
            />
            <View style={styles.stepCopy}>
              <View style={styles.row}>
                <Text style={styles.label}>{step.label}</Text>
                <Badge
                  label={
                    step.status === 'completed'
                      ? 'Done'
                      : step.status === 'not_required'
                        ? 'Not required'
                        : 'Pending'
                  }
                  tone={
                    step.status === 'completed'
                      ? 'success'
                      : step.status === 'not_required'
                        ? 'neutral'
                        : 'warning'
                  }
                />
              </View>
              <Text style={styles.reason}>{step.message}</Text>
            </View>
          </View>
        ))}
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
              `Your organisation requires you to pay for ${driver.verificationTierLabel ?? 'your selected verification tier'} before your identity check can proceed.`}
          </Text>
          <Button
            label={
              driver.verificationAmountMinorUnits
                ? `Pay ${(driver.verificationAmountMinorUnits / 100).toLocaleString('en-NG', {
                    style: 'currency',
                    currency: driver.verificationCurrency ?? 'NGN',
                  })}`
                : 'Pay verification'
            }
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
                driver.verificationEntitlementState === 'reserved' ? 'Payment received' : 'Paid'
              }
              tone="success"
            />
          </View>
          <Text style={styles.copy}>
            {driver.verificationPaymentMessage ??
              `Your payment for ${driver.verificationTierLabel ?? 'this verification tier'} has already been received. You can continue from where you stopped.`}
          </Text>
        </Card>
      ) : companyFundingBlocked ? (
        <Card style={[styles.section, styles.kycPaymentCard]}>
          <Text style={styles.sectionTitle}>Verification waiting on organisation</Text>
          <Text style={styles.copy}>
            {`Verification requires confirmation from your organisation before ${driver.verificationTierLabel ?? 'this verification tier'} can continue.`}
          </Text>
          <Text style={styles.kycNote}>
            If your organisation allows driver-paid verification, they can switch this onboarding
            flow so you can continue payment yourself.
          </Text>
          <Text style={styles.kycNote}>
            You can also wait and return later, or send a reminder that you are ready to continue.
          </Text>
          <Button
            label="Notify organisation"
            variant="secondary"
            onPress={() => void onNotifyOrganisation()}
          />
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
            variant={driver.guarantorBlocking ? 'primary' : 'secondary'}
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
        <Text style={styles.sectionTitle}>More actions</Text>
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
        <Button
          label="Use another verification code"
          variant="secondary"
          onPress={() => void onReset()}
        />
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

function mobileAccessStatusTone(
  status?: string | null,
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'linked') return 'success';
  if (status === 'revoked') return 'danger';
  if (status === 'inactive') return 'warning';
  return 'neutral';
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
  fundingMetric: {
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
  reasonDotSuccess: {
    backgroundColor: tokens.colors.success,
  },
  reasonDotMuted: {
    backgroundColor: '#CBD5E1',
  },
  stepCopy: {
    flex: 1,
    gap: 4,
  },
  reason: {
    color: tokens.colors.ink,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  kycPaymentCard: {
    borderWidth: 1,
    borderColor: `${tokens.colors.primary}40`,
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
