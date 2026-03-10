import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Character } from '../services/api.type';

interface CharacterCardProps {
  character: Character;
}

const STATUS_COLORS: Record<string, string> = {
  Alive: '#2ecc71',
  Dead: '#e74c3c',
  unknown: '#95a5a6',
};

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: character.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {character.name}
        </Text>
        <Text style={styles.sub}>
          {character.species} · {character.gender}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {character.location.name}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[character.status] ?? '#95a5a6' },
            ]}
          />
          <Text style={styles.statusText}>{character.status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    marginVertical: 8,
    shadowColor: '#00b5cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  body: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
  },
});

export default CharacterCard;
