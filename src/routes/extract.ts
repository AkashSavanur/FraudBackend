import express, { Request, Response } from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';

const router = express.Router();

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store the file in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Ensure unique file name
    }
});

const upload = multer({ storage });

router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return; // Don't return anything after res.status().json()
        }

        const filePath = path.join(__dirname, '..', req.file.path);

        // Get the question from the request body, or use a default one
        const question = req.body.question || 'What information is in this image?';

        // Path to your Python script
        const pythonScript = path.join(__dirname, '..', 'extract_text.py');

        // Command to run the Python script with image path and question as arguments
        const command = `python ${pythonScript} "${filePath}" "${question}"`;

        // Execute the Python script
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                res.status(500).json({ error: 'Error processing the image' });
                return; // Don't return anything after res.status().json()
            }
            if (stderr) {
                console.error(`Python script error: ${stderr}`);
                res.status(500).json({ error: 'Error in image processing' });
                return; // Don't return anything after res.status().json()
            }

            // Send the extracted text as the response
            const result = stdout.trim();
            res.status(200).json({ result });  // Send response but don't return it
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
