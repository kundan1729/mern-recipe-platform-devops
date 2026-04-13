import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Oops! Something went wrong</h3>
          <p className="text-red-700">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
