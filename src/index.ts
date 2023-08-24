const fs = require('fs').promises
const path = require('path')
import Express, { NextFunction, Request, Response } from "express";
import faceswap from "./FaceSwap/router/faceswap";
import * as dotenv from 'dotenv';
import cors from "cors";
import bodyParser from "body-parser";
import aiAvatar from "./AiAvatar/router/aiavatar";
import mail from "./mail/router/mail";
const app = Express();

const PORT = process.env.PORT || 3002;

dotenv.config(); // Loads variables from .env into process.env

app.disable('x-powered-by');

app.use((req: Request, res: Response, next: NextFunction) => {
    // req.headers["x-version"] = "1.0.0";
    req.headers["x-author"] = "Siddhant";
    next();
});
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

const dir = path.join(__dirname, './APP_ID.json')

app.get("/change-id", async (req, res) => {
    try{
        if (!req.query.id || !req.query.expire) return res.send({
            response: false, message: "Please provide APP id and expiry"
        })
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
        })
    } catch (err) {
        res.send({
            response: false,
            message: "Error occured",
            error: err
        })
    }
})

app.post("/check-app-id", async (req, res) => {
    try {
        const data = await fs.readFile(dir, 'utf8');
        const parsedData = JSON.parse(data);
        
        const APP_ID = req.body.app_id;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parsedData.expire);

        if (APP_ID === parsedData.APP_ID && new Date() < expirationDate) {
            res.status(200).json({ message: "App ID is valid", bool: true });
        } else {
            res.status(401).json({ message: "App ID is not valid", bool: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Error reading or parsing data", bool: false });
    }
});

app.use("/faceswap", faceswap);
app.use("/ai-avatar", aiAvatar);
app.use("/mail", mail);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
