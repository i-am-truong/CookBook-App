// Database.js - Local database for CookBook App
// This file stores all data locally and provides API functions to interact with it
// The remote API is kept as a fallback option

// Import the original data from database.json
import DATABASE_JSON from './database.json';

// Initialize the in-memory database with data from database.json
let database = {
  recipes: [...DATABASE_JSON.recipes],
  myRecipes: [...DATABASE_JSON.myRecipes],
  savedRecipes: [...DATABASE_JSON.savedRecipes],
  communityPosts: [...DATABASE_JSON.communityPosts],
  likes: [...DATABASE_JSON.likes],
  comments: [...DATABASE_JSON.comments],
};

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

// ==================== RECIPES API ====================

/**
 * Get all recipes (public recipes)
 */
export const getAllRecipes = async () => {
  try {
    // Filter only public recipes
    const publicRecipes = database.recipes.filter(recipe => recipe.isPublic !== false);
    return publicRecipes;
  } catch (error) {
    console.error('Error getting all recipes:', error);
    throw error;
  }
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (id) => {
  try {
    const recipe = database.recipes.find(r => r.id === id);
    if (!recipe) {
      throw new Error(`Recipe with id ${id} not found`);
    }
    return recipe;
  } catch (error) {
    console.error('Error getting recipe by id:', error);
    throw error;
  }
};

/**
 * Get recipes by category
 */
export const getRecipesByCategory = async (category) => {
  try {
    const recipes = database.recipes.filter(r => r.category === category && r.isPublic !== false);
    return recipes;
  } catch (error) {
    console.error('Error getting recipes by category:', error);
    throw error;
  }
};

/**
 * Search recipes by name
 */
export const searchRecipes = async (query) => {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    const results = database.recipes.filter(r => 
      r.name.toLowerCase().includes(normalizedQuery) && r.isPublic !== false
    );
    return results;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Add a new recipe
 */
export const addRecipe = async (recipeData) => {
  try {
    const newRecipe = {
      ...recipeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    database.recipes.push(newRecipe);
    return newRecipe;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

/**
 * Update a recipe
 * Idempotent: If recipe doesn't exist, returns success (recipe may not be in recipes collection yet)
 */
export const updateRecipe = async (id, updatedData) => {
  try {
    const index = database.recipes.findIndex(r => r.id === id);
    if (index === -1) {
      // Recipe doesn't exist in recipes collection - this is normal if recipe hasn't been published yet
      // Return success to indicate operation completed (idempotent)
      return { 
        success: true, 
        message: 'Recipe not found in recipes collection (may not be published yet)',
        recipe: updatedData 
      };
    }
    database.recipes[index] = {
      ...database.recipes[index],
      ...updatedData,
      id, // Preserve the original ID
    };
    return database.recipes[index];
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

/**
 * Delete a recipe
 * Idempotent: If recipe doesn't exist, returns success (already deleted)
 */
export const deleteRecipe = async (id) => {
  try {
    const index = database.recipes.findIndex(r => r.id === id);
    if (index === -1) {
      // Recipe doesn't exist - return success (idempotent delete)
      return { success: true, message: 'Recipe not found, already deleted or never existed' };
    }
    database.recipes.splice(index, 1);
    return { success: true, message: 'Recipe deleted successfully' };
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// ==================== MY RECIPES API ====================

/**
 * Get all user's recipes
 */
export const getMyRecipes = async (userId) => {
  try {
    if (!userId) {
      return database.myRecipes;
    }
    return database.myRecipes.filter(r => r.createdBy === userId);
  } catch (error) {
    console.error('Error getting my recipes:', error);
    throw error;
  }
};

/**
 * Add recipe to my recipes
 */
export const addMyRecipe = async (recipeData) => {
  try {
    const newRecipe = {
      ...recipeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      aiGenerated: recipeData.aiGenerated || false,
      isPublic: recipeData.isPublic || false,
      status: recipeData.status || 'private',
      publishedAt: recipeData.isPublic ? new Date().toISOString() : null,
    };
    database.myRecipes.push(newRecipe);
    return newRecipe;
  } catch (error) {
    console.error('Error adding my recipe:', error);
    throw error;
  }
};

/**
 * Update my recipe
 */
export const updateMyRecipe = async (id, updatedData) => {
  try {
    const index = database.myRecipes.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`My recipe with id ${id} not found`);
    }
    database.myRecipes[index] = {
      ...database.myRecipes[index],
      ...updatedData,
      id,
    };
    return database.myRecipes[index];
  } catch (error) {
    console.error('Error updating my recipe:', error);
    throw error;
  }
};

/**
 * Delete my recipe
 * Idempotent: If recipe doesn't exist, returns success (already deleted)
 */
export const deleteMyRecipe = async (id) => {
  try {
    const index = database.myRecipes.findIndex(r => r.id === id);
    if (index === -1) {
      // Recipe doesn't exist - return success (idempotent delete)
      return { success: true, message: 'My recipe not found, already deleted or never existed' };
    }
    database.myRecipes.splice(index, 1);
    return { success: true, message: 'My recipe deleted successfully' };
  } catch (error) {
    console.error('Error deleting my recipe:', error);
    throw error;
  }
};

// ==================== SAVED RECIPES API ====================

/**
 * Get all saved recipes
 */
export const getSavedRecipes = async (userId) => {
  try {
    // If we want to filter by user in the future, we can add userId to savedRecipes
    return database.savedRecipes;
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    throw error;
  }
};

/**
 * Save a recipe
 */
export const saveRecipe = async (recipe) => {
  try {
    // Check if recipe is already saved
    const exists = database.savedRecipes.find(r => r.id === recipe.id);
    if (exists) {
      return { success: false, message: 'Recipe already saved' };
    }
    database.savedRecipes.push(recipe);
    return { success: true, message: 'Recipe saved successfully', recipe };
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

/**
 * Update a saved recipe
 * Idempotent: If recipe doesn't exist, returns success (already updated or never saved)
 */
export const updateSavedRecipe = async (id, updatedData) => {
  try {
    const index = database.savedRecipes.findIndex(r => r.id === id);
    if (index === -1) {
      // Recipe not in saved list - return success (idempotent)
      return { success: true, message: 'Recipe not found in saved recipes (may not be saved yet)' };
    }
    database.savedRecipes[index] = {
      ...database.savedRecipes[index],
      ...updatedData,
      id, // Preserve the original ID
    };
    return { success: true, message: 'Saved recipe updated successfully', recipe: database.savedRecipes[index] };
  } catch (error) {
    console.error('Error updating saved recipe:', error);
    throw error;
  }
};

/**
 * Unsave a recipe
 * Idempotent: If recipe doesn't exist, returns success (already unsaved)
 */
export const unsaveRecipe = async (recipeId) => {
  try {
    const index = database.savedRecipes.findIndex(r => r.id === recipeId);
    if (index === -1) {
      // Recipe not in saved list - return success (idempotent)
      return { success: true, message: 'Recipe not found in saved recipes, already unsaved' };
    }
    database.savedRecipes.splice(index, 1);
    return { success: true, message: 'Recipe unsaved successfully' };
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    throw error;
  }
};

// ==================== COMMUNITY POSTS API ====================

/**
 * Get all community posts
 */
export const getCommunityPosts = async () => {
  try {
    return database.communityPosts;
  } catch (error) {
    console.error('Error getting community posts:', error);
    throw error;
  }
};

/**
 * Get post by ID
 */
export const getPostById = async (postId) => {
  try {
    const post = database.communityPosts.find(p => p.id === postId);
    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  } catch (error) {
    console.error('Error getting post by id:', error);
    throw error;
  }
};

/**
 * Create a new community post
 */
export const createCommunityPost = async (postData) => {
  try {
    const newPost = {
      ...postData,
      id: `post-${generateId()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
    };
    database.communityPosts.push(newPost);
    return newPost;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

/**
 * Delete a community post
 */
export const deleteCommunityPost = async (postId) => {
  try {
    const index = database.communityPosts.findIndex(p => p.id === postId);
    if (index === -1) {
      throw new Error(`Post with id ${postId} not found`);
    }
    database.communityPosts.splice(index, 1);
    // Also delete associated likes and comments
    database.likes = database.likes.filter(l => l.postId !== postId);
    database.comments = database.comments.filter(c => c.postId !== postId);
    return { success: true, message: 'Post deleted successfully' };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ==================== LIKES API ====================

/**
 * Get likes for a post
 */
export const getPostLikes = async (postId) => {
  try {
    return database.likes.filter(l => l.postId === postId);
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};

/**
 * Like a post
 */
export const likePost = async (postId, userId) => {
  try {
    // Check if already liked
    const exists = database.likes.find(l => l.postId === postId && l.userId === userId);
    if (exists) {
      return { success: false, message: 'Post already liked' };
    }
    
    const newLike = {
      id: `like-${generateId()}`,
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };
    database.likes.push(newLike);
    
    // Update post likes count
    const post = database.communityPosts.find(p => p.id === postId);
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
    }
    
    return { success: true, message: 'Post liked successfully', like: newLike };
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

/**
 * Unlike a post
 */
export const unlikePost = async (postId, userId) => {
  try {
    const index = database.likes.findIndex(l => l.postId === postId && l.userId === userId);
    if (index === -1) {
      return { success: false, message: 'Like not found' };
    }
    
    database.likes.splice(index, 1);
    
    // Update post likes count
    const post = database.communityPosts.find(p => p.id === postId);
    if (post && post.likesCount > 0) {
      post.likesCount -= 1;
    }
    
    return { success: true, message: 'Post unliked successfully' };
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// ==================== COMMENTS API ====================

/**
 * Get comments for a post
 */
export const getPostComments = async (postId) => {
  try {
    return database.comments.filter(c => c.postId === postId);
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId, userId, username, text) => {
  try {
    const newComment = {
      id: `cmt-${generateId()}`,
      postId,
      userId,
      username,
      text,
      createdAt: new Date().toISOString(),
    };
    database.comments.push(newComment);
    
    // Update post comments count
    const post = database.communityPosts.find(p => p.id === postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
    }
    
    return { success: true, message: 'Comment added successfully', comment: newComment };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId) => {
  try {
    const index = database.comments.findIndex(c => c.id === commentId);
    if (index === -1) {
      throw new Error(`Comment with id ${commentId} not found`);
    }
    
    const comment = database.comments[index];
    database.comments.splice(index, 1);
    
    // Update post comments count
    const post = database.communityPosts.find(p => p.id === comment.postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
    }
    
    return { success: true, message: 'Comment deleted successfully' };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Reset database to original state
 */
export const resetDatabase = () => {
  database = {
    recipes: [...DATABASE_JSON.recipes],
    myRecipes: [...DATABASE_JSON.myRecipes],
    savedRecipes: [...DATABASE_JSON.savedRecipes],
    communityPosts: [...DATABASE_JSON.communityPosts],
    likes: [...DATABASE_JSON.likes],
    comments: [...DATABASE_JSON.comments],
  };
  return { success: true, message: 'Database reset successfully' };
};

/**
 * Get all database data (for debugging)
 */
export const getDatabaseSnapshot = () => {
  return { ...database };
};

// Export default database functions
export default {
  // Recipes
  getAllRecipes,
  getRecipeById,
  getRecipesByCategory,
  searchRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  
  // My Recipes
  getMyRecipes,
  addMyRecipe,
  updateMyRecipe,
  deleteMyRecipe,
  
  // Saved Recipes
  getSavedRecipes,
  saveRecipe,
  updateSavedRecipe,
  unsaveRecipe,
  
  // Community Posts
  getCommunityPosts,
  getPostById,
  createCommunityPost,
  deleteCommunityPost,
  
  // Likes
  getPostLikes,
  likePost,
  unlikePost,
  
  // Comments
  getPostComments,
  addComment,
  deleteComment,
  
  // Utilities
  resetDatabase,
  getDatabaseSnapshot,
};
