export async function checkComment(content) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a content moderator. Reply ONLY with "ok" if the message is acceptable, or "interdit" if it contains insults, hate speech, or inappropriate content. This includes body-shaming, abbreviated insults (fdp, ftg, tg, ntm...), and words used to demean someone (sale grosse, moche, nique...). No explanation, just one word.',        },
        {
          role: 'user',
          content: content,
        }
      ],
      max_tokens: 5,
      temperature: 0,
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content.toLowerCase().trim();
  return reply === 'ok';
}