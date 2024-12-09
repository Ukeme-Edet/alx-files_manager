import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

/**
 * Maps the routes to the provided Express application instance.
 *
 * @param {Object} app - The Express application instance.
 */
const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
};
export default mapRoutes;
