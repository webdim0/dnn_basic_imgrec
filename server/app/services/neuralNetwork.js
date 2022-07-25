import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tf from '@tensorflow/tfjs-node';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.resolve(__dirname, `../../public/${process.env.DATASET_FILE}`);
const imgsDir = path.resolve(__dirname, `../../public/${process.env.IMGS_DIR}`);
const imgsPredictDir = path.resolve(__dirname, `../../public/${process.env.IMGS_PREDICT_DIR}`);
const tfModelDir = path.resolve(__dirname, `../../public/${process.env.TF_MODEL_DIR}`);

const imageSmallSize = process.env.IMAGE_SMALL_SIZE.split(' ');
const tenzorSize = imageSmallSize[0]*imageSmallSize[1];
const MAX_IMG_CODE = 255;
const NUM_IMG_CLASSES = 10;

export default {
    async predict (imgFileName) {        
        const model = await tf.loadLayersModel(`file://${tfModelDir}/model.json`);
        return new Promise ((resolve, reject) => {
            fs.readFile(`${imgsPredictDir}/prepared/${imgFileName}`, (err, image) => {
                if (err) {
                    reject(err);
                }
                const tensor = tf.node.decodePng(image); 
                const tensorFlat = tensor.mean(2).toFloat();
                const predictTensor = tf.tensor2d(tf.util.flatten(tensorFlat.arraySync()), [1, tenzorSize]).div(tf.scalar(MAX_IMG_CODE));        
                const resultTensor = model.predict(predictTensor);
                const resultTensorArr = resultTensor.arraySync()[0];
                console.log('Prediction:');
                resultTensor.print();
                const resultValue = Math.max(...resultTensorArr);
                const label = resultTensorArr.indexOf(resultValue);
                // const resultValue = resultTensor.arraySync()[0][0];
                
                resolve({label, resultValue});
            });
        });           
    },

    async saveForDataset (imgFileName) {        
        
        const originImage = fs.readFileSync(`${imgsDir}/origin/${imgFileName}`)        

        tf.tidy(() => {            
            const originTensor = tf.node.decodePng(originImage);
            const originTensorSmall = tf.image.resizeNearestNeighbor(originTensor, imageSmallSize);
            const originTensorSmallGray = originTensorSmall.mean(2).toFloat();
            const originTensorSmallGrayPrep = originTensorSmallGray.expandDims(-1);
            const originTensorSmallRgb = tf.image.grayscaleToRGB(originTensorSmallGrayPrep);              
            tf.node.encodePng(originTensorSmallRgb).then( savePng => {
                fs.writeFile(`${imgsDir}/prepared/${imgFileName}`, savePng, err => {
                    if (err) console.log(err);                    
                });
            });
        })

        return imgFileName;
    },    

    async train () {
        const model = tf.sequential();

        model.add(tf.layers.dense({inputShape: [tenzorSize], units: 32, activation: 'relu'})); 
        model.add(tf.layers.dense({units: 16, activation: 'relu'}));  
        model.add(tf.layers.dense({units: 32, activation: 'relu'}));  
        model.add(tf.layers.dense({units: 16, activation: 'relu'}));  
        model.add(tf.layers.dense({units: NUM_IMG_CLASSES, activation: 'softmax'}));

        model.compile({
          optimizer: tf.train.adam(),
          loss: 'sparseCategoricalCrossentropy',
          metrics: ['accuracy']
        });
        
        const xs = [];
        const ys = [];

        const dataSet = JSON.parse(fs.readFileSync(dataFile));

        for (const data of dataSet) {            
            tf.tidy(() => {    
                const image = fs.readFileSync(`${imgsDir}/prepared/${data.img}`);
                const tensor = tf.node.decodePng(image);                 
                const tensorFlat = tensor.mean(2).toFloat();                
                xs.push(tf.util.flatten(tensorFlat.arraySync()));
                ys.push(parseFloat(data.value));                
            })
        }
        
        const xsT = tf.tensor2d(xs).div(tf.scalar(MAX_IMG_CODE));
        const ysT = tf.tensor2d(ys, [ys.length, 1]);
        
        // Train the model using the data.
        for (let i = 1; i < 50 ; ++i) {            
            const h = await model.fit(xsT, ysT);
            console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);            
        }

        model.save(`file://${tfModelDir}`);
    }
}