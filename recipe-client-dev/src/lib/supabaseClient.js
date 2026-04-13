import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let hasValidConfig = true;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo')) {
  console.warn(
    '⚠️  Supabase not configured properly. Authentication features will be limited.\n' +
    'Please create a Supabase project at https://supabase.com and add:\n' +
    'VITE_SUPABASE_URL=your_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_key'
  );
  hasValidConfig = false;
  // Create a dummy client to prevent crashes
  supabase = createClient('https://demo.supabase.co', 'demo-key');
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, hasValidConfig };

// Helper functions for database operations

// Save a recipe
export const saveRecipe = async (userId, recipe) => {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        ingredients_needed: recipe.ingredients_needed,
        steps: recipe.steps,
        time_minutes: recipe.time_minutes,
        difficulty: recipe.difficulty,
        original_ingredients: recipe.original_ingredients,
        created_at: new Date(),
      })
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Get user's saved recipes
export const getSavedRecipes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Delete a saved recipe
export const deleteRecipe = async (recipeId) => {
  try {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', recipeId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
};

// Log recipe generation
export const logRecipeGeneration = async (userId, ingredients, recipeTitle) => {
  try {
    const { data, error } = await supabase
      .from('recipe_analytics')
      .insert({
        user_id: userId,
        ingredients_input: ingredients,
        recipe_title: recipeTitle,
        generated_at: new Date(),
      })
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Get user analytics
export const getUserAnalytics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('recipe_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Get user dashboard stats
export const getDashboardStats = async (userId) => {
  try {
    // Get recipe count
    const { data: recipes, error: recipesError } = await supabase
      .from('saved_recipes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (recipesError) throw recipesError;

    // Get generation count
    const { data: analytics, error: analyticsError } = await supabase
      .from('recipe_analytics')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (analyticsError) throw analyticsError;

    return {
      data: {
        recipesCount: recipes?.length || 0,
        generationsCount: analytics?.length || 0,
        lastActivity: new Date(),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
};
