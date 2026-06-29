import { Router, Response, Request } from "express";
import { ChatSession, IMessage } from "../models/ChatSession.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { Reading } from "../models/Reading.js";

const router = Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    const parts = timeStr.trim().split(" ");
    const timePart = parts[0]; // e.g. "09:42"
    const ampm = parts[1]?.toLowerCase(); // e.g. "pm"
    
    let [hours, minutes] = timePart.split(":").map(Number);
    if (ampm === "pm" && hours !== 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
    
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return new Date(`${dateStr}T${hh}:${mm}:00`);
  } catch (e) {
    return new Date(dateStr);
  }
};

// Rule-based fallback response generator
const getLatestReadingEvaluation = (recentReadings: any[]) => {
  if (!recentReadings || recentReadings.length === 0) {
    return {
      text: "I noticed you haven't logged any glucose readings yet. Please log your blood glucose in the Tracker page so I can provide customized clinical advice!",
      status: "unknown",
      value: 0
    };
  }
  const latest = recentReadings[0];
  const val = latest.value;
  let status: "low" | "normal" | "high" = "normal";
  let evalText = "";
  if (val < 70) {
    status = "low";
    evalText = "low (hypoglycemia)";
  } else if (val > 130) {
    status = "high";
    evalText = "high (hyperglycemia)";
  } else {
    status = "normal";
    evalText = "in the normal range";
  }
  return {
    text: `Based on your recent logging history, your latest glucose reading was **${val} mg/dL** (logged on ${latest.date} at ${latest.time} - ${latest.meal}). This is **${evalText}**.`,
    status,
    value: val
  };
};

const getFallbackAIResponse = (question: string, recentReadings: any[] = []): string => {
  const q = question.toLowerCase();
  const evaluation = getLatestReadingEvaluation(recentReadings);
  
  // Custom CAN / CANNOT bullet points based on status
  let personalizedDos = "";
  let personalizedDonts = "";
  
  if (evaluation.status === "low") {
    personalizedDos = 
      "• **Consume fast-acting sugar**: Take 15g of simple carbs immediately (e.g. 4 oz fruit juice, regular soda, or 3-4 glucose tablets).\n" +
      "• **Rest & Recheck**: Sit down, wait 15 minutes, and re-test your level.\n" +
      "• **Eat complex snacks**: Once glucose is above 70 mg/dL, eat a small snack with protein and complex carbs (e.g., crackers with cheese, or a handful of nuts) to stabilize it.";
    personalizedDonts = 
      "• **Do NOT skip meals** or wait for hours before eating.\n" +
      "• **Do NOT inject extra fast-acting insulin** without checking your medical guidelines.\n" +
      "• **Do NOT start strenuous exercise** right now, as physical activity lowers glucose further and increases risk of passing out.";
  } else if (evaluation.status === "high") {
    personalizedDos = 
      "• **Hydrate heavily**: Drink plenty of water to help your kidneys flush out excess sugar.\n" +
      "• **Light walking**: Take a relaxed 15-minute walk. Light muscle activity helps absorb blood glucose.\n" +
      "• **Check Ketones**: If glucose is extremely high (above 250 mg/dL), check for ketones and monitor symptoms like confusion or nausea.";
    personalizedDonts = 
      "• **Do NOT eat simple carbohydrates or high-glycemic foods** (avoid white rice, potatoes, sugary beverages, juices, or sweets).\n" +
      "• **Do NOT run or lift heavy weights** immediately, as high-intensity workouts can stress the body and temporarily drive glucose levels even higher.";
  } else {
    // Normal range
    personalizedDos = 
      "• **Maintain consistency**: Keep up your current healthy meal plans and light physical routine.\n" +
      "• **Prioritize water**: Continue choosing water over sweetened drinks.\n" +
      "• **Log your logs**: Keep recording values regularly to capture your daily pattern.";
    personalizedDonts = 
      "• **Do NOT go long periods without food**, as maintaining consistent intervals prevents blood sugar drops.\n" +
      "• **Do NOT overconsume carbohydrates** or high-sugar treats simply because your current level is balanced.";
  }

  let responseBody = "";
  
  if (q.includes("eat") || q.includes("food") || q.includes("lunch") || q.includes("dinner") || q.includes("diet")) {
    responseBody = `### Diet & Nutrition Advice\nGiven your glucose level is **${evaluation.status}**, here are meal guidelines:\n\n` +
      `**What you CAN do:**\n${personalizedDos}\n` +
      `• Focus on lean proteins (grilled chicken, fish, tofu) and non-starchy vegetables.\n` +
      `• Choose fiber-rich, low-GI foods like leafy greens, broccoli, oats, or chia seeds.\n\n` +
      `**What you CANNOT do:**\n${personalizedDonts}\n` +
      `• Do not consume processed snacks, white bread, pastries, or sweet sodas.`;
  } else if (q.includes("exercise") || q.includes("workout") || q.includes("activity") || q.includes("walk")) {
    responseBody = `### Physical Exercise Guidelines\nHere is how to manage physical movement at your glucose level:\n\n` +
      `**What you CAN do:**\n${personalizedDos}\n` +
      `• Brisk walking for 15-20 minutes after meals is highly recommended to lower post-meal spikes.\n\n` +
      `**What you CANNOT do:**\n${personalizedDonts}\n` +
      `• Do not execute intense workouts without checking your blood sugar levels and ensuring it is safe.`;
  } else {
    // General evaluation question
    responseBody = `### Health & Activity Advice\nHere are recommendations based on your logs:\n\n` +
      `**Action Steps (What you CAN do):**\n${personalizedDos}\n\n` +
      `**Precautions (What you CANNOT do):**\n${personalizedDonts}`;
  }

  return `${evaluation.text}\n\n${responseBody}\n\n*Critical Warning: Always confirm medical choices with your doctor or call 911 in case of emergency.*`;
};

// 1. Get user's chat sessions (for the sidebar)
router.get("/sessions", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await ChatSession.find({ userId: req.user?.id })
      .select("title updatedAt createdAt")
      .sort({ updatedAt: -1 });

    if (sessions.length === 0) {
      res.status(200).json({ sessions: [], isMock: false });
      return;
    }

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Get chat sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Create a new chat session
router.post("/sessions", async (req: AuthRequest, res: Response): Promise<void> => {
  const { title } = req.body;

  try {
    const session = new ChatSession({
      userId: req.user?.id,
      title: title || "New Discussion",
      messages: [
        {
          text: "Hello! I'm your AI diabetes assistant. How can I help you today?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]
    });

    await session.save();

    res.status(201).json({ session });
  } catch (error) {
    console.error("Create chat session error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Get messages for a specific session
router.get("/sessions/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    if (id && id.startsWith("mock-session")) {
      const mockMsgs = [
        {
          text: "Hello! I'm your AI diabetes assistant. How can I help you today?",
          sender: "ai",
          timestamp: "10:00 AM"
        }
      ];
      res.status(200).json({ messages: mockMsgs });
      return;
    }

    const session = await ChatSession.findOne({ _id: id, userId: req.user?.id });
    if (!session) {
      res.status(404).json({ message: "Chat session not found" });
      return;
    }

    res.status(200).json({ messages: session.messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Send a message to the chatbot
router.post("/sessions/:id/message", async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ message: "Message text is required" });
    return;
  }

  try {
    let session;

    if (id === "new" || id.startsWith("mock-session")) {
      // Create a new session automatically
      session = new ChatSession({
        userId: req.user?.id,
        title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
        messages: []
      });
    } else {
      session = await ChatSession.findOne({ _id: id, userId: req.user?.id });
    }

    if (!session) {
      res.status(404).json({ message: "Chat session not found" });
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Add user message
    const userMsg: IMessage = {
      text,
      sender: "user",
      timestamp
    };
    session.messages.push(userMsg);

    // 2. Fetch AI response (Gemini API, Ollama Local Model, or Offline Fallback)
    let aiText = "";
    const provider = process.env.CHATBOT_PROVIDER || "gemini";

    // Retrieve user's recent blood sugar readings, sorted clinically by date/time
    const allReadings = await Reading.find({ userId: req.user?.id });
    const sortedReadings = [...allReadings].sort((a, b) => {
      return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
    });
    const recentReadings = sortedReadings.slice(0, 10);

    let readingsContext = "";
    if (recentReadings && recentReadings.length > 0) {
      readingsContext = recentReadings.map(r => 
        `- Date: ${r.date}, Time: ${r.time} (${r.timeOfDay}), Level: ${r.value} mg/dL, Meal: ${r.meal}`
      ).join("\n");
    } else {
      readingsContext = "No glucose readings have been logged yet by this user.";
    }

    const systemPrompt = `You are an empathetic, clinical health assistant specialized in diabetes support for the DiabeGuide platform.
Provide helpful, accurate, and highly structured advice about nutrition, exercises, and diabetes monitoring.

Here is the user's recent blood glucose data:
${readingsContext}

Core formatting and response instructions:
1. Always begin your response by referencing and displaying the user's latest blood sugar reading from the data provided (including the value, date, time, and meal type) so they can see it.
2. Evaluate if their current glucose level is low (hypoglycemia: <70 mg/dL), normal (70-130 mg/dL), or high (hyperglycemia: >130 mg/dL).
3. Customize all your diet, exercise, or medical advice based on this current glucose level. Give highly detailed bullet points detailing:
   - What they CAN do (e.g. eat fiber-rich vegetables, take a light walk, drink water).
   - What they CANNOT do (e.g. do not eat simple sugars, do not perform strenuous exercises if levels are low/high).
4. Always structure your answers using clear, descriptive bullet points to make them extremely readable.
5. Answer the user's query fully and constructively first, and then append the safety disclaimer.

Critical safety instruction: Always conclude your message with a brief note advising the user to verify medical steps with their doctor or call 911 in case of emergency.`;

    if (provider === "ollama") {
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
      const ollamaModel = process.env.OLLAMA_MODEL || "gemma2:2b";
      try {
        console.log(`[Chatbot] Querying local Ollama model "${ollamaModel}" at "${ollamaUrl}"`);
        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: text,
            system: systemPrompt,
            stream: false
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          aiText = data.response || "";
        } else {
          console.warn(`[Chatbot] Ollama returned status ${response.status}. Falling back.`);
          aiText = getFallbackAIResponse(text, recentReadings);
        }
      } catch (ollamaError) {
        console.error("[Chatbot] Ollama request failed:", ollamaError);
        aiText = getFallbackAIResponse(text, recentReadings);
      }
    } else {
      // Default to Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "your_gemini_api_key_here") {
        try {
          console.log(`[Chatbot] Querying Gemini model for prompt: "${text}"`);
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text }] }],
                systemInstruction: {
                  parts: [{ text: systemPrompt }]
                }
              })
            }
          );

          if (response.ok) {
            const data = (await response.json()) as any;
            aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
          
          if (!aiText) {
            console.warn("[Chatbot] Empty response from Gemini API, falling back.");
            aiText = getFallbackAIResponse(text, recentReadings);
          }
        } catch (geminiError) {
          console.error("[Chatbot] Gemini request failed:", geminiError);
          aiText = getFallbackAIResponse(text, recentReadings);
        }
      } else {
        console.log("[Chatbot] Gemini API Key not configured. Using local offline response.");
        aiText = getFallbackAIResponse(text, recentReadings);
      }
    }

    // 3. Add AI message
    const aiMsg: IMessage = {
      text: aiText,
      sender: "ai",
      timestamp
    };
    session.messages.push(aiMsg);

    // Update timestamp
    session.updatedAt = new Date();
    await session.save();

    res.status(200).json({
      message: "Message processed successfully",
      userMessage: userMsg,
      aiMessage: aiMsg,
      sessionId: session._id,
      sessionTitle: session.title
    });
  } catch (error) {
    console.error("Chatbot response error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
