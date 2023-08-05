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
app.post('/memes', upload.single('image'), (request, response) => {
    var _a;
    const { caption } = request.body;
    const imagePath = (_a = request.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!caption || !imagePath) {
        return response.status(400).json({ message: 'Caption and image are required' });
    }
    const newMeme = {
        id: memes.length + 1,
        caption,
        imagem: imagePath,
    };
    memes.push(newMeme);
    return response.status(201).json(newMeme);
});
app.get('/memes', (request, response) => {
    response.json(memes);
});
app.listen(3333, () => {
    console.log('Server is running!!');
});
