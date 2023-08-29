"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const bs64_1 = require("../../utils/bs64");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const overlayImagePath = './src/assets/image.png';
cloudinary.config({
    cloud_name: 'dxjk4gnrw',
    api_key: '848441943216717',
    api_secret: 'DKKpZ5zkG7zuwBm0xXmPQ7Dyj5E'
});
async function uploadImage(buffer, folder) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            else {
                console.log(result);
                resolve(result);
            }
        }).end(buffer);
    });
}
exports.uploadImage = uploadImage;
const SwapFace = async (req, res) => {
    try {
        const files = req.files;
        const API_KEY = process.env.API_KEY;
        const data = {
            input_face_image: (0, bs64_1.toB64)(files.input_image[0].buffer),
            target_face_image: (0, bs64_1.toB64)(files.target_image[0].buffer),
            file_type: files.input_image[0].mimetype.split('/')[1]
        };
        const response = await axios_1.default.post(process.env.FACE_SWAP_BASE_URL || "", data, {
            headers: {
                'x-api-key': API_KEY
            },
            responseType: 'arraybuffer'
        });
        const [baseImageBuffer, overlayImageBuffer] = await Promise.all([
            (0, sharp_1.default)(Buffer.from(response.data, 'binary'))
                .resize(400, 600)
                .toBuffer(),
            (0, sharp_1.default)(overlayImagePath)
                .resize(400, 600)
                .toBuffer()
        ]);
        const compositeImageBuffer = await (0, sharp_1.default)(baseImageBuffer)
            .composite([{ input: overlayImageBuffer }])
            .toBuffer();
        const PW_IMAGE_DATA = new FormData();
        PW_IMAGE_DATA.append('image_base64', (0, bs64_1.toB64)(compositeImageBuffer));
        PW_IMAGE_DATA.append('fix_face_only', '1');
        PW_IMAGE_DATA.append('type', 'face');
        PW_IMAGE_DATA.append('scale_factor', '4');
        PW_IMAGE_DATA.append('return_type', '1');
        PW_IMAGE_DATA.append('sync', '1');
        const EnhancedImage = await axios_1.default.post(process.env.PIC_WISH_BASE_URL || "", PW_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY
            }
        });
        const enhancedImageResponse = await axios_1.default.get(EnhancedImage.data.data.image, {
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
        }
        else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    catch (error) {
        console.error(error.response);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
exports.default = SwapFace;
