import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

const router = express.Router();

interface Transaction {
    amount: number;
    method: string;
    category: string;
    quantity: number;
    customerAge: number;
    customerLocation: string;
    device: string;
    IP: string;
    day: number;
    month: string;
    hour: string;
}

router.post('/', async (req: Request, res: Response) => {
    try {
        console.log('Received API request at /transaction');
        const {
            amount,
            method,
            category,
            quantity,
            customerAge,
            customerLocation,
            device,
            IP,
            day,
            month,
            hour,
        } = req.body;

        if (!amount || !method || !IP) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const transaction: Transaction = {
            amount: parseFloat(amount),
            method,
            category,
            quantity: parseInt(quantity),
            customerAge: parseInt(customerAge),
            customerLocation,
            device,
            IP,
            day: parseInt(day),
            month,
            hour,
        };

        const transactionData = JSON.stringify(transaction);

        const pythonScript = path.join(__dirname, '..', 'scripts', 'detect_fraud.py');

        exec(`python ${pythonScript} '${transactionData}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                res.status(500).json({ error: 'Error executing fraud detection' });
                return;
            }

            if (stderr) {
                console.error(`Python stderr: ${stderr}`);
                res.status(500).json({ error: 'Fraud detection error' });
                return;
            }

            const isFraud = stdout 
            
            res.status(200).json({
                status: 'success',
                message: 'Transaction processed successfully',
                isFraud,
                transaction
            });
        });
    } catch (error) {
        console.error('Error processing transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
