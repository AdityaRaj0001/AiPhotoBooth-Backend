import nodemailer from 'nodemailer';
import axios from 'axios';
import { Response, Request } from 'express';

// Create a Nodemailer transporter using SMTP
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'gokaptureevents@gmail.com',
        pass: 'wxn09o0qxbwit4vxg',
    },
});

// Function to download the image from the URL
async function downloadImage(url: string): Promise<Buffer> {
    try {
        const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}

// Main function to send the email with the attachment
async function Mail(req: Request, res: Response) {
    console.log(req.body.email)
    try {
        const recipientEmail = req.body.email;
        const imageUrl = req.body.imageUrl;
        // const imageBuffer = await downloadImage(imageUrl);
        const info = await transporter.sendMail({
            from: 'gokaptureevents@gmail.com',
            to: recipientEmail,
            subject: 'GoKapture Ai PhotoBooth',
            text: "Hope so You Like Our Service. Bellow You Will Find the Ai PhotoBooth Image of Your's!",
            // attachments: [
            //     {
            //         filename: 'go_kapture.jpg',
            //         content: imageBuffer, // Buffer :-)
            //     },
            // ],
        });
        res.send(info);
    } catch (error) {
        res.send(error);
    }
}

export default Mail;

