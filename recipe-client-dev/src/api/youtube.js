const YOUTUBE_VIDEOS_URL = '/api/recipes/videos';

export async function searchRecipeVideos(recipeTitle) {
  const url = `${YOUTUBE_VIDEOS_URL}?title=${encodeURIComponent(recipeTitle)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch videos');
  }

  return data.videos || [];
}
