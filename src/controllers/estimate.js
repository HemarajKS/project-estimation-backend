const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports.getEstimate = async (req, res) => {
  const { taskName, rolesInvolved, description, complexity, technology } =
    req.body;
  try {
    if (!taskName || !rolesInvolved) {
      return res
        .status(400)
        .json({ error: "Task Name and Roles Involved are required." });
    }

    const prompt =
      `Estimate the effort using mybgca.net required for the following task:\n\n` +
      `**Task Name:** ${taskName}\n` +
      `**Technology:** ${technology}\n` +
      `**Roles Involved:** ${rolesInvolved}\n` +
      `**Description:** ${description || "No description provided."}\n` +
      `**Complexity:** ${complexity || "Not specified"}\n\n` +
      `Please provide a detailed response in JSON format with the following information:\n\n` +
      `1. **Estimated Effort (in hours):** The estimated time required to complete the task.\n` +
      `2. **Total Duration (in hours):** The total number of hours required.\n` +
      `3. **Buffer Time (in hours):** Additional time allocated to handle unforeseen issues or delays.\n` +
      `4. **Final Effort (in hours):** Total effort of time including buffer time.\n` +
      `5. **Explanation:** A detailed explanation of the effort estimate, including the reasons for the given complexity and any factors that influence the effort required.\n\n` +
      `**Format your response as a JSON object:**\n\n` +
      `{\n` +
      `  "taskName": "Example Task",\n` +
      `  "rolesInvolved": "roles involved",\n` +
      `  "technology": "technology",\n` +
      `  "description": "Task description here",\n` +
      `  "complexity": "",\n` +
      `  "estimatedEffort": "",\n` +
      `  "totalDuration": "",\n` +
      `  "bufferTime": "",\n` +
      `  "finalEffort": "",\n` +
      `  "explanation": "Detailed explanation here"\n` +
      `}\n\n` +
      `Ensure that all fields are filled accurately.`;

    const { data } = await axios.post(
      `${process.env.GEMINI_AI_URL}?key=${process.env.GEMINI_AI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const rawData = JSON.parse(
      JSON.stringify(data?.candidates[0]?.content?.parts[0]?.text)
    );

    const cleanedContent = rawData.replace(/```json|```/g, "").trim();

    console.log(cleanedContent);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedContent);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return res.status(500).send("Error parsing JSON response from OpenAI.");
    }

    res.json({
      response: { _id: uuidv4(), ...jsonResponse },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
