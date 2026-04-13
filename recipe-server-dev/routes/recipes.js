import express from 'express';
import { generateRecipe, searchRecipeVideos, saveRecipe, getSavedRecipes, deleteRecipe, logGeneration, getAnalytics, getDashboardStats, toggleFavorite } from '../controllers/recipeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', generateRecipe);
router.get('/videos', searchRecipeVideos);
router.post('/save', protect, saveRecipe);
router.get('/saved', protect, getSavedRecipes);
router.delete('/:recipeId', protect, deleteRecipe);
router.patch('/:recipeId/favorite', protect, toggleFavorite);
router.post('/log', protect, logGeneration);
router.get('/analytics', protect, getAnalytics);
router.get('/stats', protect, getDashboardStats);

export default router;
