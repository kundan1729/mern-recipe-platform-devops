import { motion } from 'framer-motion';
import { Clock, Gauge, BookOpen } from 'lucide-react';

export default function RecipeCard({ recipe }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-3"
        >
          {recipe.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-emerald-50 text-lg"
        >
          {recipe.description}
        </motion.p>
      </div>

      <div className="p-8">
        <div className="flex gap-6 mb-8 flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl"
          >
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-700">{recipe.time_minutes} mins</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl"
          >
            <Gauge className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-700">{recipe.difficulty}</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-800">Ingredients</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients_needed.map((ingredient, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-2 text-gray-700"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {ingredient}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Steps</h3>
          <ol className="space-y-4">
            {recipe.steps.map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex gap-4"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-1">{step}</p>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </motion.div>
  );
}
