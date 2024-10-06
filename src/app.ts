import express, { Application, Request, Response } from 'express';
import cors from 'cors'; // CORS middleware for handling cross-origin requests
import multer from 'multer'; // For file uploads
import { exec } from 'child_process'; // For executing Python script
import path from 'path';
import transactionRouter from './routes/transaction'; // Import your transaction router
import extractRouter from './routes/extract'; // Import your transaction router

const app: Application = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Ensure unique filenames
    }
});

const upload = multer({ storage });


app.use('/extractPhoto', extractRouter)
// Transaction router
app.use('/transaction', transactionRouter);

// Simple home route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}, available endpoints: /transaction, /extract-photo`);
});
