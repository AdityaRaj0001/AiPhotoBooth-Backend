"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faceswap_controller_1 = __importDefault(require("../controller/faceswap.controller"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});
const faceswap = (0, express_1.Router)();
faceswap.post("/", upload.fields([{
        name: "input_image",
        maxCount: 1,
    }, {
        name: "target_image",
        maxCount: 1,
    }]), faceswap_controller_1.default);
exports.default = faceswap;
