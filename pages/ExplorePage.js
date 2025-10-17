import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { recipes } from '../data';

const ExplorePage = () => {
  const navigation = useNavigation();
  const latestRecipes = recipes.slice(0, 7);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}
     onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.itemTextContainer}
        >
          <View>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Page</Text>
      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.scrollContainer}
      />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    padding: 20,
  },
  scrollContainer: {
    padding: 10,
  },
  itemContainer: {
    flex: 1,
  },
  imageContainer: {
    margin: 5,
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  itemTextContainer: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  itemText: {
    color: 'white',
  },
});

export default ExplorePage;