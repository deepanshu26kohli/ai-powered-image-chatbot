import { NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromImage(buffer);

    // Save session in Supabase
    const { data, error } = await supabase
      .from("user_sessions")
      .insert([{ ocr_text: text }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ sessionId: data.id, ocrText: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
