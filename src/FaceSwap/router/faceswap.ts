import { Router } from "express";
import SwapFace from "../controller/faceswap.controller";
import multer from "multer";

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
})

const faceswap = Router()

faceswap.post("/", upload.fields([{
    name: "input_image",
    maxCount: 1,
}, {
    name: "target_image",
    maxCount: 1,
}]), SwapFace)

export default faceswap