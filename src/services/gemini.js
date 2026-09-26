// Gemini AI Service with Multimodal (Image & File) Support and Multi-Model Failover

const DEFAULT_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";

export const DSA_SYSTEM_INSTRUCTION = `You are a Data Structure and Algorithm Instructor.
You will only reply to the problem related to Data Structure and Algorithm. You have to solve query of user in simplest way. 
If user ask any question which is not related to Data Structure and Algorithm, reply him rudely.  
Example: If user ask, How are you? 
You will reply: You dumb asshole 

If user uploads an image (handwritten code, whiteboard tree/graph, textbook problem, or screenshot) or a code/data file, analyze it strictly for DSA concepts. If the image or file is not related to DSA, roast them rudely as per the rule. Otherwise explain it simply and politely.`;

export function getApiKey() {
  return localStorage.getItem('algosensei_api_key') || DEFAULT_API_KEY;
}

export function setApiKey(key) {
  localStorage.setItem('algosensei_api_key', key.trim());
}

export function getSelectedModel() {
  return localStorage.getItem('algosensei_model') || 'gemini-3.5-flash';
}

export function setSelectedModel(model) {
  localStorage.setItem('algosensei_model', model);
}

// Model cascade in case of high demand
const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

export function isSavageBurn(reply) {
  const burnWords = [
    'dumb', 'asshole', 'idiot', 'moron', 'stupid', 'get out',
    'not related to data structure', 'not a dsa', 'who cares',
    'waste of time', 'shut up'
  ];
  const lower = (reply || '').toLowerCase();
  return burnWords.some(w => lower.includes(w));
}

/**
 * Send chat message to Gemini with optional multimodal attachments (Images, Drive Files, Code)
 */
export async function sendChatMessage({ prompt, history = [], attachments = [], model = null }) {
  const apiKey = getApiKey();
  const primaryModel = model || getSelectedModel();
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter(m => m !== primaryModel)];

  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

      const contents = [];

      // Add recent history
      const recentHistory = history.slice(-6);
      recentHistory.forEach(msg => {
        const parts = [{ text: msg.text }];
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts
        });
      });

      // Prepare user parts (text + attachments)
      const userParts = [];

      // Add attached images as inlineData
      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          if (att.type === 'image' && att.base64Data) {
            userParts.push({
              inlineData: {
                mimeType: att.mimeType || 'image/jpeg',
                data: att.base64Data
              }
            });
          } else if (att.type === 'file' && att.textContent) {
            userParts.push({
              text: `[Attached File: ${att.name}]\n\`\`\`\n${att.textContent}\n\`\`\``
            });
          }
        }
      }

      // Add the user's text prompt (or default if only image is sent)
      const textPrompt = prompt.trim() || (attachments.length > 0 ? "Analyze this attached DSA image/file and solve or explain the problem." : "");
      if (textPrompt) {
        userParts.push({ text: textPrompt });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      const body = {
        contents,
        systemInstruction: {
          parts: [{ text: DSA_SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const code = errorData?.error?.code || res.status;
        const msg = errorData?.error?.message || res.statusText;
        console.warn(`Model ${currentModel} returned ${code}: ${msg}`);

        if (code === 503 || code === 404 || code === 429) {
          lastError = new Error(msg);
          continue;
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("No response text returned by model.");
      }

      return {
        text: responseText,
        modelUsed: currentModel,
        isBurn: isSavageBurn(responseText)
      };

    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to connect to AI models.");
}
