import { StyleSheet, View } from 'react-native';

export function LoadingSkeleton({
  height = 16,
  width = '100%',
}: {
  height?: number;
  width?: number | `${number}%` | '100%';
}) {
  return <View style={[styles.skeleton, { height, width }]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 999,
    backgroundColor: '#E5EAF3',
  },
});
