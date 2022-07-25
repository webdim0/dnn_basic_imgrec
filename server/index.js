import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.static('public'));

import datasetRoute from './app/routes/dataset.js';
datasetRoute(app);
import nnRoute from './app/routes/neuralNetwork.js';
nnRoute(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});