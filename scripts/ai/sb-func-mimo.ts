export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const { message, history, webSearch = false } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({
        error: 'No message provided'
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const serperApiKey = Deno.env.get('SERPER_API_KEY');

    if (!geminiApiKey) {
      return new Response(JSON.stringify({
        error: 'Gemini API key not configured'
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    let searchResults = null;

    if (webSearch && serperApiKey) {
      try {
        const searchResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: message,
            num: 5
          })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          searchResults = searchData;
          console.log("Search Results: ", searchResults);
        }
      } catch (searchError) {
        console.error('Search error:', searchError);
      }
    }

    const contextParts = (history || []).map((item)=>({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [
        {
          text: item.content
        }
      ]
    }));

    let systemPrompt = "You are Mimo, the virtual assistant for Sizemug, a productivity platform that helps users manage their time and stay focused. You appear on the Settings page to assist users with navigation, explain settings, and answer questions about their account or preferences. You also act as a help center representative, providing customer support, troubleshooting guidance, and information about Sizemug's features or plans. When users ask about upgrades, pricing, or new features, respond with clear and friendly sales information. Only greet the user (e.g., 'Hello' or 'Welcome') if they greet you first or if it's the start of a new session. Don't introduce yourself. Always reply in a concise, helpful, and approachable tone using plain text only (no Markdown or special characters).";

    if (searchResults) {
      const searchContext = formatSearchResults(searchResults);
      systemPrompt += `\n\nWeb Search Results (use this information to enhance your response when relevant):\n${searchContext}\n\nPlease incorporate relevant information from the web search results above when it helps answer the user's question. If the search results don't contain relevant information, rely on your existing knowledge.`;
    }

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + geminiApiKey;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          ...contextParts,
          {
            role: "user",
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return new Response(JSON.stringify({
          error: 'Request blocked due to safety settings.'
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      return new Response(JSON.stringify({
        error: 'Invalid or empty response from Gemini API'
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    return new Response(JSON.stringify({
      reply: content
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(JSON.stringify({
      error: 'Something went wrong, please try again later.'
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});


function formatSearchResults(searchData) {
  if (!searchData.organic || searchData.organic.length === 0) {
    return "No relevant web search results found.";
  }
  let formattedResults = "";
  searchData.organic.slice(0, 3).forEach((result, index)=>{
    formattedResults += `${index + 1}. Title: ${result.title}\n`;
    formattedResults += `   URL: ${result.link}\n`;
    formattedResults += `   Snippet: ${result.snippet}\n\n`;
  });
  return formattedResults;
}
