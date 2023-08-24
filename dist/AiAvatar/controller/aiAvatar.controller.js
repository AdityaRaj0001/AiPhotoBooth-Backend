"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const characterPrompts = [
    "A cyberpunk hacker with neon-colored hair and augmented reality glasses",
    "An elven archer with intricate tattoos and a mystical bow",
    "A steampunk engineer with gears and goggles, holding a mechanical device",
    "A swashbuckling space pirate with a futuristic laser cutlass",
    "A mermaid explorer with bioluminescent scales and aquatic technology",
    "A time-traveling scientist wearing a lab coat and holding a time-travel device",
    "An alchemist mixing otherworldly ingredients in a bubbling cauldron",
    "A mech engineer with a tool belt and a knack for invention"
];
const AvatarAI = async (req, res) => {
    console.log(req.files);
    // try {
    //     const files = req.files as {
    //         [fieldname: string]: Express.Multer.File[];
    //     }
    //     console.log(process.env._API_KEY)
    //     const data = {
    //         "model": "stable-diffusion-v1-5",
    //         "prompt": "ant man transformation with realistic, 4k resolution,",
    //         "negative_prompt": "Disfigured, cartoon, blurry, bad quality, bad anatomy, bad posture, bad coloring, bad lightning, bad shading",
    //         "image": toB64(files.input_image[0].buffer),
    //         "strength": 0.75,
    //         "steps": 50,
    //         "guidance": 12,
    //         "seed": 42,
    //         "scheduler": "dpmsolver++",
    //         "output_format": "jpeg"
    //     }
    //     const response = await axios.post(process.env._IMAGE_TO_IMAGE_BASE_URL || "", data, {
    //         headers: {
    //             "Authorization": `Bearer ${process.env._API_KEY}` || "",
    //         },
    //         // responseType: 'arraybuffer'
    //     })
    //     res.send(Buffer.from(response.data.image, 'base64'));
    // } catch (error: any) {
    //     console.error(error.response);
    //     res.status(500).json({ error: error.message || "Internal Server Error" });
    // }
};
exports.default = AvatarAI;
