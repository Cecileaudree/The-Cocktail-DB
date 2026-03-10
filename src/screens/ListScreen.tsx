import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import { RootStackParamList } from '../../App';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  gender: string;
  image: string;
  location: { name: string };
}

interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

interface ApiResponse {
  info: ApiInfo;
  results: Character[];
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ─── Constantes ──────────────────────────────────────────────────────────────

const BASE_URL = 'https://rickandmortyapi.com/api';

// Couleurs selon le statut du personnage
const STATUS_COLORS: Record<string, string> = {
  Alive: '#2ecc71',
  Dead: '#e74c3c',
  unknown: '#95a5a6',
};

// ─── Composant ListScreen ────────────────────────────────────────────────────

const ListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination native par numéro de page
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // ── Fetch par page ────────────────────────────────────────────────────────
  const fetchCharacters = useCallback(
    async (pageNum: number, query: string, append: boolean) => {
      try {
        const params: Record<string, string | number> = { page: pageNum };
        if (query.trim()) params.name = query.trim();

        const response = await axios.get<ApiResponse>(
          `${BASE_URL}/character`,
          { params }
        );

        const { results, info } = response.data;
        setCharacters((prev) => (append ? [...prev, ...results] : results));
        setHasMore(info.next !== null);
        setError(null);
      } catch (err: any) {
        // L'API renvoie 404 si aucun personnage trouvé
        if (err?.response?.status === 404) {
          setCharacters([]);
          setHasMore(false);
          setError(null);
        } else {
          setError('Impossible de charger les personnages. Réessayez.');
        }
      }
    },
    []
  );

  // ── Montage : charge la page 1 ────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchCharacters(1, '', false);
      setIsLoading(false);
    };
    init();
  }, [fetchCharacters]);

  // ── Callback SearchBar (debounce géré dans SearchBar) ────────────────────
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setPage(1);
      setHasMore(true);
      setIsLoading(true);
      if (query.trim() === '') {
        setIsSearchMode(false);
      } else {
        setIsSearchMode(true);
      }
      await fetchCharacters(1, query, false);
      setIsLoading(false);
    },
    [fetchCharacters]
  );

  // ── Scroll infini ─────────────────────────────────────────────────────────
  const handleEndReached = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsFetchingMore(true);
    await fetchCharacters(nextPage, searchQuery, true);
    setPage(nextPage);
    setIsFetchingMore(false);
  }, [isFetchingMore, hasMore, page, searchQuery, fetchCharacters]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchCharacters(1, searchQuery, false);
    setIsRefreshing(false);
  }, [searchQuery, fetchCharacters]);

  // ── Rendu d'une carte personnage ──────────────────────────────────────────
  const renderItem = ({ item }: { item: Character }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { id: String(item.id) })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardSub}>
          {item.species} · {item.gender}
        </Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {item.location.name}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[item.status] ?? '#95a5a6' },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Footer : loader de pagination ─────────────────────────────────────────
  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <ActivityIndicator
        size="small"
        color="#00b5cc"
        style={{ marginVertical: 16 }}
      />
    );
  };

  // ── Écran d'erreur avec bouton Réessayer ──────────────────────────────────
  if (error && characters.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>🔄 Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Écran de chargement initial ───────────────────────────────────────────
  if (isLoading && characters.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b5cc" />
        <Text style={styles.loadingText}>Chargement des personnages...</Text>
      </View>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Rechercher un personnage..."
      />

      {characters.length === 0 && !isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            👽 Aucun personnage trouvé pour « {searchQuery} »
          </Text>
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00b5cc']}
              tintColor="#00b5cc"
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Carte personnage
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
  cardImage: {
    width: 100,
    height: 100,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 4,
  },
  cardLocation: {
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
  // États
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0a0a1a',
  },
  loadingText: {
    marginTop: 12,
    color: '#aaa',
    fontSize: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00b5cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ListScreen;
