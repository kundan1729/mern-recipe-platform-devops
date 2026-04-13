// MongoDB API client for the recipe app
const API_BASE = '/api';

// Auth API calls
export const authAPI = {
  // Sign up
  signUp: async (email, password, fullName) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      return { user: data.user, token: data.token, error: null };
    } catch (err) {
      return { user: null, token: null, error: err.message };
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signin failed');
      return { user: data.user, token: data.token, error: null };
    } catch (err) {
      return { user: null, token: null, error: err.message };
    }
  },

  // Get user profile
  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  },

  // Update profile
  updateProfile: async (token, updates) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed');
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  },
};

// Recipe API calls
export const recipeAPI = {
  // Save recipe
  saveRecipe: async (token, recipe) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipe),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save recipe');
      return { recipe: data.recipe, error: null };
    } catch (err) {
      return { recipe: null, error: err.message };
    }
  },

  // Get saved recipes
  getSavedRecipes: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch recipes');
      return { recipes: data.recipes, error: null };
    } catch (err) {
      return { recipes: [], error: err.message };
    }
  },

  // Delete recipe
  deleteRecipe: async (token, recipeId) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete recipe');
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Log recipe generation
  logGeneration: async (token, ingredients, recipeTitle) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredients, recipeTitle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to log');
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Get analytics
  getAnalytics: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch analytics');
      return { analytics: data.analytics, error: null };
    } catch (err) {
      return { analytics: null, error: err.message };
    }
  },

  // Get dashboard stats
  getDashboardStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch stats');
      return { stats: data.stats, error: null };
    } catch (err) {
      return { stats: null, error: err.message };
    }
  },

  // Toggle recipe favorite
  toggleFavorite: async (token, recipeId) => {
    try {
      const response = await fetch(`${API_BASE}/recipes/${recipeId}/favorite`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to toggle favorite');
      return { recipe: data.recipe, error: null };
    } catch (err) {
      return { recipe: null, error: err.message };
    }
  },
};
