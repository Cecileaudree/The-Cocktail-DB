import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

// Ce composant sera complété par l'Étudiant B
const DetailScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00b5cc" />
      <Text style={styles.text}>Chargement du personnage #{id}…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a1a',
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    color: '#aaa',
  },
});

export default DetailScreen;
