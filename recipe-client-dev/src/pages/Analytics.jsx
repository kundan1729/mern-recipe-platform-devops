import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recipeAPI } from '../lib/mongodbClient';

export default function Analytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    favoriteIngredient: '',
    averageTime: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const { analytics: data, error } = await recipeAPI.getAnalytics(token);
        if (error) throw new Error(error);

        setAnalytics(data || []);

        // Calculate stats
        if (data && data.length > 0) {
          const totalGenerations = data.length;
          const ingredientMap = {};

          data.forEach((item) => {
            const ingredients = item.ingredients_input?.split(',') || [];
            ingredients.forEach((ing) => {
              const cleaned = ing.trim();
              ingredientMap[cleaned] = (ingredientMap[cleaned] || 0) + 1;
            });
          });

          const favoriteIngredient = Object.entries(ingredientMap).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || 'N/A';

          setStats({
            totalGenerations,
            favoriteIngredient,
            averageTime: Math.round(totalGenerations / 30), // Approximate
          });
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const getWeeklyData = () => {
    const data = Array(7).fill(0);
    analytics.forEach((item) => {
      const date = new Date(item.generated_at);
      const day = date.getDay();
      data[day]++;
    });
    return data;
  };

  const getMonthlyData = () => {
    const data = Array(30).fill(0);
    analytics.forEach((item) => {
      const date = new Date(item.generated_at);
      const day = date.getDate() - 1;
      if (day >= 0 && day < 30) data[day]++;
    });
    return data;
  };

  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-10 h-10 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-800">Analytics</h1>
          </div>
          <p className="text-gray-600 text-lg">Track your recipe generation activity</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatBox
                icon={<Zap className="w-8 h-8" />}
                label="Total Generations"
                value={stats.totalGenerations}
                color="emerald"
              />
              <StatBox
                icon={<TrendingUp className="w-8 h-8" />}
                label="This Week"
                value={analytics.filter((a) => {
                  const date = new Date(a.generated_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length}
                color="teal"
              />
              <StatBox
                icon={<Calendar className="w-8 h-8" />}
                label="Favorite Ingredient"
                value={stats.favoriteIngredient}
                color="blue"
              />
              <StatBox
                icon={<BarChart3 className="w-8 h-8" />}
                label="Avg per Day"
                value={stats.averageTime}
                color="purple"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Weekly Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Activity</h2>
                <div className="flex items-end gap-2 h-48">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-emerald-100 rounded-t-lg transition-all hover:bg-emerald-200"
                        style={{
                          height: `${(weeklyData[i] / maxWeekly) * 100}%`,
                          minHeight: weeklyData[i] === 0 ? '4px' : undefined,
                        }}
                      />
                      <span className="text-xs font-semibold text-gray-600">{day}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Generation Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Generation Trends</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Chicken', value: 35 },
                    { label: 'Vegetables', value: 28 },
                    { label: 'Rice', value: 22 },
                    { label: 'Pasta', value: 15 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                        <span className="text-sm text-gray-600">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              {analytics.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.slice(0, 10).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                        🧑‍🍳
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{item.recipe_title}</p>
                        <p className="text-sm text-gray-600">
                          Ingredients: {item.ingredients_input}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.generated_at).toLocaleDateString()}{' '}
                          {new Date(item.generated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  const colorMap = {
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white text-opacity-80 text-sm mb-1">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </motion.div>
  );
}
