import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';

export default function InputBox({ ingredients, setIngredients, onGenerate, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onGenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter ingredients (e.g., egg, flour, milk)"
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
            disabled={loading}
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || !ingredients.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChefHat className="w-6 h-6" />
          {loading ? 'Cooking up magic...' : 'Generate Recipe'}
        </motion.button>
      </form>
    </motion.div>
  );
}
