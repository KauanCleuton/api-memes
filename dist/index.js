"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("canvas");
const fs_1 = require("fs");
const app = (0, express_1.default)();
const swaggerDocumentPath = path_1.default.resolve(__dirname, 'swagger.json');
const swaggerDocument = require(swaggerDocumentPath);
const swaggerUi = require('swagger-ui-express');
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((0, cors_1.default)());
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.json());
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
const memes = [];
app.get('/', (req, res) => {
    res.render('index', { memes });
});
app.post('/memes', upload.single('image'), async (req, res) => {
    var _a;
    const { caption } = req.body;
    const imagePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!caption || !imagePath) {
        return res.status(400).json({ message: 'Caption and image are required' });
    }
    const canvas = (0, canvas_1.createCanvas)(600, 600);
    const ctx = canvas.getContext('2d');
    const image = await (0, canvas_1.loadImage)(imagePath);
    const aspectRatio = image.width / image.height;
    const maxWidth = 600;
    const maxHeight = 600;
    let width = maxWidth;
    let height = width / aspectRatio;
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    ctx.drawImage(image, 0, 0, width, height);
    ctx.font = '43px Roboto';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const lineHeight = 27;
    const wrapText = (text, maxWidth) => {
        const words = text.split('');
        const lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + '' + word;
            const { width } = ctx.measureText(testLine);
            if (width <= maxWidth) {
                currentLine = testLine;
            }
            else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };
    const lines = wrapText(caption, maxWidth - 40);
    const totalTextHeight = lines.length * lineHeight;
    const textX = width / 2;
    const textY = height - totalTextHeight - 20;
    lines.forEach((line, index) => {
        const y = textY + index * lineHeight;
        ctx.strokeText(line, textX, y);
        ctx.fillText(line, textX, y);
    });
    const outputImagePath = `${imagePath}-with-caption.png`;
    const out = (0, fs_1.createWriteStream)(outputImagePath);
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
