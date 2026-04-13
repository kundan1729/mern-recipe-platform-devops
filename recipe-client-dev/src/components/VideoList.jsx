import { motion } from 'framer-motion';
import { Youtube, ExternalLink } from 'lucide-react';

export default function VideoList({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="max-w-6xl mx-auto mt-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <Youtube className="w-8 h-8 text-red-600" />
        <h3 className="text-3xl font-bold text-gray-800">Video Tutorials</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
          >
            <div className="relative overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <ExternalLink className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                {video.title}
              </h4>
              <p className="text-sm text-gray-500">{video.channelTitle}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
