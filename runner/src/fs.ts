import fs from "fs";
import path from "path";

// Interface to represent files and directories
interface File {
    type: "file" | "dir";
    name: string;
    path: string; // Added path to the interface
}

/**
 * Fetches the content of a directory and returns an array of files and directories.
 * Each item includes the type (file or dir), name, and its full path.
 *
 * @param {string} dir - Directory to read from.
 * @param {string} baseDir - Base directory to prepend to the file paths.
 * @returns {Promise<File[]>} - Array of files and directories in the specified directory.
 */
export const fetchDir = async (dir: string, baseDir: string): Promise<File[]> => {
    try {
        const files = await fs.promises.readdir(dir, { withFileTypes: true });
        return files.map((file) => ({
            type: file.isDirectory() ? "dir" : "file",
            name: file.name,
            path: path.join(baseDir, file.name),
        }));
    } catch (error) {
        throw new Error(`Failed to fetch directory content: ${error.message}`);
    }
};

/**
 * Reads the content of a specified file and returns it as a string.
 *
 * @param {string} file - Path to the file to read.
 * @returns {Promise<string>} - The content of the file as a string.
 */
export const fetchFileContent = async (file: string): Promise<string> => {
    try {
        const data = await fs.promises.readFile(file, "utf8");
        return data;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
};

/**
 * Writes the provided content to a specified file.
 *
 * @param {string} file - Path to the file to save.
 * @param {string} content - Content to write to the file.
 * @returns {Promise<void>} - Resolves when the file is successfully written.
 */
export const saveFile = async (file: string, content: string): Promise<void> => {
    try {
        await fs.promises.writeFile(file, content, "utf8");
        console.log(`File saved successfully at: ${file}`);
    } catch (error) {
        throw new Error(`Failed to save file: ${error.message}`);
    }
};
