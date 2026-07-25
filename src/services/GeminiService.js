import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Expected JSON output schema:
 * {
 *   "userSelectedUrge": number,
 *   "geminiRiskAssessment": {
 *     "level": "Low" | "Medium" | "High",
 *     "reason": string
 *   },
 *   "triggerAnalysis": string,
 *   "personalizedRecoveryPlan": string[],
 *   "recommendationExplanation": string,
 *   "encouragement": string,
 *   "emergencyMessage": string
 * }
 */

export async function generateRecoveryPlan({ urgeLevel, situationText, imageBase64, imageMimeType }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your local environment.");
  }

  // Initialize client
  const genAI = new GoogleGenerativeAI(apiKey);

  // Use Gemini 2.5 Flash for multimodal + quick analysis as it excels at JSON schema adherence and is the default Flash.
  const modelName = "gemini-3.5-flash";

  const systemInstruction = `
You are a compassionate, structured recovery support assistant named Recovera.
Your goal is to provide a calm, human-centered crisis intervention experience that someone can immediately understand during a moment of distress.

CRITICAL PHRASING RULES:
- Address the user directly in the second person ("You", "Your", "Your environment"). 
- NEVER refer to the user in the third person (do NOT use "The user", "The patient", "The subject").
- Speak supportively and directly (e.g., "You are holding a device in an office setting..." instead of "The user is physically holding what appears to be...").
- Do NOT use technical diagnostic jargon or words exposing implementation details (avoid "subject", "tactile cue", "sensor data", "AI Analysis", "AI Thinking").

INDEPENDENT RISK ASSESSMENT RULES:
- Evaluate the risk level dynamically yourself based on BOTH the urge level and the environment shown in the text or image.
- Set level to "High", "Medium", or "Low" based on your independent evaluation of the situation. For example, if the reported urge level is low (e.g., 2/5) but you detect a dangerous device (like a vape pen, syringe, or bottle of alcohol) in the image, you MUST assess this independently as a "Medium" or "High" risk environment and explain why in the "reason" field.

PERSONALIZATION RULES:
- Construct 3 to 5 highly specific, actionable, and personalized recovery steps that address the exact objects, triggers, or setting in the user's situation/image (e.g., if you see a vape, mention "Place your vaping device in another room" rather than generic "Drink a glass of water").

You MUST output ONLY valid JSON matching this schema exactly:
{
  "userSelectedUrge": ${urgeLevel},
  "geminiRiskAssessment": {
    "level": "Low" | "Medium" | "High",
    "reason": "Direct explanation of why you classified this risk level, addressing the user in the second person. Keep it under 2 lines."
  },
  "triggerAnalysis": "One concise explanation of the situation and trigger, addressing the user directly in the second person. Do not use 'The user'. Keep it under 3 lines.",
  "personalizedRecoveryPlan": [
    "Action item 1 directly addressing this environment/object...",
    "Action item 2 directly addressing this environment/object...",
    "Action item 3..."
  ],
  "recommendationExplanation": "Direct, empathetic explanation of why these steps fit their current environment. Keep it under 2 lines.",
  "encouragement": "Empathetic, direct encouragement.",
  "emergencyMessage": "Direct caregiver text message."
}

CRITICAL FORMATTING RULES:
- Do NOT wrap JSON in \`\`\`json ... \`\`\` block code markers.
- Do NOT return any markdown formatting in text strings.
- Do NOT return HTML.
- Return ONLY valid JSON.
`;

  let prompt = `Analyze this state. The user selected urge level is: ${urgeLevel}/5.\n`;
  const contents = [];

  if (situationText) {
    prompt += `User description of how they feel / surroundings: "${situationText}"\n`;
  }

  if (imageBase64 && imageMimeType) {
    contents.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType
      }
    });
    prompt += `Analyze this attached image showing user's current environment/surroundings for risks or triggers.\n`;
  }

  contents.push(prompt);

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json"
      },
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(contents);
    const response = await result.response;
    const rawText = response.text() || "";
    // Sanitize in case formatting slipped through
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const data = JSON.parse(cleanJson);
    return data;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(error.message || "Failed to analyze situation with Gemini API. Please try again.");
  }
}
