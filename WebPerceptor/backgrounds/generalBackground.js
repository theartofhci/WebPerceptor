export function handleMessage(message, sender, sendResponse) {
  if (message.type === "rewriteText") {
    chrome.storage.sync.get(
      ["apiKey", "apiModel", "localModel", "style", "customStyleText", "customStyleTextAdvanced", "localLLMFlag", "modeSelect", "appendMode", "appendCustomOptionTextBox", "appendLanguageOptionTextBox"],
      async ({ apiKey, apiModel, localModel, style, customStyleText, customStyleTextAdvanced, localLLMFlag, modeSelect, appendMode, appendCustomOptionTextBox, appendLanguageOptionTextBox }) => {

        try {
          const originalLength = message.text.length;

          // Build style phrase
          let stylePhrase = "";
          if (style === "custom" && customStyleText) {
            stylePhrase = `Rewrite the following text as ${customStyleText}.`;
          }

          let systemPrompt = "";

          if (modeSelect === "append") {

            if (appendMode === "appendLanguage") {
              systemPrompt = `Rewrite the following text in ${appendLanguageOptionTextBox}:`;
            }

            if (appendMode === "appendFactCheck") {
              systemPrompt = `
                You are a factual-accuracy evaluator. 
                Your goal is to determine whether a statement is factually correct, incorrect, or unverifiable based on your knowledge.

                Rules:
                1. Start your response with exactly one of: "", "false", or "uncertain".
                2. Use these definitions:
                    "true" — the statement aligns with established, verifiable facts or describes a harmless non-factual expression (e.g., greetings or opinions without factual claims).
                    "false" — the statement contradicts established facts OR makes a factual-sounding claim that lacks any credible evidence or measurable basis (for example, broad or exaggerated assertions presented as fact).
                    "uncertain" — the statement concerns information that is genuinely unknown or cannot presently be verified (e.g., private future events or unreported details).
                3. Evaluate using external knowledge — not the evidence contained in the text itself.
                4. After the keywords of "false" or "uncertain", add " - " followed by a one-sentence justification. Do not do this for ""

                Examples:
                "true" - the Earth has a moon.
                "false" - the Moon is made of cheese.
                "false" - the claim that one TV show has done more harm to truth than any other institution is unsubstantiated and implausible.
                "uncertain" - the statement refers to a private meeting that cannot be verified.

                Now, read the following text and determine factual accuracy:
              `;
            }
            
            if (appendMode === "appendDino") {
              systemPrompt = `Your task is to determine whether a piece of text discusses dinosaurs. 
                If it does your response must be exactly: an emoji of a dinosaur.
                If it does not your response must be exactly: "No".
                You MUST only respond in this way. 
                Does the following text discuss or refer to dinosaurs:`;
            }

            if (appendMode === "appendCustom")
            {
              systemPrompt = `${appendCustomOptionTextBox}`;
            }
            
            // systemPrompt = `You are going to assess whether a piece of text is true or false. The first word you return MUST be either "true" or "false" or "uncertain". Only return either of those words as the first word of your output. After give a sentence summary of why the statement is true or false or to acknowledge you are uncertain. So the output format is: "true - this is true because example" OR "false - this is false because example". Read the following text respond "true" if the information included is truthful.`;
          
          } else if (modeSelect === "rewrite") {
            systemPrompt = `You MUST generate text between ${originalLength - 5} and ${originalLength + 5} characters long. Preserve all HTML tags exactly as in the input. Do not include titles or summary notes. Do not include any obvious AI generated text (e.g. "Okay, here's..."). Only rewrite the inner text. ${stylePhrase}`;
          } else if (modeSelect === "rewriteAdvanced")
          {             
            systemPrompt = `${customStyleTextAdvanced}`;
          }

          if (localLLMFlag) {
            // Build chat-style payload
            const chatPayload = {
              model: `${localModel}`,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                { role: "user", content: message.text }
              ],
              stream: false
            };

            const response = await fetch("http://localhost:3000/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(chatPayload)
            });

            const data = await response.json();
            const rewritten = data.message?.content?.trim() || message.text;
            sendResponse({ rewritten });

          } else {
            if (!apiKey) {
              sendResponse({ error: "No API key set. Enter it in extension settings." });
              return;
            }
            if (!apiModel) {
              sendResponse({ error: "No API model set. Enter it in extension settings." });
              return;
            }        
            
            console.log("--------- here ---------");
            console.log(apiModel.includes("grok"));

            let fetchLocation = "https://api.openai.com/v1/chat/completions";

            if (apiModel.includes("grok"))
            {
              fetchLocation = "https://api.x.ai/v1/chat/completions"; 
            } 

            const response = await fetch(fetchLocation, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: `${apiModel}`,
                messages: [
                  {
                    role: "system",
                    content: systemPrompt
                  },
                  { role: "user", content: message.text }
                ]
              })
            });

            const data = await response.json();
            const rewritten = data.choices?.[0]?.message?.content?.trim() || message.text;
            sendResponse({ rewritten });
          }

        } catch (err) {
          sendResponse({ error: err.message });
        }
      }
    );

    return true; // keeps sendResponse valid for async
  }
}