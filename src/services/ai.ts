export async function translate(text: string) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  const response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator. Detect the source language automatically. Translate naturally into Simplified Chinese if the input is not Chinese. If the input is Chinese, translate it into English. Return only the translation without explanations.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Translation failed");
  }

  const data = await response.json();

  return data.choices[0].message.content.trim();
}