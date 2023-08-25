"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs').promises;
const path = require('path');
const express_1 = __importDefault(require("express"));
const faceswap_1 = __importDefault(require("./FaceSwap/router/faceswap"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const aiavatar_1 = __importDefault(require("./AiAvatar/router/aiavatar"));
const mail_1 = __importDefault(require("./mail/router/mail"));
const bg_1 = __importDefault(require("./BgChanger/router/bg"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
dotenv.config(); // Loads variables from .env into process.env
app.disable('x-powered-by');
app.use((req, res, next) => {
    // req.headers["x-version"] = "1.0.0";
    req.headers["x-author"] = "Siddhant";
    next();
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World");
});
const dir = path.join(__dirname, './APP_ID.json');
app.get("/change-id", async (req, res) => {
    try {
        if (!req.query.id || !req.query.expire)
            return res.send({
                response: false, message: "Please provide APP id and expiry"
            });
        // example: http://localhost:3002/change-id?id=123456789&expire=30
        const data = await fs.readFile(dir, 'utf8');
        const _data = JSON.parse(data);
        _data.APP_ID = req.query.id || _data.APP_ID;
        _data.expire = req.query.expire || _data.expire;
        const __data = JSON.stringify(_data, null, 2);
        await fs.writeFile(dir, __data);
        res.send({
            response: true,
            message: "App id changed successfully",
            previous: JSON.parse(data),
            current: JSON.parse(__data)
        });
    }
    catch (err) {
        res.send({
            response: false,
            message: "Error occured",
            error: err
        });
    }
});
app.post("/check-app-id", async (req, res) => {
    try {
        const data = await fs.readFile(dir, 'utf8');
        const parsedData = JSON.parse(data);
        const APP_ID = req.body.app_id;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parsedData.expire);
        console.log;
        if (APP_ID === parsedData.APP_ID && new Date() < expirationDate) {
            res.status(200).json({ message: "App ID is valid", bool: true });
        }
        else {
            res.status(401).json({ message: "App ID is not valid", bool: false });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error reading or parsing data", bool: false });
    }
});
app.use("/faceswap", faceswap_1.default);
app.use("/ai-avatar", aiavatar_1.default);
app.use("/mail", mail_1.default);
app.use("/bg-changer", bg_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
