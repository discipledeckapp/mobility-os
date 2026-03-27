import { LEGAL_DOCUMENTS, type LegalDocumentKind } from '@mobility-os/domain-config';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/card';
import { Screen } from '../../../components/screen';
import type { ScreenProps } from '../../../navigation/types';
import { tokens } from '../../../theme/tokens';

export function LegalDocumentScreen({ route }: ScreenProps<'LegalDocument'>) {
  const document = LEGAL_DOCUMENTS[route.params.document as LegalDocumentKind];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Legal</Text>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.summary}>
            Version {document.version}. {document.summary}
          </Text>
        </View>

        <Card style={styles.card}>
          {document.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  hero: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: tokens.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.ink,
  },
  summary: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
  },
  card: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.ink,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.inkSoft,
  },
});
