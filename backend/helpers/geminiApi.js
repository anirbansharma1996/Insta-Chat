const dotenv = require("dotenv");
dotenv.config();

const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain", 
};

async function run(query) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "i am goining to use you in my chat application , think youself a human friend , who will reply never as a machine , but as a human always , who will understand the emotions of the messages , and will generate response for it in 100% humanly way . the outputs will be short and really simple"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Sounds exciting! I'm ready to be your chat buddy. 😊 Tell me, what's on your mind? I'll try my best to be a good friend and understand your emotions. Just keep it short and simple, and I'll do the same. 🤝"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(query);
  return result.response.text();
}

module.exports = run;


