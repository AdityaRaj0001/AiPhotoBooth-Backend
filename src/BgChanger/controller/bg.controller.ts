import { Request, Response } from "express";
import sharp from 'sharp';
import axios from "axios";
import { toB64 } from "../../utils/bs64";
import FormData from "form-data";
import { uploadImage } from "../../FaceSwap/controller/faceswap.controller";

const image2 = "./src/assets/image2.png";
const image3 = "./src/assets/image3.png";

const Bg_Changer = async (req: Request, res: Response) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        // console.log(files)
        const overlayImageBuffer = files.input_image[0].buffer;

        const SG_IMAGE_DATA = new FormData();
        SG_IMAGE_DATA.append('image_base64', toB64(overlayImageBuffer));
        SG_IMAGE_DATA.append('sync', '1');
        const bgRemovedOverlayImageBuffer = await axios.post(process.env.PIC_WISH_BASE_URL_BG_REMOVE || "", SG_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY,
            },
        });
        console.log(bgRemovedOverlayImageBuffer.data.data.image)
        const data_bgRemovedOverlayImageBuffer = await axios.get(bgRemovedOverlayImageBuffer.data.data.image, { responseType: 'arraybuffer' })
        const imageBuffer = Buffer.from(data_bgRemovedOverlayImageBuffer.data, 'binary');
        const overlayMetadata = await sharp(imageBuffer).metadata();
        // increase the height and width 
        const overlayWidth = Math.floor((overlayMetadata.width || 0) * 2);
        const overlayHeight = Math.floor((overlayMetadata.height || 0) * 2);
        const mainMetadata = await sharp(image2).metadata();
        const mainWidth = mainMetadata.width || 0;
        const mainHeight = mainMetadata.height || 0;
        const overlayX = (mainWidth - overlayWidth) + 200;
        const overlayY = (mainHeight - overlayHeight) - 140;

        if (overlayWidth <= mainWidth && overlayHeight <= mainHeight) {
            const resizedOverlayBuffer = await sharp(imageBuffer)
                .resize(overlayWidth, overlayHeight)
                .toBuffer();

            const compositeBuffer = await sharp(image2)
                .composite([{ input: resizedOverlayBuffer, left: overlayX, top: overlayY, gravity: 'southeast' }])
                .toBuffer();

            const [baseImageBuffer, overlayImageBuffer] = await Promise.all([
                sharp(Buffer.from(compositeBuffer))
                    .resize(600, 400)
                    .toBuffer(),
                sharp(image3)
                    .resize(600, 400)
                    .toBuffer()
            ]);
            const compositeImageBuffer = await sharp(baseImageBuffer)
                .composite([{ input: overlayImageBuffer }])
                .toBuffer();
            const data = {
                "image": toB64(compositeImageBuffer),
                "scale": 4
            }
            const [_, responseData] = await Promise.all([
                sharp(baseImageBuffer)
                    .composite([{ input: overlayImageBuffer }])
                    .toBuffer(),
                axios.post(process.env.ENHANCE_BASE_URL || "", data, {
                    headers: {
                        'x-api-key': process.env.API_KEY,
                    },
                    responseType: 'arraybuffer'
                })
            ]);
            const folderName = new Date().getTime().toString();
            const uploadPromises = [
                uploadImage(Buffer.from(files.input_image[0].buffer), folderName),
                uploadImage(responseData.data, folderName)
            ];
            const uploadResults = await Promise.all(uploadPromises);
            // console.log(uploadResults);
            // res.setHeader('Content-Type', 'image/png');
            res.send({
                image: uploadResults[1].secure_url,
            });
        } else {
            res.status(400).send('Overlay image dimensions are too large');
        }
    } catch (e: any) {
        console.log(e)
        // res.send(e.response.data);
        res.status(500).send('An error occurred');
    }
};

export default Bg_Changer;
