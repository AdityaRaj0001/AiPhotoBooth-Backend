import { Router } from "express";
import multer from "multer";
import AvatarAI from "../controller/aiAvatar.controller";

const aiAvatar = Router()

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
})

aiAvatar.post("/", upload.fields([{
    name: "input_image",
    maxCount: 1,
}]), AvatarAI)

export default aiAvatar