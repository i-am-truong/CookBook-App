// Pexels API Service
import { PEXELS_API_KEY as ENV_PEXELS_KEY } from "@env";

// Use environment variable if available, otherwise fallback to hardcoded key
const PEXELS_API_KEY =
  ENV_PEXELS_KEY || "IFUz9ISXGsOzmfc5TPd4tBEtN3KROkSbXPmHkNqcgJKdwkCwH80FgTWk";

class PexelsService {
  constructor() {
    this.baseUrl = "https://api.pexels.com/v1";
  }

  async searchFoodImage(query, perPage = 5) {
    try {
      const foodQuery = query + " food dish cooking recipe";
      const url =
        this.baseUrl +
        "/search?query=" +
        encodeURIComponent(foodQuery) +
        "&per_page=" +
        perPage +
        "&orientation=landscape";

      const response = await fetch(url, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!response.ok) {
        console.error("Pexels API Error:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        // Try to find photo without people (based on alt text)
        for (let photo of data.photos) {
          const alt = (photo.alt || "").toLowerCase();
          // Skip photos with people-related keywords
          if (
            !alt.includes("woman") &&
            !alt.includes("man") &&
            !alt.includes("person") &&
            !alt.includes("people") &&
            !alt.includes("girl") &&
            !alt.includes("boy") &&
            !alt.includes("eating") &&
            !alt.includes("holding")
          ) {
            return photo.src.large;
          }
        }
        // If all photos have people, return the first one anyway
        return data.photos[0].src.large;
      }

      return null;
    } catch (error) {
      console.error("Error fetching image from Pexels:", error);
      return null;
    }
  }

  async searchByIngredients(ingredients) {
    try {
      // Get first 3 main ingredients
      const mainIngredients = ingredients.slice(0, 3).join(" ");
      const foodQuery = mainIngredients + " dish food cooking";
      const url =
        this.baseUrl +
        "/search?query=" +
        encodeURIComponent(foodQuery) +
        "&per_page=5&orientation=landscape";

      const response = await fetch(url, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!response.ok) {
        console.error("Pexels API Error:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        // Filter out photos with people
        for (let photo of data.photos) {
          const alt = (photo.alt || "").toLowerCase();
          if (
            !alt.includes("woman") &&
            !alt.includes("man") &&
            !alt.includes("person") &&
            !alt.includes("people") &&
            !alt.includes("girl") &&
            !alt.includes("boy") &&
            !alt.includes("eating") &&
            !alt.includes("holding")
          ) {
            return photo.src.large;
          }
        }
        return data.photos[0].src.large;
      }

      return null;
    } catch (error) {
      console.error("Error fetching image from Pexels:", error);
      return null;
    }
  }

  getFallbackImage() {
    return "https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Delicious+Food";
  }
}

export default new PexelsService();
