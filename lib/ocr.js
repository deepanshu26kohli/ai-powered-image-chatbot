import axios from "axios";

export async function extractTextFromImage(imageBuffer) {
  const base64 = imageBuffer.toString("base64");

  const formData = new FormData();
  formData.append("apikey", process.env.OCR_SPACE_KEY);
  formData.append("base64Image", `data:image/png;base64,${base64}`);

  const res = await axios.post("https://api.ocr.space/parse/image", formData);
  const parsed = res.data.ParsedResults?.[0]?.ParsedText || "";

  return parsed.trim();
}
