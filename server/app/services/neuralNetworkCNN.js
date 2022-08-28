import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tf, { ceil } from '@tensorflow/tfjs-node';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.resolve(__dirname, `../../public/${process.env.DATASET_FILE}`);
const imgsDir = path.resolve(__dirname, `../../public/${process.env.IMGS_DIR}`);
const imgsPredictDir = path.resolve(__dirname, `../../public/${process.env.IMGS_PREDICT_DIR}`);
const tfModelDir = path.resolve(__dirname, `../../public/${process.env.TF_MODEL_CNN_DIR}`);

const imageSmallSize = process.env.IMAGE_SMALL_CNN_SIZE.split(' ');
const MAX_IMG_CODE = 255;
const NUM_IMG_CLASSES = 10;
const BATCH_SIZE = 10;
const IMAGE_WIDTH = parseInt(imageSmallSize[0]);
const IMAGE_HEIGHT = parseInt(imageSmallSize[1]);
const IMAGE_CHANNELS = 1;

export default {
    async predict (imgFileName) {        
        const model = await tf.loadLayersModel(`file://${tfModelDir}/model.json`);
        return new Promise ((resolve, reject) => {
            fs.readFile(`${imgsPredictDir}/prepared_cnn/${imgFileName}`, (err, image) => {
                if (err) {
                    reject(err);
                }
                const tensor = tf.node.decodePng(image, 1);                 
                const predictTensor = tf.tensor4d(tf.util.flatten(tensor.toFloat().arraySync()), [1, IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS])
                            .div(tf.scalar(MAX_IMG_CODE));                
                const resultTensor = model.predict(predictTensor);
                resultTensor.print();
                const resultTensorArr = resultTensor.arraySync()[0];
                console.log('Prediction:');
                resultTensor.print();
                const resultValue = Math.max(...resultTensorArr);
                const label = resultTensorArr.indexOf(resultValue);
                
                resolve({label, resultValue});
            });
        });           
    },

    async train () {
        const model = tf.sequential();
        
        // In the first layer of our convolutional neural network we have 
        // to specify the input shape. Then we specify some parameters for 
        // the convolution operation that takes place in this layer.
        model.add(tf.layers.conv2d({
            inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
            kernelSize: 5,
            filters: 8,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));

        // The MaxPooling layer acts as a sort of downsampling using max values
        // in a region instead of averaging.  
        model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
        
        // Repeat another conv2d + maxPooling stack. 
        // Note that we have more filters in the convolution.
        model.add(tf.layers.conv2d({
            kernelSize: 5,
            filters: 16,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));
        model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
        
        // Now we flatten the output from the 2D filters into a 1D vector to prepare
        // it for input into our last layer. This is common practice when feeding
        // higher dimensional data to a final classification output layer.
        model.add(tf.layers.flatten());

        // Our last layer is a dense layer which has 10 output units, one for each
        // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
        model.add(tf.layers.dense({
            units: NUM_IMG_CLASSES,
            kernelInitializer: 'varianceScaling',
            activation: 'softmax'
        }));
        
        // Choose an optimizer, loss function and accuracy metric,
        // then compile and return the model
        //const optimizer = tf.train.adam();
        model.compile({
            optimizer: tf.train.adam(),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        let xs = [];
        const ys = [];

        const dataSet = JSON.parse(fs.readFileSync(dataFile));        
        for (const data of dataSet) {                        
            tf.tidy(() => {    
                const image = fs.readFileSync(`${imgsDir}/prepared_cnn/${data.img}`);
                const tensor = tf.node.decodePng(image, 1);                      
                xs = xs.concat(tf.util.flatten(tensor.toFloat().arraySync()));
                const labels = new Array(10).fill(0);
                labels[parseInt(data.value)] = 1;
                ys.push(labels);
            });
        }
        const imgsCount = xs.length/(IMAGE_WIDTH*IMAGE_HEIGHT*IMAGE_CHANNELS);        
        
        const trainXs = tf.tensor4d(xs, [imgsCount, IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS])
                            .div(tf.scalar(MAX_IMG_CODE));        
        const trainYs = tf.tensor2d(ys);        

        // console.log(trainXs.arraySync()[0]);
        // console.log(trainXs.shape, trainYs.shape);
        
        console.time('cnn-train-time');
        const m = await model.fit(trainXs, trainYs, {
                    batchSize: BATCH_SIZE,                    
                    // validationData: [testXs, testYs],
                    epochs: 20,
                    shuffle: true,
                    // callbacks: fitCallbacks
                });        
        console.timeEnd('cnn-train-time');
        
        model.save(`file://${tfModelDir}`);
    }
}