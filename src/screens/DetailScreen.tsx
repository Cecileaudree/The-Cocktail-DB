import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";

import { Character } from "../types/api.type";
import { RootStackParamList } from "../types/navigation";
import { getItemById } from "../services/api.service";

type DetailRouteProp = RouteProp<RootStackParamList, "Detail">;

type Props = {
  route: DetailRouteProp;
};

export default function DetailScreen({ route }: Props) {

  const { id } = route.params;

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCharacter = async () => {
    try {
      const data = await getItemById(id);
      setCharacter(data);
    } catch (error) {
      console.log("Erreur API :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacter();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.center}>
        <Text>Personnage introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Image source={{ uri: character.image }} style={styles.image} />

      <Text style={styles.name}>{character.name}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Status :</Text>
        <Text>{character.status}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Species :</Text>
        <Text>{character.species}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Gender :</Text>
        <Text>{character.gender}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Origin :</Text>
        <Text>{character.origin.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Location :</Text>
        <Text>{character.location.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Episodes :</Text>
        <Text>{character.episode.length}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    width: "100%",
    height: 300,
    borderRadius: 10
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10
  },

  infoBox: {
    flexDirection: "row",
    marginBottom: 8
  },

  label: {
    fontWeight: "bold",
    marginRight: 5
  }

});