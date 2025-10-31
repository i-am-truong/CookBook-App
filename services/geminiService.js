import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY as ENV_GEMINI_KEY } from "@env";

// Use environment variable if available, otherwise fallback to hardcoded key
const GEMINI_API_KEY =
  ENV_GEMINI_KEY || "AIzaSyAIj82sRMfVJPkNSWfkyh1AWiOd4kt91PI";

class GeminiService {
  constructor() {
    try {
      this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      this.modelConfig = {
        model: "gemini-2.5-flash",
        config: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      };
      console.log("Gemini Service initialized successfully");
    } catch (error) {
      console.error("Gemini Service initialization error:", error);
    }
  }

  async generateRecipe(userInput) {
    try {
      console.log("Calling Gemini API...");
      const prompt = this.buildPrompt(userInput);
      const response = await this.ai.models.generateContent({
        ...this.modelConfig,
        contents: prompt,
      });
      const text = response.text;
      const recipe = this.parseRecipeResponse(text);
      return { success: true, recipe: recipe };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate recipe",
      };
    }
  }

  buildPrompt(userInput) {
    const {
      ingredients,
      category,
      servings,
      maxCalories,
      cookingTime,
      dietPreference,
    } = userInput;
    const dietLine = dietPreference ? `Chế độ ăn: ${dietPreference}` : "";
    return `Bạn là đầu bếp chuyên nghiệp. Tạo công thức nấu ăn với:
Nguyên liệu: ${ingredients.join(", ")}
Loại món: ${category}
Số người: ${servings}
Calories tối đa: ${maxCalories}/khẩu phần
Thời gian: ${cookingTime}
${dietLine}

Trả về JSON (không thêm markdown):
{"name":"Tên món","category":"${category}","description":"Mô tả","calories":400,"cookingTime":"30 phút","servings":${servings},"ingredients":[{"name":"Nguyên liệu","amount":"Số lượng"}],"instructions":["Bước 1","Bước 2"],"tips":"Mẹo","nutritionInfo":{"protein":"Xg","carbs":"Xg","fat":"Xg"}}`;
  }

  parseRecipeResponse(text) {
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText
          .replace(/```json\n?/g, "")
          .replace(/```\n?$/g, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/```\n?/g, "");
      }
      const recipe = JSON.parse(cleanText.trim());
      if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
        throw new Error("Invalid recipe format");
      }
      return recipe;
    } catch (error) {
      console.error("Parse Error:", error);
      throw new Error("Không thể phân tích công thức từ AI. Vui lòng thử lại.");
    }
  }

  async suggestIngredients(partialIngredients) {
    try {
      const prompt = `Gợi ý 5 nguyên liệu kết hợp với: ${partialIngredients.join(
        ", "
      )}. Trả về JSON: ["item1","item2","item3","item4","item5"]`;
      const response = await this.ai.models.generateContent({
        ...this.modelConfig,
        contents: prompt,
      });
      const text = response.text;
      let cleanText = text
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?$/g, "");
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Suggestion Error:", error);
      return [];
    }
  }
}

export default new GeminiService();
