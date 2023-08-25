import { Router } from "express";
import multer from "multer";
import Bg_Changer from "../controller/bg.controller";

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
})

const bg = Router()

bg.post("/", upload.fields([{
    name: "input_image",
    maxCount: 1,
}, {
    name: "bg",
    maxCount: 1,
}]), Bg_Changer)

export default bg