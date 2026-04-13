import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import RecipeCard from '../components/RecipeCard';
import VideoList from '../components/VideoList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CreatorFooter from '../components/CreatorFooter';
import { generateRecipe } from '../api/groq';
import { searchRecipeVideos } from '../api/youtube';
import { recipeAPI } from '../lib/mongodbClient';

function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setRecipe(null);
    setVideos([]);

    try {
      const generatedRecipe = await generateRecipe(ingredients);
      setRecipe(generatedRecipe);

      // Log analytics if user is logged in
      if (user && token) {
        await recipeAPI.logGeneration(token, ingredients, generatedRecipe.title);
      }

      try {
        const recipeVideos = await searchRecipeVideos(generatedRecipe.title);
        setVideos(recipeVideos);
      } catch (videoError) {
        console.warn('Failed to fetch videos:', videoError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user || !token) {
      navigate('/signup');
      return;
    }

    try {
      const normalizedIngredients = recipe.ingredients || recipe.ingredients_needed || [];
      const normalizedInstructions = recipe.instructions || recipe.steps || [];

      const recipeToSave = {
        title: recipe.title,
        description: recipe.description || '',
        ingredients: normalizedIngredients,
        instructions: normalizedInstructions,
        cookTime: recipe.cookTime || recipe.time_minutes || '',
        servings: recipe.servings || '',
        youtubeLinks: videos.map(v => ({
          title: v.title,
          url: v.url,
          thumbnail: v.thumbnail
        }))
      };
      const { error } = await recipeAPI.saveRecipe(token, recipeToSave);
      if (error) {
        setError(error);
      } else {
        alert('Recipe saved successfully with video references!');
      }
    } catch (err) {
      setError('Failed to save recipe. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Recipe Finder
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    // Add logout functionality
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-emerald-600" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Recipe Finder
            </h1>
            <Sparkles className="w-10 h-10 text-teal-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your ingredients and let AI create a delicious recipe for you
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-6 mx-auto max-w-4xl bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl px-4 py-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-emerald-700 tracking-wide uppercase">
              DevOps Delivery Highlights
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">GitHub Actions CI/CD</span>
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-medium">Docker Build and Push</span>
              <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-medium">Kubernetes on GKE</span>
              <span className="px-3 py-1 rounded-full bg-lime-100 text-lime-800 font-medium">OIDC Secure Deploy</span>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-medium">Ingress and Autoscaling</span>
            </div>
          </motion.div>
          {user && (
            <p className="text-sm text-emerald-600 mt-2">
              Welcome, {user.user_metadata?.full_name || user.email}! 👋
            </p>
          )}
        </motion.div>

        <InputBox
          ingredients={ingredients}
          setIngredients={setIngredients}
          onGenerate={handleGenerate}
          loading={loading}
        />

        {loading && <LoadingSpinner />}

        {error && <ErrorMessage message={error} />}

        {recipe && (
          <div className="mt-12">
            <RecipeCard recipe={recipe} />
            
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={handleSaveRecipe}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  💾 Save Recipe
                </button>
              </motion.div>
            )}

            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
              >
                <p className="text-gray-600 mb-3">Want to save this recipe?</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Sign up to save recipes
                </button>
              </motion.div>
            )}

            <VideoList videos={videos} />
          </div>
        )}

        <CreatorFooter />
      </div>
    </div>
  );
}

export default Home;
