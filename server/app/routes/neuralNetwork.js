import controller from "../controllers/neuralNetwork.js";

const baseUrl = "/api/neural-network";

export default (app) => {
  app.post(`${baseUrl}/predict`, controller.predict);    
  app.post(`${baseUrl}/predict-cnn`, controller.predictCNN);    
  app.post(`${baseUrl}/train`, controller.train);    
  app.post(`${baseUrl}/train-cnn`, controller.trainCNN);    
};