import { toB64 } from "../../utils/bs64";
import axios from "axios";
import { Request, Response } from "express";
import sharp from "sharp";
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const overlayImagePath = './src/assets/image.png';
cloudinary.config({
    cloud_name: 'dxjk4gnrw',
    api_key: '848441943216717',
    api_secret: 'DKKpZ5zkG7zuwBm0xXmPQ7Dyj5E'
});

export async function uploadImage(buffer: Buffer, folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder }, (error: any, result: any) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                console.log(result);
                resolve(result);
            }
        }).end(buffer);
    });
}

const SwapFace = async (req: Request, res: Response) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        }
        const API_KEY = process.env.API_KEY;

        const data = {
            input_face_image: toB64(files.input_image[0].buffer),
            target_face_image: toB64(files.target_image[0].buffer),
            file_type: files.input_image[0].mimetype.split('/')[1]
        };

        const response = await axios.post(process.env.FACE_SWAP_BASE_URL || "", data, {
            headers: {
                'x-api-key': API_KEY
            },
            responseType: 'arraybuffer'
        });
        const [baseImageBuffer, overlayImageBuffer] = await Promise.all([
            sharp(Buffer.from(response.data, 'binary'))
                .resize(400, 600)
                .toBuffer(),
            sharp(overlayImagePath)
                .resize(400, 600)
                .toBuffer()
        ]);
        const compositeImageBuffer = await sharp(baseImageBuffer)
            .composite([{ input: overlayImageBuffer }])
            .toBuffer();
        const PW_IMAGE_DATA = new FormData();
        PW_IMAGE_DATA.append('image_base64', toB64(compositeImageBuffer));
        PW_IMAGE_DATA.append('fix_face_only', '1');
        PW_IMAGE_DATA.append('type', 'face');
        PW_IMAGE_DATA.append('scale_factor', '4');
        PW_IMAGE_DATA.append('return_type', '1');
        PW_IMAGE_DATA.append('sync', '1');
        const EnhancedImage = await axios.post(process.env.PIC_WISH_BASE_URL || "", PW_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY
            }
        });
        const enhancedImageResponse = await axios.get(EnhancedImage.data.data.image, {
            responseType: 'arraybuffer'
        });
        const folderName = new Date().getTime().toString();
        const uploadPromises = [
            uploadImage(Buffer.from(files.input_image[0].buffer), folderName),
            uploadImage(enhancedImageResponse.data, folderName)
        ];
        const ResponseData = await Promise.all(uploadPromises);
        if (ResponseData) {
            res.send({
                image: ResponseData[1].secure_url,
            });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (error: any) {
        console.error(error.response);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export default SwapFace;
