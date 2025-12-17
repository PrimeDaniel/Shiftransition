import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio, TransitionStyleId } from "../types";

const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const STYLE_PROMPTS: Record<TransitionStyleId, string> = {
  MORPH: "Create a seamless ethereal morph where the first image fluidly transforms its geometry and textures into the second image.",
  WHIP_PAN: "Use a high-speed cinematic whip pan effect, blurring the camera horizontally to transition with high kinetic energy.",
  VERTIGO: "Execute a dramatic dolly zoom (Vertigo effect) where the background compresses or expands while transitioning to the second scene.",
  SUBJECT_FLOW: "Focus on the movement of the primary subject; if a person is moving in the first, continue that trajectory seamlessly into the environment of the second.",
  VORTEX: "A dynamic spiral zoom and rotation that pulls the viewer into the center of the first image and spins out into the second.",
  DISSOLVE: "A graceful atmospheric cross-dissolve focusing on matching the lighting and color palettes between the two scenes."
};

export const generateTransitionPrompt = async (
  startImage: ImageFile,
  endImage: ImageFile,
  styleId: TransitionStyleId
): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleInstruction = STYLE_PROMPTS[styleId];

  const prompt = `
    Analyze these two images (start and end frames). 
    Your task is to write a single-sentence cinematic prompt for the Veo video model.
    
    Constraint: You MUST use this transition style: ${styleInstruction}
    
    Combine the specific visual details (lighting, subjects, colors) of these two images with the requested transition style.
    
    Output ONLY the final descriptive sentence.
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

    return response.text?.trim() || "A cinematic transition between two scenes.";
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to design the transition. Please try a different style.");
  }
};

export const generateVeoVideo = async (
  prompt: string,
  startImage: ImageFile,
  endImage: ImageFile,
  aspectRatio: AspectRatio
): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
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

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) throw new Error(operation.error.message);

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video URI missing.");

    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};