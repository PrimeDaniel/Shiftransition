import { GoogleGenAI } from "@google/genai";
import { ImageFile, AspectRatio, TransitionStyleId } from "../types";

const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const STYLE_PROMPTS: Record<TransitionStyleId, string> = {
  FLY_FLOW: "Execute an advanced 3D drone-style camera fly-through. The camera should physically navigate through the depth of the first scene, pushing past foreground elements to emerge seamlessly into the heart of the second scene, maintaining consistent spatial momentum.",
  SUBJECT_MIGRATE: "Focus on the primary subject or person. As they move through the first frame, their physical form and the environment around them should seamlessly evolve and morph into the subject and setting of the second frame, keeping the character's movement path perfectly aligned.",
  PORTAL_WARP: "Create a dimensional portal effect. The center of the first image should fold inward spatially, revealing the second image as a 3D volume that expands to fill the screen, creating a feeling of traveling through a wormhole between locations.",
  HYPERLAPSE: "Use a cinematic hyperlapse transition. The camera moves rapidly forward while the lighting and atmosphere of the first scene accelerate and transform over 'time' into the lighting conditions and weather of the second scene.",
  GEOMETRIC_RECON: "The architecture and objects of the first image should physically break apart into geometric fragments and reassemble themselves in 3D space to construct the buildings and structures of the second image.",
  OBJECT_TRACE: "Identify a dominant object or shape trajectory. The camera follows this object's physical arc or path with a tight tracking shot, using its motion to bridge the gap into the new environment of the second scene."
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
    
    Constraint: You MUST use this advanced AI transition style: ${styleInstruction}
    
    Bridge the visual logic, depth, and texture of these two images. Avoid simple blurs, fades, or spins. 
    Describe a physically grounded, high-end cinematic movement that leverages the 3D understanding of the scene.
    
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

    return response.text?.trim() || "A cinematic spatial transition between two scenes.";
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