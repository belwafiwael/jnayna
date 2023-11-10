import * as dotenv from 'dotenv';
import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//database
import { connectDB } from './db/connect.js';
// routes
import authRouter from './routes/authRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import productRouter from './routes/productRoutes.js';

//middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import notFoundMiddleware from './middleware/notFoundMiddleware.js';

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Jnayna api');
});
app.get('/api/v1', (req, res) => {
  res.send('Jnayna application start');
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(PORT, console.log(`Server is listening on port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
