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

app.use("/faceswap", faceswap);
app.use("/ai-avatar", aiAvatar);
app.use("/mail", mail);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
