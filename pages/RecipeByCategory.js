import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { recipes } from '../data';

const RecipeByCategory = ({ route, navigation }) => {
  const { category } = route.params;

  const filteredRecipes = recipes.filter(recipe => recipe.category === category);

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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} 
      >
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backText}></Text>
      </TouchableOpacity>
      <Text style={styles.title}>{category}</Text>
      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.scrollContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    height: 250,
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

export default RecipeByCategory;