<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LpHx-pkZBwQnf11R4d_KiZGPhrDwfyPw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Local Ollama (optional)

If you run an Ollama server locally and want the app to use it instead of Gemini, enable the env toggle in `.env.local`:

- `VITE_USE_OLLAMA=true`
- `VITE_OLLAMA_URL=http://localhost:11434` (default)

Quick manual tests (replace `<model-name>` with your model):

- PowerShell (Invoke-RestMethod):
```powershell
$body = @{ model = "<model-name>"; prompt = "Hello from Ollama" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -ContentType "application/json" -Body $body
```

- curl.exe (Windows):
```powershell
curl.exe -s -X POST "http://localhost:11434/api/generate" `
   -H "Content-Type: application/json" `
   -d '{"model":"<model-name>","prompt":"Hello from Ollama"}'
```

- Node (quick one-liner, Node >=18):
```bash
node -e "fetch('http://localhost:11434/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'<model-name>',prompt:'Hello from Ollama'})}).then(r=>r.json()).then(console.log).catch(console.error)"
```

The app will route AI requests to Ollama when `VITE_USE_OLLAMA=true`; otherwise it falls back to Gemini.
