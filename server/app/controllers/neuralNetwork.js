import imageOperator from '../services/imageOperator.js';
import neuralNetwork from '../services/neuralNetwork.js';

export default {
    
    async predict (req, res) {        
        let data = {};
        let status = 'ok';    
            
        let imgBodyBase64 = req.body.img;        

        const imgFileName = await imageOperator.saveOriginal(imgBodyBase64, 'X', 'predict');

        imageOperator.saveForDataset(imgFileName, 'predict');
        
        data = await neuralNetwork.predict(imgFileName);

        imageOperator.deleteAllPredict(imgFileName);
                
        res.status(status == 'ok' ? 200 : 400).send({status, data});
    },

    async train (req, res) {        
        let data = {};
        let status = 'ok';
    
        data = await neuralNetwork.train();

        res.status(status == 'ok' ? 200 : 400).send({status, data});
    },

}