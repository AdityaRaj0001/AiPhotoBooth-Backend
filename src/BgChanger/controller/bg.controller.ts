import { Request, Response } from "express";
import sharp from 'sharp';
import axios from "axios";
import { toB64 } from "../../utils/bs64";
import FormData from "form-data";

const Bg_Changer = async (req: Request, res: Response) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const mainImageBuffer = files.bg[0].buffer;
        const overlayImageBuffer = files.input_image[0].buffer;

        const SG_IMAGE_DATA = new FormData();
        SG_IMAGE_DATA.append('image_base64', toB64(overlayImageBuffer));
        SG_IMAGE_DATA.append('sync', '1');
        const bgRemovedOverlayImageBuffer = await axios.post(process.env.PIC_WISH_BASE_URL_BG_REMOVE || "", SG_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY,
            },
        });
        const data_bgRemovedOverlayImageBuffer = await axios.get(bgRemovedOverlayImageBuffer.data.data.image, { responseType: 'arraybuffer' })
        const imageBuffer = Buffer.from(data_bgRemovedOverlayImageBuffer.data, 'binary');
        const overlayMetadata = await sharp(imageBuffer).metadata();
        const overlayWidth = Math.floor(overlayMetadata.width || 0 * 0.8);
        const overlayHeight = Math.floor(overlayMetadata.height || 0 * 0.8);
        const mainMetadata = await sharp(mainImageBuffer).metadata();
        const mainWidth = mainMetadata.width || 0;
        const mainHeight = mainMetadata.height || 0;
        const overlayX = (mainWidth - overlayWidth) - 400;
        const overlayY = (mainHeight - overlayHeight) - 100;

        if (overlayWidth <= mainWidth && overlayHeight <= mainHeight) {
            const resizedOverlayBuffer = await sharp(imageBuffer)
                .resize(overlayWidth, overlayHeight)
                .toBuffer();

            const compositeBuffer = await sharp(mainImageBuffer)
                .composite([{ input: resizedOverlayBuffer, left: overlayX, top: overlayY, gravity: 'southeast' }])
                .toBuffer();

            // res.set('Content-Type', 'image/jpeg');
            res.send(compositeBuffer);
        } else {
            res.status(400).send('Overlay image dimensions are too large');
        }
    } catch (e: any) {
        console.log(
            e.response
        )
        // res.send(e.response.data);
        // res.status(500).send('An error occurred');
    }
};

export default Bg_Changer;
