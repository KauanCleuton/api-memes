import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { createWriteStream } from 'fs';

const swaggerDocumentPath = path.resolve(__dirname, 'swagger.json');
const swaggerDocument = require(swaggerDocumentPath);

const swaggerUi = require('swagger-ui-express');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

registerFont('fonts/Roboto-Bold.ttf', { family: 'Roboto' });

interface INewName {
  id: number;
  caption: string;
  imagem: string;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()} - ${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname} - ${uniqueSuffix} ${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

const memes: INewName[] = [];

app.post('/memes', upload.single('image'), async (req: Request, res: Response) => {
  const { caption } = req.body;
  const imagePath = req.file?.path;

  if (!caption || !imagePath) {
    return res.status(400).json({ message: 'Caption and image are required' });
  }

  const canvas = createCanvas(450, 450);
  const ctx = canvas.getContext('2d');

  const image = await loadImage(imagePath);

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

  ctx.font = '30px Roboto';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const lineHeight = 40; 

  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const { width } = ctx.measureText(testLine);

      if (width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
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
  const out = createWriteStream(outputImagePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  out.on('finish', () => {
    const newMeme: INewName = {
      id: memes.length + 1,
      caption,
      imagem: outputImagePath,
    };

    memes.push(newMeme);

    res.status(201).json(newMeme);
  });
});

app.get('/memes', (request: Request, response: Response) => {
  response.json(memes);
});

app.listen(3333, () => {
  console.log('Server is running!!');
});
