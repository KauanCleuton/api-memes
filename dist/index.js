"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const canvas_1 = require("canvas");
const node_fs_1 = require("node:fs");
(0, canvas_1.registerFont)('fonts/Roboto-Bold.ttf', { family: 'Roboto' });
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()} - ${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname} - ${uniqueSuffix} ${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const memes = [];
app.post('/memes', upload.single('image'), async (req, res) => {
    var _a;
    const { caption } = req.body;
    const imagePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!caption || !imagePath) {
        return res.status(400).json({ message: 'Caption and image are required' });
    }
    const canvas = (0, canvas_1.createCanvas)(450, 450);
    const ctx = canvas.getContext('2d');
    const image = await (0, canvas_1.loadImage)(imagePath);
    // Calcula o tamanho da imagem para não distorcê-la
    const aspectRatio = image.width / image.height;
    const maxWidth = 450;
    const maxHeight = 450;
    let width = maxWidth;
    let height = width / aspectRatio;
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    ctx.drawImage(image, 0, 0, width, height);
    ctx.font = '30px YourCustomFont';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const textX = width / 2;
    const textY = height - 20;
    ctx.strokeText(caption, textX, textY);
    ctx.fillText(caption, textX, textY);
    const outputImagePath = `${imagePath}-with-caption.png`;
    const out = (0, node_fs_1.createWriteStream)(outputImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
        const newMeme = {
            id: memes.length + 1,
            caption,
            imagem: outputImagePath,
        };
        memes.push(newMeme);
        res.status(201).json(newMeme);
    });
});
app.get('/memes', (request, response) => {
    response.json(memes);
});
app.listen(3333, () => {
    console.log('Server is running!!');
});
