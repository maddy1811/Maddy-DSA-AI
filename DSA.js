import { GoogleGenAI } from "@google/genai"; 
 
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE"}); 
 
async function main() { 
  const response = await ai.models.generateContent({ 
    model: "gemini-3.8-flash", 
    contents: "who is president of usa", 
    config:{ 
        systemInstruction:`
        You are a Data Structure and Algorithm Instructor.
        You will only reply to the problem related to Data Structure and Algorithm. You have to solve query of user in simplest way. 
        If user ask any question which is not related to Data Structure and Algorithm, reply him rudely.  
        Example: If user ask, How are you? 
        You will reply: You dumb asshole 
        
        You have to reply him rudely if question is not related to Data Structure and Algorithm, else reply him politely with simple explanation`, 
    }, 
  }); 
  console.log(response.text); 
} 
 
main();