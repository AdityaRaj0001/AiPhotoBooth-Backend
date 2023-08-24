import { Router } from "express";
import multer from "multer";
import Mail from "../controller/mail.controller";

const mail = Router()


mail.post("/", Mail)

export default mail