import { Request, Response } from "express";
import sharp from 'sharp';

const Bg_Changer = async (req: Request, res: Response) => {
    try {
        console.log(req.files);
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const mainImageBuffer = files.bg[0].buffer; // Buffer for the beautiful background image
        const overlayImageBuffer = files.input_image[0].buffer; // Buffer for the image with transparent background

        // Load overlay image dimensions
        const overlayMetadata = await sharp(overlayImageBuffer).metadata();
        let overlayWidth = overlayMetadata.width || 0;
        let overlayHeight = overlayMetadata.height || 0;

        // Calculate new dimensions for the overlay image (1.5 times bigger)
        overlayWidth *= 0.5;
        overlayHeight *= 0.5;
        // Round down the calculated dimensions to the nearest integer
        overlayWidth = Math.floor(overlayWidth);
        overlayHeight = Math.floor(overlayHeight);
        // Calculate the desired position for overlay (right-aligned)
        const mainMetadata = await sharp(mainImageBuffer).metadata();
        const mainWidth = mainMetadata.width || 0;
        const mainHeight = mainMetadata.height || 0;
        const overlayX = mainWidth - overlayWidth; // X-coordinate
        const overlayY = mainHeight - overlayHeight; // Y-coordinate

        // Check if the overlay image dimensions are smaller than the main image
        if (overlayWidth <= mainWidth && overlayHeight <= mainHeight) {
            // Resize overlay image to the new dimensions
            const resizedOverlayBuffer = await sharp(overlayImageBuffer)
                .resize(overlayWidth, overlayHeight)
                .toBuffer();

            // Compose images
            const compositeBuffer = await sharp(mainImageBuffer)
                .composite([{ input: resizedOverlayBuffer, left: overlayX, top: overlayY , gravity: 'southeast' }])
                .toBuffer();

            // res.set('Content-Type', 'image/jpeg'); // Adjust the content type based on your output format
            res.send(compositeBuffer);
        } else {
            // Handle the case where the overlay image is larger than the main image
            res.status(400).send('Overlay image dimensions are too large');
        }
    } catch (e) {
        // Handle errors
        console.error(e);
        res.status(500).send('An error occurred');
    }
};

export default Bg_Changer;
