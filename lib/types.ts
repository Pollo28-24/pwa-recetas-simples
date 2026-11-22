export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string | null;
  strArea: string | null;
};

export type Meal = MealSummary & {
  strInstructions: string;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  strCountry: string | null;
  strMealAlternate: string | null;
  strImageSource: string | null;
  strCreativeCommonsConfirmed: string | null;
  dateModified: string | null;
  [key: string]: unknown;
};

export type Ingredient = {
  name: string;
  measure: string;
};

export type CategoryInfo = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

export type IngredientInfo = {
  idIngredient: string;
  strIngredient: string;
  strDescription: string | null;
  strThumb: string | null;
  strType: string | null;
};

export type CatalogResult = {
  meals: MealSummary[];
  partial: boolean;
  failedLetters: string[];
};
