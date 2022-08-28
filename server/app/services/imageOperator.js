import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tf from '@tensorflow/tfjs-node';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgsDir = path.resolve(__dirname, `../../public/${process.env.IMGS_DIR}`);
const imgsPredictDir = path.resolve(__dirname, `../../public/${process.env.IMGS_PREDICT_DIR}`);

const imageSmallSize = process.env.IMAGE_SMALL_SIZE.split(' ');
const imageSmallCNNSize = process.env.IMAGE_SMALL_CNN_SIZE.split(' ');

export default {
    async saveOriginal (imgBodyBase64, label, mode='data-set') {        
        const imgFileName = label + Math.random().toString().substring(1) + '.png';

        imgBodyBase64 = imgBodyBase64.replace(/^data:image\/png;base64,/, "");

        return new Promise((resolve, reject) => {
            fs.writeFile(`${mode=='predict'?imgsPredictDir:imgsDir}/origin/${imgFileName}`, imgBodyBase64, 'base64', err => {
                if (err) {
                    reject(err);
                }
                resolve(imgFileName);
            });
        });  
    },

    async saveForDataset (imgFileName, mode='data-set') {        
        
        const dir = mode=='predict' ? imgsPredictDir : imgsDir;
        
        return new Promise((resolve, reject) => {
            fs.readFile(`${dir}/origin/${imgFileName}`, (err, originImage) => {
                if (err) {                                                     
                    reject(err);
                }
                tf.tidy(() => {            
                    const originTensor = tf.node.decodePng(originImage);
                    const smallTensor = this.prepareImageTensor(originTensor);            
                    const smallTensorCNN = this.prepareImageTensorCNN(originTensor);            
                    tf.node.encodePng(smallTensor).then( savePng => {
                        fs.writeFile(`${dir}/prepared/${imgFileName}`, savePng, err => {
                            if (err) {
                                reject(err);
                            }
                            resolve(imgFileName);
                        });
                    });
                    tf.node.encodePng(smallTensorCNN).then( savePng => {
                        fs.writeFile(`${dir}/prepared_cnn/${imgFileName}`, savePng, err => {
                            if (err) {
                                reject(err);
                            }
                            resolve(imgFileName);
                        });
                    });
                });
            });            
        });
    },    

    async deleteAllOrigin (imgFileName) {
        this.deleteAll(imgsDir, imgFileName);
    },

    async deleteAllPredict (imgFileName) {
        this.deleteAll(imgsPredictDir, imgFileName);
    },

    deleteAll (imgsDir, imgFileName) {
        fs.unlink(`${imgsDir}/origin/${imgFileName}`, (err) => {
            if (err) throw err;            
        });
        fs.unlink(`${imgsDir}/prepared/${imgFileName}`, (err) => {
            if (err) throw err;            
        });
        fs.unlink(`${imgsDir}/prepared_cnn/${imgFileName}`, (err) => {
            if (err) throw err;            
        });
    },

    cropAndCenterImageTensor (originTensor) { 
        const arr = originTensor.arraySync();
        let fromRow = 0;
        for (let i=0; i < arr.length; i++) {
            const sum = arr[i].reduce((a, b) => a + b, 0);  
            if (sum === 0) {
                fromRow++;
            } else {
                break;
            }
        }           
        let toRow = arr.length;                      
        for (let i=arr.length-1; i > 0; i--) {
            const sum = arr[i].reduce((a, b) => a + b, 0);  
            if (sum === 0) {
                toRow--;
            } else {
                break;
            }
        }
        const countRow = toRow - fromRow;

        const colsCount = arr[0].length;
        let fromCol = 0;
        for (let j=0; j < colsCount; j++) {        
            let sum = 0;
            for (let i=0; i < arr.length; i++) {
                sum += arr[i][j];
            }
            if (sum === 0) {
                fromCol++;
            } else {
                break;
            }
        }
        let toCol = colsCount;
        for (let j=colsCount-1; j > 0; j--) {        
            let sum = 0;
            for (let i=0; i < arr.length; i++) {
                sum += arr[i][j];
            }
            if (sum === 0) {
                toCol--;
            } else {
                break;
            }
        }
        const countCol = toCol - fromCol;

        const originTensorSmallCroped = originTensor.slice([fromRow, fromCol], [countRow, countCol]);
        // originTensorSmallCroped.print();
        const baseDim = Math.max(countRow, countCol);
        const padTop = Math.ceil((baseDim - countRow)/2),
                padBottom = baseDim - countRow - padTop,
                padLeft = Math.ceil((baseDim - countCol)/2),
                padRight = baseDim - countCol - padLeft;
        const originTensorSmallCentered = originTensorSmallCroped.pad([[padTop, padBottom], [padLeft, padRight]]); // [Y], [X]
        // originTensorSmallCentered.print();

        const originTensorSmallGrayPrep = originTensorSmallCentered.expandDims(-1);  

        return originTensorSmallGrayPrep;
    },

    prepareImageTensor (tensor) {   
        const originTensorSmallRgb = tf.tidy(() => {                        
            const originTensorSmall = tf.image.resizeNearestNeighbor(tensor, imageSmallSize);
            const originTensorSmallGray = originTensorSmall.mean(2).toFloat();  
            // originTensorSmallGray.print();
              
            const originTensorSmallGrayPrep = this.cropAndCenterImageTensor(originTensorSmallGray);

            const rgbTensor = tf.image.grayscaleToRGB(originTensorSmallGrayPrep);

            const fittedTensor = tf.image.resizeBilinear(rgbTensor, imageSmallSize);

            const fittedTensorGray = fittedTensor.mean(2).toFloat();
            const arrFitted = fittedTensorGray.arraySync();            
            for (let i=0; i < arrFitted.length; i++) {
                for (let j=0; j < arrFitted[i].length; j++) {
                    arrFitted[i][j] = arrFitted[i][j] > 100 ? 255 : 0;
                }
            }  

            // tf.tensor(arrFitted).print();
            
            const rgbTensorFited = tf.image.grayscaleToRGB(tf.tensor(arrFitted).expandDims(-1));

            return rgbTensorFited;
        })

        return originTensorSmallRgb;
    },  

    prepareImageTensorCNN (tensor) {   
        const originTensorSmallRgb = tf.tidy(() => {                        
            const originTensorSmall = tf.image.resizeNearestNeighbor(tensor, imageSmallCNNSize);    

            const originTensorSmallGray = originTensorSmall.mean(2).toFloat();  
            
            const originTensorSmallGrayPrep = this.cropAndCenterImageTensor(originTensorSmallGray);

            const rgbTensor = tf.image.grayscaleToRGB(originTensorSmallGrayPrep);

            const fittedTensor = tf.image.resizeBilinear(rgbTensor, imageSmallCNNSize);

            return fittedTensor;
        })

        return originTensorSmallRgb;
    },  
}