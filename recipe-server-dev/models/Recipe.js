import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    instructions: [
      {
        type: String,
        trim: true,
      },
    ],
    cookTime: {
      type: String,
    },
    servings: {
      type: String,
    },
    description: {
      type: String,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    youtubeLinks: [
      {
        title: {
          type: String,
        },
        url: {
          type: String,
        },
        thumbnail: {
          type: String,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Recipe', recipeSchema);
