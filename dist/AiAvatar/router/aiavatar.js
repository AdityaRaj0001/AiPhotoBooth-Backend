"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const aiAvatar_controller_1 = __importDefault(require("../controller/aiAvatar.controller"));
const aiAvatar = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});
aiAvatar.post("/", upload.fields([{
        name: "input_image",
        maxCount: 1,
    }]), aiAvatar_controller_1.default);
exports.default = aiAvatar;
