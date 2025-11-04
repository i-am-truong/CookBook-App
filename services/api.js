// Import local database
import DB from '../database';

// Keep the original API URL as fallback
export const API_URL = "https://cookbook-app-tqt.loca.lt";

// Flag to control whether to use local database or remote API
// Set to true to use local database, false to use remote API
const USE_LOCAL_DATABASE = true;

// ==================== API WRAPPER FUNCTIONS ====================
// These functions will use local database by default, with API as fallback

/**
 * Fetch all recipes
 */
export const fetchRecipes = async () => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getAllRecipes();
    } catch (error) {
      console.error('Error fetching from local database, trying remote API:', error);
      // Fallback to remote API
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes from API:', error);
    throw error;
  }
};

/**
 * Fetch recipe by ID
 */
export const fetchRecipeById = async (id) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getRecipeById(id);
    } catch (error) {
      console.error('Error fetching from local database, trying remote API:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe by ID from API:', error);
    throw error;
  }
};

/**
 * Fetch recipes by category
 */
export const fetchRecipesByCategory = async (category) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getRecipesByCategory(category);
    } catch (error) {
      console.error('Error fetching from local database, trying remote API:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes?category=${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes by category from API:', error);
    throw error;
  }
};

/**
 * Search recipes
 */
export const searchRecipesAPI = async (query) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.searchRecipes(query);
    } catch (error) {
      console.error('Error searching in local database, trying remote API:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes/search?q=${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching recipes from API:', error);
    throw error;
  }
};

/**
 * Create a new recipe
 */
export const createRecipe = async (recipeData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.addRecipe(recipeData);
    } catch (error) {
      console.error('Error creating recipe in local database, trying remote API:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating recipe via API:', error);
    throw error;
  }
};

/**
 * Update a recipe
 * Idempotent: Returns success even if recipe doesn't exist in recipes collection
 */
export const updateRecipeAPI = async (id, updatedData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      const result = await DB.updateRecipe(id, updatedData);
      // If recipe doesn't exist, result will have success: true (idempotent)
      // This is normal if recipe hasn't been published yet
      return result;
    } catch (error) {
      // Only log if it's a real error, not a "not found" case
      if (!error.message.includes('not found')) {
        console.error('Error updating recipe in local database, trying remote API:', error);
      }
      // Continue to fallback
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      // 404 is OK for update (recipe may not be published yet)
      if (response.status === 404) {
        return { success: true, message: 'Recipe not found in recipes collection (may not be published yet)' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Only log if it's not a "not found" error
    if (!error.message.includes('not found') && !error.message.includes('404')) {
      console.error('Error updating recipe via API:', error);
    }
    // Return success for idempotent behavior
    return { success: true, message: 'Recipe update attempted (may not exist in recipes collection)' };
  }
};

/**
 * Delete a recipe
 * Idempotent: Returns success even if recipe doesn't exist
 */
export const deleteRecipeAPI = async (id) => {
  if (USE_LOCAL_DATABASE) {
    try {
      // This will return success even if recipe doesn't exist (idempotent)
      return await DB.deleteRecipe(id);
    } catch (error) {
      // Only log if it's a real error, not a "not found" case
      if (!error.message.includes('not found')) {
        console.error('Error deleting recipe in local database, trying remote API:', error);
      }
      // Continue to fallback
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      // 404 is OK for delete (idempotent)
      if (response.status === 404) {
        return { success: true, message: 'Recipe not found, already deleted' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Only log if it's not a "not found" error
    if (!error.message.includes('not found') && !error.message.includes('404')) {
      console.error('Error deleting recipe via API:', error);
    }
    // Return success for idempotent behavior
    return { success: true, message: 'Recipe deletion attempted (may not exist)' };
  }
};

// ==================== MY RECIPES ====================

/**
 * Fetch user's recipes
 */
export const fetchMyRecipes = async (userId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getMyRecipes(userId);
    } catch (error) {
      console.error('Error fetching my recipes from local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/myRecipes${userId ? `?userId=${userId}` : ''}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching my recipes from API:', error);
    throw error;
  }
};

/**
 * Create my recipe
 */
export const createMyRecipe = async (recipeData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.addMyRecipe(recipeData);
    } catch (error) {
      console.error('Error creating my recipe in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/myRecipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating my recipe via API:', error);
    throw error;
  }
};

/**
 * Update my recipe
 */
export const updateMyRecipe = async (id, updatedData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.updateMyRecipe(id, updatedData);
    } catch (error) {
      console.error('Error updating my recipe in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/myRecipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating my recipe via API:', error);
    throw error;
  }
};

/**
 * Delete my recipe
 * Idempotent: Returns success even if recipe doesn't exist
 */
export const deleteMyRecipe = async (id) => {
  if (USE_LOCAL_DATABASE) {
    try {
      // This will return success even if recipe doesn't exist (idempotent)
      return await DB.deleteMyRecipe(id);
    } catch (error) {
      // Only log if it's a real error, not a "not found" case
      if (!error.message.includes('not found')) {
        console.error('Error deleting my recipe in local database:', error);
      }
      // Continue to fallback
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/myRecipes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      // 404 is OK for delete (idempotent)
      if (response.status === 404) {
        return { success: true, message: 'My recipe not found, already deleted' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Only log if it's not a "not found" error
    if (!error.message.includes('not found') && !error.message.includes('404')) {
      console.error('Error deleting my recipe via API:', error);
    }
    // Return success for idempotent behavior
    return { success: true, message: 'My recipe deletion attempted (may not exist)' };
  }
};

// ==================== SAVED RECIPES ====================

/**
 * Fetch saved recipes
 */
export const fetchSavedRecipes = async (userId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getSavedRecipes(userId);
    } catch (error) {
      console.error('Error fetching saved recipes from local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/savedRecipes${userId ? `?userId=${userId}` : ''}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching saved recipes from API:', error);
    throw error;
  }
};

/**
 * Save a recipe
 */
export const saveRecipeAPI = async (recipe) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.saveRecipe(recipe);
    } catch (error) {
      console.error('Error saving recipe in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/savedRecipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving recipe via API:', error);
    throw error;
  }
};

/**
 * Update a saved recipe
 * Idempotent: Returns success even if recipe doesn't exist in saved recipes
 */
export const updateSavedRecipeAPI = async (id, updatedData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      const result = await DB.updateSavedRecipe(id, updatedData);
      // Result will have success: true even if recipe doesn't exist (idempotent)
      return result;
    } catch (error) {
      // Only log if it's a real error
      if (!error.message.includes('not found')) {
        console.error('Error updating saved recipe in local database:', error);
      }
      // Continue to fallback
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/savedRecipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      // 404 is OK for update (recipe may not be saved yet)
      if (response.status === 404) {
        return { success: true, message: 'Recipe not found in saved recipes (may not be saved yet)' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Only log if it's not a "not found" error
    if (!error.message.includes('not found') && !error.message.includes('404')) {
      console.error('Error updating saved recipe via API:', error);
    }
    // Return success for idempotent behavior
    return { success: true, message: 'Saved recipe update attempted (may not exist)' };
  }
};

/**
 * Unsave a recipe
 * Idempotent: Returns success even if recipe doesn't exist in saved list
 */
export const unsaveRecipeAPI = async (recipeId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      // This will return success even if recipe doesn't exist (idempotent)
      return await DB.unsaveRecipe(recipeId);
    } catch (error) {
      // Only log if it's a real error
      if (!error.message.includes('not found')) {
        console.error('Error unsaving recipe in local database:', error);
      }
      // Continue to fallback
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/savedRecipes/${recipeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      // 404 is OK for delete (idempotent)
      if (response.status === 404) {
        return { success: true, message: 'Recipe not found in saved, already unsaved' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Only log if it's not a "not found" error
    if (!error.message.includes('not found') && !error.message.includes('404')) {
      console.error('Error unsaving recipe via API:', error);
    }
    // Return success for idempotent behavior
    return { success: true, message: 'Recipe unsave attempted (may not exist)' };
  }
};

// ==================== COMMUNITY POSTS ====================

/**
 * Fetch community posts
 */
export const fetchCommunityPosts = async () => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getCommunityPosts();
    } catch (error) {
      console.error('Error fetching community posts from local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/communityPosts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching community posts from API:', error);
    throw error;
  }
};

/**
 * Create community post
 */
export const createCommunityPost = async (postData) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.createCommunityPost(postData);
    } catch (error) {
      console.error('Error creating community post in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/communityPosts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating community post via API:', error);
    throw error;
  }
};

/**
 * Like a post
 */
export const likePostAPI = async (postId, userId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.likePost(postId, userId);
    } catch (error) {
      console.error('Error liking post in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, userId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking post via API:', error);
    throw error;
  }
};

/**
 * Unlike a post
 */
export const unlikePostAPI = async (postId, userId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.unlikePost(postId, userId);
    } catch (error) {
      console.error('Error unliking post in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/likes/${postId}/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error unliking post via API:', error);
    throw error;
  }
};

/**
 * Add comment to a post
 */
export const addCommentAPI = async (postId, userId, username, text) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.addComment(postId, userId, username, text);
    } catch (error) {
      console.error('Error adding comment in local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, userId, username, text }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding comment via API:', error);
    throw error;
  }
};

/**
 * Get comments for a post
 */
export const fetchPostComments = async (postId) => {
  if (USE_LOCAL_DATABASE) {
    try {
      return await DB.getPostComments(postId);
    } catch (error) {
      console.error('Error fetching comments from local database:', error);
    }
  }
  
  // Remote API fallback
  try {
    const response = await fetch(`${API_URL}/comments?postId=${postId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments from API:', error);
    throw error;
  }
};

// Export database instance for direct access if needed
export { DB };
