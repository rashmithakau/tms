import express from 'express';
import connectDB from './config/db';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.listen(port, host, () => {
  connectDB();
  console.log(`[ ready ] http://${host}:${port}`);
});
