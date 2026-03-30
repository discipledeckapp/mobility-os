import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { reportMobileLog } from '../services/mobile-log-service';
import { tokens } from '../theme/tokens';
import { Button } from './button';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
  recovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onStartOver?: () => Promise<void> | void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: null, recovering: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message, recovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('mobile-ops unhandled error', error, errorInfo);
    void reportMobileLog({
      level: 'error',
      category: 'react_error_boundary',
      message: error.message,
      stack: `${error.stack ?? ''}\n${errorInfo.componentStack ?? ''}`.trim(),
    });
  }

  private async recoverWith(action?: () => Promise<void> | void) {
    try {
      this.setState({ recovering: true });
      await action?.();
    } finally {
      this.setState({ hasError: false, message: null, recovering: false });
    }
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.message?.trim();
      const likelyNetworkIssue =
        Boolean(message) &&
        /(network|request|fetch|timed out|offline|internet|connection)/i.test(message ?? '');

      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{likelyNetworkIssue ? '↺' : '!'}</Text>
          </View>
          <Text style={styles.title}>
            {likelyNetworkIssue ? 'Connection interrupted' : 'We hit a snag'}
          </Text>
          <Text style={styles.message}>
            {likelyNetworkIssue
              ? 'Your session is still here. Retry now, or reopen sign-in if the connection keeps failing.'
              : 'This screen did not finish loading. Retry now, or restart from sign-in without losing your place.'}
          </Text>
          {message ? <Text style={styles.detail}>{message}</Text> : null}
          {this.state.recovering ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={tokens.colors.primary} />
              <Text style={styles.loaderText}>Recovering your app…</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <Button label="Try again" onPress={() => void this.recoverWith()} />
              <Button
                label="Restart from sign in"
                variant="secondary"
                onPress={() => void this.recoverWith(this.props.onStartOver)}
              />
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.background,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  icon: {
    color: tokens.colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    color: tokens.colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  message: {
    color: tokens.colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
  },
  detail: {
    color: tokens.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: tokens.spacing.sm,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  loaderText: {
    color: tokens.colors.inkSoft,
    fontSize: 14,
    fontWeight: '600',
  },
});
