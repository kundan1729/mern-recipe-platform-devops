import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Clock, Gauge, Share2, Heart, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recipeAPI } from '../lib/mongodbClient';

const normalizeRecipe = (recipe) => ({
  ...recipe,
  ingredients: recipe.ingredients || recipe.ingredients_needed || [],
  instructions: recipe.instructions || recipe.steps || [],
  cookTime: recipe.cookTime || recipe.time_minutes || '',
  servings: recipe.servings || '',
});

export default function SavedRecipes() {
  const { user, token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const { recipes, error: err } = await recipeAPI.getSavedRecipes(token);
        if (err) throw new Error(err);
        setRecipes((recipes || []).map(normalizeRecipe));
      } catch (err) {
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [token]);

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await recipeAPI.deleteRecipe(token, recipeId);
      if (error) throw new Error(error);
      setRecipes(recipes.filter((r) => r._id !== recipeId));
      setSelectedRecipe(null);
    } catch (err) {
      setError(err.message || 'Failed to delete recipe');
    }
  };

  const handleToggleFavorite = async () => {
    if (!selectedRecipe) return;

    try {
      const { recipe, error } = await recipeAPI.toggleFavorite(token, selectedRecipe._id);
      if (error) throw new Error(error);
      const normalizedRecipe = normalizeRecipe(recipe);
      
      // Update selected recipe
      setSelectedRecipe(normalizedRecipe);
      
      // Update recipe in list
      setRecipes(recipes.map(r => r._id === normalizedRecipe._id ? normalizedRecipe : r));
    } catch (err) {
      setError(err.message || 'Failed to toggle favorite');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Saved Recipes
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-semibold transition-colors">
              Dashboard
            </a>
            <a href="/" className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-semibold transition-colors">
              Home
            </a>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <div className="container mx-auto max-w-7xl">
          {/* Subheader */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-gray-600 text-lg">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
          </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-red-800"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Saved Recipes Yet</h2>
            <p className="text-gray-600 mb-6">Generate a recipe and save it to your collection!</p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Generate a Recipe
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            {/* Recipes List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 overflow-y-auto pr-4 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="space-y-4">
                {recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`bg-white rounded-xl p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                      selectedRecipe?._id === recipe._id
                        ? 'ring-2 ring-emerald-500'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{recipe.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recipe._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                      {recipe.cookTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookTime}
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {recipe.servings} servings
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      {recipe.ingredients?.slice(0, 2).map((ing, i) => (
                        <span
                          key={i}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                        >
                          {ing}
                        </span>
                      ))}
                      {recipe.ingredients?.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{recipe.ingredients.length - 2} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recipe Detail View */}
            {selectedRecipe && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8 max-h-[calc(100vh-200px)] flex flex-col scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex-shrink-0">
                    <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
                    <p className="text-emerald-50">{selectedRecipe.description}</p>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto flex-1"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {/* Meta Info */}
                    <div className="flex gap-6">
                      {selectedRecipe.cookTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-600">Cook Time</p>
                            <p className="font-semibold text-gray-800">{selectedRecipe.cookTime}</p>
                          </div>
                        </div>
                      )}
                      {selectedRecipe.servings && (
                        <div className="flex items-center gap-2">
                          <Gauge className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="text-xs text-gray-600">Servings</p>
                            <p className="font-semibold text-gray-800">{selectedRecipe.servings}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Ingredients</h3>
                      {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-gray-700">{ing}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No ingredients listed</p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Instructions</h3>
                      {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 ? (
                        <ol className="space-y-3">
                          {selectedRecipe.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </span>
                              <span className="text-gray-700 pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-gray-500 text-sm">No instructions listed</p>
                      )}
                    </div>

                    {/* YouTube Reference Links */}
                    {selectedRecipe.youtubeLinks && selectedRecipe.youtubeLinks.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          📺 Video References ({selectedRecipe.youtubeLinks.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedRecipe.youtubeLinks.map((video, i) => {
                            return (
                              <div key={i} className="group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                                {video.thumbnail && (
                                  <div className="relative h-32 overflow-hidden bg-gray-200">
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                      <svg className="w-12 h-12 text-red-500 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                <div className="bg-white p-4">
                                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3">
                                    {video.title}
                                  </p>
                                  <div className="flex gap-2">
                                    <a
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                      </svg>
                                      Watch Video
                                    </a>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Scroll to recipe details
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                      </svg>
                                      Get Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button 
                        onClick={handleToggleFavorite}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
                          selectedRecipe?.isFavorite
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${selectedRecipe?.isFavorite ? 'fill-current' : ''}`} />
                        {selectedRecipe?.isFavorite ? 'Favorited' : 'Favorite'}
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                        <Share2 className="w-5 h-5" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
