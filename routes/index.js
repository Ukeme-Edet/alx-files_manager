import AppController from '../controllers/AppController';

/**
 * Maps the routes to the provided Express application instance.
 *
 * @param {Object} app - The Express application instance.
 */
const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};
export default mapRoutes;
