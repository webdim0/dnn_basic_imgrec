import controller from "../controllers/neuralNetwork.js";

const baseUrl = "/api/neural-network";

export default (app) => {
  app.post(`${baseUrl}/predict`, controller.predict);    
  app.post(`${baseUrl}/train`, controller.train);    
};