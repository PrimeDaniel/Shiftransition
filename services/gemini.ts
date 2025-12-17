import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio } from "../types";

// Helper to clean base64 string
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

/**
 * Analyzes two images to generate a transition prompt using Gemini 3 Pro.
 */
export const generateTransitionPrompt = async (
  startImage: ImageFile,
  endImage: ImageFile
): Promise<string> => {
  // Ensure we have a key (though the UI should prevent this call if not)
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze these two images. The first image is the starting frame, and the second image is the ending frame of a video.
    
    I need a creative prompt for a video generation model (Veo) to create a seamless transition between them.
    
    Task:
    1. Identify the common visual elements, lighting, and "vibe" of both images.
    2. Describe a cool camera movement (e.g., dolly in, pan right, morph, rack focus, hyperlapse) that would naturally bridge the two scenes.
    3. Output a SINGLE, concise descriptive sentence that focuses ONLY on the visual movement and transition style. Do not include introductory text like "Here is a prompt".
    
    Example output: "A cinematic slow dolly zoom moving from a sunny forest clearing into a futuristic neon cityscape, seamlessly blending the lighting changes."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: startImage.mimeType,
              data: cleanBase64(startImage.base64),
            },
          },
          {
            inlineData: {
              mimeType: endImage.mimeType,
              data: cleanBase64(endImage.base64),
            },
          },
        ],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");
    return text.trim();
  } catch (error) {
    console.error("Error analyzing images:", error);
    throw new Error("Failed to analyze images for transition style.");
  }
};

/**
 * Generates a video using Veo 3.1 Fast, using a start image and an end image (lastFrame).
 */
export const generateVeoVideo = async (
  prompt: string,
  startImage: ImageFile,
  endImage: ImageFile,
  aspectRatio: AspectRatio
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  // Always create a new instance to ensure we capture the latest selected key if changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    console.log("Starting video generation with prompt:", prompt);
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64(startImage.base64),
        mimeType: startImage.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
        lastFrame: {
          imageBytes: cleanBase64(endImage.base64),
          mimeType: endImage.mimeType,
        },
      },
    });

    console.log("Video operation started:", operation);

    // Polling loop
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Polling video status...", operation.metadata);
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from Veo.");
    }

    // Fetch the actual video bytes using the API key
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error("Failed to download video bytes.");
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};
