const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2
const cors = require("cors");

const app = express();
const PORT = 3000; // Node proxy port

app.use(cors()); // Allow all origins (your Chrome extension)
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Stream or NDJSON response from Ollama
    const text = await response.text();

    res.send(text); // Just forward raw response to extension
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Node proxy running on http://localhost:${PORT}`);
});
