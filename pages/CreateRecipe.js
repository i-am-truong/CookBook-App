import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Import KeyboardAwareScrollView
import ImagePickerComponent from './ImagePickerComponent'; // Import ImagePickerComponent

const CreateRecipeScreen = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [note, setNote] = useState(''); // Note for the image
  const [imageUri, setImageUri] = useState(null); // URI of the selected image
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]); // Ingredients list
  const [steps, setSteps] = useState(['']); // Steps list

  // Validate form before submitting
  const validate = () => {
    if (!name || !category || !description || !calories || !cookingTime || servings < 1 || !imageUri) {
      alert('Please fill in all fields and add an image!');
      return false;
    }
    return true;
  };

  // Handle form submission
const handleSubmit = async () => {
    if (validate()) {
      const newRecipe = {
        id: Math.random().toString(),
        name,
        category,
        description,
        calories,
        cookingTime,
        servings,
        ingredients,
        steps,
        image: imageUri, // Include selected image URI
        note, // Include note for the image
      };

      try {
        // You can replace the below with your backend API call if needed
        alert('Recipe submitted successfully!');
        console.log('Recipe submitted:', newRecipe);

        // Clear the form after successful submission
        setName('');
        setCategory('');
        setDescription('');
        setCalories('');
        setCookingTime('');
        setServings('');
        setIngredients([{ name: '', amount: '' }]);
        setSteps(['']);
        setImageUri(null); // Reset image URI
        setNote(''); // Reset note
      } catch (error) {
        alert('Error submitting recipe');
        console.error('Error:', error);
      }
    }
  };

  // Handle ingredient change
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Handle step change
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled" // Ensures the keyboard doesn't dismiss when tapping outside
    >
      <Text style={styles.title}>Create New Recipe</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipe Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Cooking Time"
        value={cookingTime}
        onChangeText={setCookingTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Servings"
        value={servings}
        onChangeText={(text) => setServings(Number(text))}
        keyboardType="numeric"
      />

      {/* Ingredients */}
      <Text style={styles.label}>Ingredients:</Text>
      {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingredient name"
            value={ingredient.name}
            onChangeText={(text) => handleIngredientChange(index, 'name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={ingredient.amount}
            onChangeText={(text) => handleIngredientChange(index, 'amount', text)}
          />
        </View>
      ))}
      <Button title="Add Ingredient" onPress={() => setIngredients([...ingredients, { name: '', amount: '' }])} color="#28a745" />

      {/* Steps */}
      <Text style={styles.label}>Steps:</Text>
      {steps.map((step, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={step}
          onChangeText={(text) => handleStepChange(index, text)}
          placeholder={`Step ${index + 1}`}
        />
      ))}
      <Button title="Add Step" onPress={() => setSteps([...steps, ''])} color="#28a745" />

      {/* Image Picker Component */}
      <ImagePickerComponent setImageUri={setImageUri} setNote={setNote} imageUri={imageUri} note={note} />

      {/* Submit Button */}
      <Button title="Submit Recipe" onPress={handleSubmit} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensure the container grows to fill available space
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  ingredientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CreateRecipeScreen;
