/**
 * Utility for preparing all images data set, resizeing, cropping, grayscaling
 * 
 * and after train network
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import imageOperator from './app/services/imageOperator.js';
import neuralNetwork from './app/services/neuralNetwork.js';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgsDir = path.resolve(__dirname, `./public/${process.env.IMGS_DIR}`);

const imgName = '3.41745619636288733.png';
imageOperator.saveForDataset(imgName);

// const imageNamesP = [];
// fs.readdirSync(`${imgsDir}/origin/`).forEach(file => {
//   const imgName = imageOperator.saveForDataset(file);
//   imageNamesP.push(imgName);
// });

// const imageNames = await Promise.all(imageNamesP);

// console.log(imageNames);

// neuralNetwork.train();