import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { reportMobileLog } from '../services/mobile-log-service';
import { tokens } from '../theme/tokens';
import { Button } from './button';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
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

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            Restart this screen and try again. If the issue continues, sign in again or contact
            support.
          </Text>
          <Button label="Restart app view" onPress={() => this.setState({ hasError: false })} />
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
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.background,
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
});
