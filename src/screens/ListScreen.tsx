import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import CharacterCard from '../components/CharacterCard';
import { RootStackParamList } from '../../App';
import { getCharacters } from '../services/rickmorty.service';
import { Character } from '../services/api.type';

// ─── Type de navigation ─────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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

  // ── Fetch par page ────────────────────────────────────────────────────────
  const fetchCharacters = useCallback(
    async (pageNum: number, query: string, append: boolean) => {
      try {
        const data = await getCharacters(pageNum, query);
        setCharacters((prev) => (append ? [...prev, ...data.results] : data.results));
        setHasMore(data.info.next !== null);
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

  // ── Rendu d'une carte via le composant CharacterCard ─────────────────────
  const renderItem = ({ item }: { item: Character }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Detail', { id: String(item.id) })}
      activeOpacity={0.8}
    >
      <CharacterCard character={item} />
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
