import Recipe from '../models/Recipe.js';
import Analytics from '../models/Analytics.js';
import User from '../models/User.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export const generateRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !ingredients.trim()) {
      return res.status(400).json({ success: false, message: 'Ingredients are required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY is not configured on server' });
    }

    const prompt = `You are a master chef. Create ONE recipe using these ingredients: ${ingredients}.
Return ONLY this JSON format (no markdown, no extra text):
{
  "title": "",
  "ingredients_needed": [],
  "steps": [],
  "time_minutes": "",
  "difficulty": "",
  "description": ""
}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(502).json({
        success: false,
        message: error.error?.message || 'Failed to generate recipe',
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ success: false, message: 'No recipe generated' });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const recipe = JSON.parse(jsonString);

    res.status(200).json({ success: true, recipe });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate recipe' });
  }
};

export const searchRecipeVideos = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Recipe title is required' });
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return res.status(500).json({ success: false, message: 'YOUTUBE_API_KEY is not configured on server' });
    }

    const query = `${title} recipe cooking tutorial`;
    const url = `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&key=${youtubeApiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      return res.status(502).json({
        success: false,
        message: error.error?.message || 'Failed to fetch videos',
      });
    }

    const data = await response.json();
    const videos = (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch videos' });
  }
};

export const saveRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, cookTime, servings, description, youtubeLinks } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Recipe title is required' });
    }

    console.log('Saving recipe for userId:', req.user.id, 'Title:', title);

    const recipe = await Recipe.create({
      userId: req.user.id,
      title,
      ingredients: ingredients || [],
      instructions: instructions || [],
      cookTime,
      servings,
      description,
      youtubeLinks: youtubeLinks || [],
    });

    console.log('Recipe saved:', recipe._id);

    // Update user's saved recipes count
    await User.findByIdAndUpdate(req.user.id, { $inc: { recipesSaved: 1 } });

    res.status(201).json({
      success: true,
      message: 'Recipe saved successfully',
      recipe,
    });
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save recipe' });
  }
};

export const getSavedRecipes = async (req, res) => {
  try {
    console.log('Fetching recipes for userId:', req.user.id);
    const recipes = await Recipe.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log('Found recipes:', recipes.length);

    res.status(200).json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch recipes' });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    if (recipe.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(recipeId);

    // Update user's saved recipes count
    await User.findByIdAndUpdate(req.user.id, { $inc: { recipesSaved: -1 } });

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete recipe' });
  }
};

export const logGeneration = async (req, res) => {
  try {
    const { ingredients, recipeTitle } = req.body;

    await Analytics.create({
      userId: req.user.id,
      ingredients: ingredients || [],
      recipeTitle,
    });

    // Update user's generated recipes count
    await User.findByIdAndUpdate(req.user.id, { $inc: { recipesGenerated: 1 } });

    res.status(201).json({
      success: true,
      message: 'Generation logged',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to log' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ userId: req.user.id }).sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const totalRecipes = await Recipe.countDocuments({ userId: req.user.id });
    const totalGenerations = await Analytics.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      stats: {
        totalRecipes,
        totalGenerations,
        recipesSaved: user.recipesSaved,
        recipesGenerated: user.recipesGenerated,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch stats' });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    if (recipe.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this recipe' });
    }

    recipe.isFavorite = !recipe.isFavorite;
    await recipe.save();

    // Log to analytics
    await Analytics.create({
      userId: req.user.id,
      ingredients: recipe.ingredients || [],
      recipeTitle: recipe.title,
      action: recipe.isFavorite ? 'favorited' : 'unfavorited',
    });

    res.status(200).json({
      success: true,
      message: recipe.isFavorite ? 'Recipe added to favorites' : 'Recipe removed from favorites',
      recipe,
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle favorite' });
  }
};
