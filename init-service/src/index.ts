import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { copyS3Folder } from "./aws"; // Assuming the aws.js module has the function

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON request bodies and enable CORS
app.use(express.json());
app.use(cors());

/**
 * POST /project
 * Creates a project by copying files from a base folder in S3 to a new folder for the given replId.
 *
 * @param {string} replId - Unique identifier for the project (required).
 * @param {string} language - Language folder to copy from (optional, defaults to a specific base).
 */
app.post("/project", async (req, res) => {
    try {
        const { replId, language } = req.body;

        // Check if replId is provided
        if (!replId) {
            return res.status(400).json({ error: "replId is required" });
        }

        // Set the base folder for copying based on language; fallback to a default
        const sourcePrefix = `base/${language || "default"}`;
        const destinationPrefix = `code/${replId}`;

        // Copy the folder from source to destination in S3
        await copyS3Folder(sourcePrefix, destinationPrefix);

        // Respond with a success message
        res.status(201).json({ message: "Project created successfully" });
    } catch (error) {
        // Log the error and send a response with a 500 status code
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
});

// Start the server and listen on the specified port
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
