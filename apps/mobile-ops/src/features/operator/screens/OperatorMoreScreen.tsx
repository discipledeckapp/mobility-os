'use client';

import { StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { OperatorBottomNav } from '../../../components/operator-bottom-nav';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function OperatorMoreScreen({ navigation }: ScreenProps<'OperatorMore'>) {
  return (
    <Screen footer={<OperatorBottomNav currentTab="OperatorMore" navigation={navigation} />}>
      <Card style={styles.section}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.copy}>Secondary operator surfaces that are still useful on mobile.</Text>
        <Button
          label="Organisation setup"
          onPress={() => navigation.navigate('OperatorBusinessEntities')}
        />
        <Button label="Vehicles" onPress={() => navigation.navigate('OperatorVehicles')} />
        <Button label="Reports" variant="secondary" onPress={() => navigation.navigate('OperatorReports')} />
        <Button label="Wallet" variant="secondary" onPress={() => navigation.navigate('OperatorWallet')} />
        <Button label="Settings" variant="secondary" onPress={() => navigation.navigate('OperatorSettings')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: tokens.spacing.sm },
  title: { color: tokens.colors.ink, fontSize: 28, fontWeight: '800' },
  copy: { color: tokens.colors.inkSoft, lineHeight: 20 },
});

export default OperatorMoreScreen;
