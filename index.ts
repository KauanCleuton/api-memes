import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
const app = express();
import { createCanvas, loadImage, registerFont } from 'canvas';
import { createWriteStream } from 'node:fs';

registerFont('fonts/Roboto-Bold.ttf', { family: 'Roboto'});

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

app.post('/memes', upload.single('image'), async (req, res) => {
  const { caption } = req.body;
  const imagePath = req.file?.path;

  if (!caption || !imagePath) {
    return res.status(400).json({ message: 'Caption and image are required' });
  }

  const canvas = createCanvas(450, 450);
  const ctx = canvas.getContext('2d');

  const image = await loadImage(imagePath);

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
