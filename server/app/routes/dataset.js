import controller from "../controllers/dataset.js";

const baseUrl = "/api/dataset";

export default (app) => {
  app.get(`${baseUrl}`, controller.list);

  app.post(baseUrl, controller.create);

  app.delete(`${baseUrl}/:id`, controller.delete);  
};