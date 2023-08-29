"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const bs64_1 = require("../../utils/bs64");
const form_data_1 = __importDefault(require("form-data"));
const faceswap_controller_1 = require("../../FaceSwap/controller/faceswap.controller");
const image2 = "./src/assets/image2.png";
const image3 = "./src/assets/image3.png";
const Bg_Changer = async (req, res) => {
    try {
        const files = req.files;
        // console.log(files)
        const overlayImageBuffer = files.input_image[0].buffer;
        const SG_IMAGE_DATA = new form_data_1.default();
        SG_IMAGE_DATA.append('image_base64', (0, bs64_1.toB64)(overlayImageBuffer));
        SG_IMAGE_DATA.append('sync', '1');
        const bgRemovedOverlayImageBuffer = await axios_1.default.post(process.env.PIC_WISH_BASE_URL_BG_REMOVE || "", SG_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY,
            },
        });
        console.log(bgRemovedOverlayImageBuffer.data.data.image);
        const data_bgRemovedOverlayImageBuffer = await axios_1.default.get(bgRemovedOverlayImageBuffer.data.data.image, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(data_bgRemovedOverlayImageBuffer.data, 'binary');
        const overlayMetadata = await (0, sharp_1.default)(imageBuffer).metadata();
        // increase the height and width 
        const overlayWidth = Math.floor((overlayMetadata.width || 0) * 2);
        const overlayHeight = Math.floor((overlayMetadata.height || 0) * 2);
        const mainMetadata = await (0, sharp_1.default)(image2).metadata();
        const mainWidth = mainMetadata.width || 0;
        const mainHeight = mainMetadata.height || 0;
        const overlayX = (mainWidth - overlayWidth) + 200;
        const overlayY = (mainHeight - overlayHeight) - 140;
        if (overlayWidth <= mainWidth && overlayHeight <= mainHeight) {
            const resizedOverlayBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize(overlayWidth, overlayHeight)
                .toBuffer();
            const compositeBuffer = await (0, sharp_1.default)(image2)
                .composite([{ input: resizedOverlayBuffer, left: overlayX, top: overlayY, gravity: 'southeast' }])
                .toBuffer();
            const [baseImageBuffer, overlayImageBuffer] = await Promise.all([
                (0, sharp_1.default)(Buffer.from(compositeBuffer))
                    .resize(600, 400)
                    .toBuffer(),
                (0, sharp_1.default)(image3)
                    .resize(600, 400)
                    .toBuffer()
            ]);
            const compositeImageBuffer = await (0, sharp_1.default)(baseImageBuffer)
                .composite([{ input: overlayImageBuffer }])
                .toBuffer();
            const data = {
                "image": (0, bs64_1.toB64)(compositeImageBuffer),
                "scale": 8
            };
            const [_, responseData] = await Promise.all([
                (0, sharp_1.default)(baseImageBuffer)
                    .composite([{ input: overlayImageBuffer }])
                    .toBuffer(),
                axios_1.default.post(process.env.ENHANCE_BASE_URL || "", data, {
                    headers: {
                        'x-api-key': process.env.API_KEY,
                    },
                    responseType: 'arraybuffer'
                })
            ]);
            const folderName = new Date().getTime().toString();
            const uploadPromises = [
                (0, faceswap_controller_1.uploadImage)(Buffer.from(files.input_image[0].buffer), folderName),
                (0, faceswap_controller_1.uploadImage)(responseData.data, folderName)
            ];
            const uploadResults = await Promise.all(uploadPromises);
            // console.log(uploadResults);
            // res.setHeader('Content-Type', 'image/png');
            res.send({
                image: uploadResults[1].secure_url,
            });
        }
        else {
            res.status(400).send('Overlay image dimensions are too large');
        }
    }
    catch (e) {
        console.log(e);
        // res.send(e.response.data);
        res.status(500).send('An error occurred');
    }
};
exports.default = Bg_Changer;
