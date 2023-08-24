import { toB64 } from "../../utils/bs64";
import axios from "axios";
import { Request, Response } from "express";
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
        const SG_IMAGE_DATA = new FormData();
        SG_IMAGE_DATA.append('image_base64', toB64(response.data));
        SG_IMAGE_DATA.append('fix_face_only', '1');
        SG_IMAGE_DATA.append('type', 'face');
        SG_IMAGE_DATA.append('scale_factor', '4');
        SG_IMAGE_DATA.append('return_type', '1');
        SG_IMAGE_DATA.append('sync', '1');
        const EnhancedImage = await axios.post(process.env.PIC_WISH_BASE_URL || "", SG_IMAGE_DATA, {
            headers: {
                'x-api-key': process.env.PIC_WISH_API_KEY
            }
        });
        res.send(EnhancedImage.data.data);
    } catch (error: any) {
        console.error(error.response);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export default SwapFace;
