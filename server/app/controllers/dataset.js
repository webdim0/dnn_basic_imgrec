import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import imageOperator from '../services/imageOperator.js';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.resolve(__dirname, `../../public/${process.env.DATASET_FILE}`);

export default {    
    async list (req, res) {
        let status = 'ok';
        let data = [];

        return new Promise(resolve => {
            fs.readFile(dataFile, 'utf8', (err, fileData) => {
                if (err) {                    
                    status = 'error';                    
                    reject(err);
                }
                data = JSON.parse(fileData);
                res.status(status == 'ok' ? 200 : 404).send({status, data});
                resolve(res);
            });                 
        });              
    },
    
    async create (req, res) {        
        let data = {};
        let status = 'ok';   
        
        return new Promise(async (resolve, reject) => {
            let imgBodyBase64 = req.body.img;
            const label = req.body.label;    

            const imgFileName = await imageOperator.saveOriginal(imgBodyBase64, label);

            imageOperator.saveForDataset(imgFileName);

            fs.readFile(dataFile, 'utf8', (err, fileData) => {
                if (err) {                    
                    status = 'error';                    
                    reject(err);
                }
                const dataSet = JSON.parse(fileData);
                data = {
                    "id": uuid(),
                    "value": label,
                    "img": imgFileName,
                    "ts": Date.now()
                };
                dataSet.push(data);
                fs.writeFile(dataFile, JSON.stringify(dataSet, null, 4), 'utf8', err => {
                    if (err) {
                        reject(err);
                    }
                    res.status(status == 'ok' ? 200 : 404).send({status, data});
                    resolve(res);
                });                                
            });
        });                
    },

    async delete (req, res) {        
        const id = req.params.id;        
        let data = {};
        let status = 'ok';

        return new Promise((resolve, reject) => {
            fs.readFile(dataFile, 'utf8', (err, fileData) => {
                if (err) {                    
                    status = 'error';                    
                    reject(err);
                }
                let dataSet = JSON.parse(fileData);
                const delItem = dataSet.filter(item => item.id == id)[0];
                dataSet = dataSet.filter(item => item.id != id);
                fs.writeFile(dataFile, JSON.stringify(dataSet, null, 4), 'utf8', err => {
                    if (err) {
                        status = 'error';                    
                        reject(err);
                    }
                    imageOperator.deleteAllOrigin(delItem.img);            

                    res.status(status == 'ok' ? 200 : 404).send({status, data});
                    resolve(res);
                });                                
            });            
        });        
    }
}