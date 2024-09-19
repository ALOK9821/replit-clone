import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { saveToS3 } from "./aws";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pty";

// Initialize terminal manager
const terminalManager = new TerminalManager();

/**
 * Initializes the WebSocket server with the provided HTTP server.
 *
 * @param {HttpServer} httpServer - The HTTP server to attach WebSocket to.
 */
export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            // Set a proper CORS policy in production
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", async (socket) => {
        try {
            // Implement authentication and authorization checks here
            const host = socket.handshake.headers.host;
            console.log(`host is ${host}`);

            // Extract replId from the subdomain
            const replId = host?.split('.')[0];

            if (!replId) {
                socket.disconnect();
                terminalManager.clear(socket.id);
                return;
            }

            // Send the initial root content to the connected client
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });

            // Initialize the WebSocket event handlers
            initHandlers(socket, replId);
        } catch (error) {
            console.error("Error during WebSocket connection:", error);
            socket.disconnect();
        }
    });
}

/**
 * Initializes event handlers for a connected WebSocket client.
 *
 * @param {Socket} socket - The connected WebSocket client.
 * @param {string} replId - The unique identifier for the project (extracted from subdomain).
 */
function initHandlers(socket: Socket, replId: string) {
    // Handle client disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        terminalManager.clear(socket.id); // Clear terminal session if client disconnects
    });

    /**
     * Fetch the contents of a directory requested by the client.
     */
    socket.on("fetchDir", async (dir: string, callback) => {
        try {
            const dirPath = `/workspace/${dir}`;
            const contents = await fetchDir(dirPath, dir);
            callback(contents);
        } catch (error) {
            console.error("Error fetching directory:", error);
            callback({ error: "Failed to fetch directory contents" });
        }
    });

    /**
     * Fetch the content of a specific file requested by the client.
     */
    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        try {
            const fullPath = `/workspace/${filePath}`;
            const data = await fetchFileContent(fullPath);
            callback(data);
        } catch (error) {
            console.error("Error fetching file content:", error);
            callback({ error: "Failed to fetch file content" });
        }
    });

    /**
     * Update the content of a file and save it both locally and to S3.
     * Should include validation (e.g., content size, diffing) in production.
     */
    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        try {
            const fullPath = `/workspace/${filePath}`;
            await saveFile(fullPath, content);

            // Optionally throttle updates or use a better update strategy for S3
            await saveToS3(`code/${replId}`, filePath, content);
        } catch (error) {
            console.error("Error updating file content:", error);
        }
    });

    /**
     * Request a new terminal session.
     */
    socket.on("requestTerminal", () => {
        terminalManager.createPty(socket.id, replId, (data, id) => {
            // Send terminal output back to the client
            socket.emit("terminal", { data: Buffer.from(data, "utf-8") });
        });
    });

    /**
     * Handle incoming data to be sent to the terminal session.
     */
    socket.on("terminalData", ({ data }: { data: string, terminalId: number }) => {
        try {
            terminalManager.write(socket.id, data);
        } catch (error) {
            console.error("Error processing terminal data:", error);
        }
    });
}
