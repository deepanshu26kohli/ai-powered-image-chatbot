const apiKey = process.env.GEMINI_API_KEY; // Ensure your API key is set

// Function to list available models
async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to list models: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(data.models); // Log the available models
    return data.models;
  } catch (error) {
    console.error("Error listing models:", error.message);
    throw error;
  }
}

// Function to generate content (equivalent to askGemini)
export async function askGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating content:", error.message);
    throw error;
  }
}

// Call listModels to check available models
listModels().catch(console.error);