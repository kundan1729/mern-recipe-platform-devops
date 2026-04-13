const GENERATE_RECIPE_URL = '/api/recipes/generate';

export async function generateRecipe(ingredients) {
  const response = await fetch(GENERATE_RECIPE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate recipe');
  }

  return data.recipe;
}
