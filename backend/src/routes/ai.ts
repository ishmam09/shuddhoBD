import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/analyze-project', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            res.status(500).json({ error: "GEMINI_API_KEY is not configured in backend/.env" });
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });






        
        const { project } = req.body;

        if (!project) {
            res.status(400).json({ error: "Project data is required" });
            return;
        }

        const prompt = `You are an AI Civic Transparency Analyst working for a government accountability platform.
Your job is to analyze development projects and citizen reports to detect potential corruption risks, inefficiencies, or anomalies.

Here is the structured data for a project:
${JSON.stringify(project, null, 2)}

Your responsibilities:
1. Evaluate the risk level of the project: LOW RISK / MEDIUM RISK / HIGH RISK
2. Provide a clear explanation in simple, human-readable language (2-5 sentences explaining reasoning clearly).
3. Identify suspicious patterns in bullet points.
4. Provide a recommendation.

Output format (STRICT):
Risk Level: <LOW / MEDIUM / HIGH>

Explanation: 
<2–5 sentences explaining the reasoning clearly>

Key Indicators:
- <bullet points of evidence>

Recommendation: 
<short suggestion like "Requires audit review" or "Monitor progress closely">`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const output = response.text();

        // Parse the strict string output into a JSON object so frontend components don't break
        const lines = output.split('\n');

        let riskLevel = "MEDIUM";
        let explanation = "";
        let recommendation = "";
        let indicators: string[] = [];

        let currentSection = "";

        for (const line of lines) {
            if (line.startsWith("Risk Level:")) {
                riskLevel = line.replace("Risk Level:", "").replace("RISK", "").trim();
            } else if (line.startsWith("Explanation:")) {
                currentSection = "explanation";
            } else if (line.startsWith("Key Indicators:")) {
                currentSection = "indicators";
            } else if (line.startsWith("Recommendation:")) {
                currentSection = "recommendation";
                recommendation = line.replace("Recommendation:", "").trim();
            } else if (line.trim().length > 0) {
                if (currentSection === "explanation") {
                    explanation += line.trim() + " ";
                } else if (currentSection === "indicators") {
                    indicators.push(line.replace(/^-/, "").trim());
                } else if (currentSection === "recommendation") {
                    recommendation += " " + line.trim();
                }
            }
        }

        res.json({
            riskLevel,
            explanation: explanation.trim(),
            indicators: indicators,
            recommendation: recommendation.trim(),
            rawOutput: output
        });

    } catch (error: any) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze project via AI" });
    }
});

export default router;

