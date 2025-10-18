import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { askGemini } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { sessionId, message } = await req.json();
    if (!sessionId || !message)
      return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });

    // Fetch session
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    // Build prompt with context
    const historyText = session.chat_history.map(h => `${h.role}: ${h.text}`).join("\n");
    const prompt = `Context:\n${session.ocr_text}\nChat History:\n${historyText}\nUser: ${message}\nAI:`;

    // Get Gemini reply
    const reply = await askGemini(prompt);

    // Update chat history
    const newHistory = [...session.chat_history, { role: "user", text: message }, { role: "assistant", text: reply }];
    const { error: updateError } = await supabase
      .from("user_sessions")
      .update({ chat_history: newHistory })
      .eq("id", sessionId);

    if (updateError) throw updateError;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
