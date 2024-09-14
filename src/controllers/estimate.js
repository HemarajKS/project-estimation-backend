const axios = require("axios");

module.exports.getEstimate = async (req, res) => {
  const { taskName, rolesInvolved, description, complexity } = req.body;
  try {
    if (!taskName || !rolesInvolved || rolesInvolved.length === 0) {
      return res
        .status(400)
        .json({ error: "Task Name and Roles Involved are required." });
    }

    const prompt =
      `Estimate the effort required for the following task:\n\n` +
      `**Task Name:** ${taskName}\n` +
      `**Roles Involved:** ${rolesInvolved.join(", ")}\n` +
      `**Description:** ${description || "No description provided."}\n` +
      `**Complexity:** ${complexity || "Not specified"}\n\n` +
      `Please provide a detailed response in JSON format with the following information:\n\n` +
      `1. **Estimated Effort (in hours):** The estimated time required to complete the task.\n` +
      `2. **Total Duration (in hours):** The total number of hours required.\n` +
      `3. **Buffer Time (in hours):** Additional time allocated to handle unforeseen issues or delays.\n` +
      `4. **Final Effort (in hours):** Total effort of time including buffer time.\n` +
      `5. **Explanation:** A detailed explanation of the effort estimate, including the reasons for the given complexity and any factors that influence the effort required (put it in array as pointwise).\n\n` +
      `**Format your response as a JSON object:**\n\n` +
      `{\n` +
      `  "taskName": "Example Task",\n` +
      `  "rolesInvolved": ["Role1", "Role2"],\n` +
      `  "description": "Task description here",\n` +
      `  "complexity": "",\n` +
      `  "estimatedEffort": "",\n` +
      `  "totalDuration": "",\n` +
      `  "bufferTime": "",\n` +
      `  "finalEffort": "",\n` +
      `  "explanation": "Detailed explanation here"\n` +
      `}\n\n` +
      `Ensure that all fields are filled accurately and provide a thorough explanation of the estimated effort.`;

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

    const rawData = data?.candidates[0].content.parts[0].text;

    const cleanedContent = rawData.replace(/```json|```/g, "").trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedContent);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return res.status(500).send("Error parsing JSON response from OpenAI.");
    }

    res.json({
      response: jsonResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
