"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
// Create a Nodemailer transporter using SMTP
let transporter = nodemailer_1.default.createTransport({
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
async function downloadImage(url) {
    try {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
    catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}
// Main function to send the email with the attachment
async function Mail(req, res) {
    console.log(req.body.email);
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
    }
    catch (error) {
        res.send(error);
    }
}
exports.default = Mail;
