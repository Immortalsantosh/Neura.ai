import axios from "axios"

// Helper function to clean markdown-style code fences
function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\s*/gi, "") // remove ```json
    .replace(/```/g, "") // remove ```
    .trim();
}

interface GeminiResponseData {
  type: string;
  userInput: string;
  response: string;
}

const geminiResponse = async (
  command: string,
  assistantName: string,
  userName: string
): Promise<GeminiResponseData | undefined> => {
  try {
    const apiUrl = process.env.GEMINI_API_URL as string
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke. Only remove your assistant name from userInput if it exists. If someone asks to search on google or youtube, userInput should only contain the search text.
- "response": A short voice-friendly reply in English or Hindi, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. If someone asks a question that you know the answer to, also categorize it as general and give a short answer.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open instagram.
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} if someone asks who created you.
- Only respond with the JSON object, nothing else.
- Do not include any markdown formatting or code blocks.
- Return pure JSON only.

User input: ${command}
`;

    const result = await axios.post(apiUrl, {
      "contents": [{
        "parts": [{ "text": prompt }]
      }]
    })
    
    let responseText = result.data.candidates[0].content.parts[0].text
    
    // Clean the response to remove markdown code fences
    responseText = cleanJsonResponse(responseText)
    
    // Parse JSON and return as object
    const parsedResponse: GeminiResponseData = JSON.parse(responseText)
    
    return parsedResponse
  } catch (error) {
    console.log("Gemini response error:", error)
    return undefined
  }
}

export default geminiResponse