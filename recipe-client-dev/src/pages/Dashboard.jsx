import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings, Bookmark, BarChart3, Home, User, Trash2, Clock, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { recipeAPI } from '../lib/mongodbClient';

export default function Dashboard() {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    recipesCount: 0,
    generationsCount: 0,
  });
  const [recipes, setRecipes] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        const { stats: data } = await recipeAPI.getDashboardStats(token);
        if (data) {
          setStats({
            recipesCount: data.totalRecipes || 0,
            generationsCount: data.totalGenerations || 0,
          });
        }

        // Fetch saved recipes
        const { recipes: savedRecipes } = await recipeAPI.getSavedRecipes(token);
        setRecipes(savedRecipes || []);

        // Fetch analytics
        const { analytics: analyticsData } = await recipeAPI.getAnalytics(token);
        setAnalytics(analyticsData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [token]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Top Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🍳 Recipe AI
            </div>
            <div className="text-gray-600 text-sm">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-semibold transition-colors">
              Home
            </a>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white shadow-lg p-6 flex flex-col"
      >
        <div className="mb-12">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Recipe AI
          </div>
          <p className="text-gray-600 text-sm">Dashboard</p>
        </div>

        <nav className="space-y-3 flex-1">
          <NavLink
            icon={<Home className="w-5 h-5" />}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <NavLink
            icon={<Bookmark className="w-5 h-5" />}
            label="Saved Recipes"
            active={activeTab === 'recipes'}
            onClick={() => setActiveTab('recipes')}
          />
          <NavLink
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <NavLink
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t pt-6 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="ml-64 p-8 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Chef'}!</h1>
          <p className="text-gray-600">Here's what you've been up to</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            label="Recipes Generated"
            value={stats.generationsCount}
            icon="🧑‍🍳"
            trend="+12% this month"
          />
          <StatCard
            label="Saved Recipes"
            value={stats.recipesCount}
            icon="📚"
            trend={`${stats.recipesCount} in collection`}
          />
          <StatCard
            label="This Month"
            value={stats.generationsCount}
            icon="📈"
            trend="Recipes created"
          />
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="text-3xl mb-2">🧑‍🍳</div>
                  <h3 className="font-bold mb-1">Generate New Recipe</h3>
                  <p className="text-emerald-50 text-sm">Create a new recipe with AI</p>
                </Link>
                <div
                  onClick={() => setActiveTab('recipes')}
                  className="bg-white border-2 border-emerald-200 p-6 rounded-xl hover:bg-emerald-50 transition-all cursor-pointer"
                >
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="font-bold mb-1 text-gray-800">View Saved</h3>
                  <p className="text-gray-600 text-sm">Browse your saved recipes</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <p className="text-gray-600">Your recent recipe generations will appear here</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'recipes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {recipes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Recipes</h2>
                <p className="text-gray-600">Your saved recipes will appear here. Navigate to generate recipes!</p>
                <Link
                  to="/"
                  className="inline-block mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Generate a Recipe
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    to="/saved-recipes"
                    className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{recipe.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
                      </div>
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
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                            {ing}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {recipe.youtubeLinks && recipe.youtubeLinks.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-600 mb-2">📺 {recipe.youtubeLinks.length} video reference(s)</p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Generations</p>
                    <p className="text-4xl font-bold text-emerald-600">{stats.generationsCount}</p>
                  </div>
                  <div className="text-5xl">🔄</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Recipes Saved</p>
                    <p className="text-4xl font-bold text-teal-600">{stats.recipesCount}</p>
                  </div>
                  <div className="text-5xl">📚</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Save Rate</p>
                    <p className="text-4xl font-bold text-cyan-600">
                      {stats.generationsCount > 0 ? Math.round((stats.recipesCount / stats.generationsCount) * 100) : 0}%
                    </p>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
              </div>
            </div>

            {/* Generation History */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Generation History</h3>
              {analytics.length === 0 ? (
                <p className="text-gray-600">No recipe generations yet. Start generating recipes to see them here!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-500">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.recipeTitle || 'Generated Recipe'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Ingredients: {Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          Generated
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
              
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.user_metadata?.full_name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NavLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-emerald-50 text-emerald-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      <p className="text-emerald-600 text-sm font-semibold">{trend}</p>
    </motion.div>
  );
}
