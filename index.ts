import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
const app = express();

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

app.post('/memes', upload.single('image'), (request: Request, response: Response) => {
  const { caption } = request.body;
  const imagePath = request.file?.path;

  if (!caption || !imagePath) {
    return response.status(400).json({ message: 'Caption and image are required' });
  }

  const newMeme: INewName = {
    id: memes.length + 1,
    caption,
    imagem: imagePath,
  };

  memes.push(newMeme);

  return response.status(201).json(newMeme);
});

app.get('/memes', (request: Request, response: Response) => {
  response.json(memes);
});

app.listen(3333, () => {
  console.log('Server is running!!');
});
