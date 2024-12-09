import express from 'express';
import mapRoutes from './routes';

/**
 * The Express application instance.
 * @type {import('express').Express}
 */
const app = express();
app.use(express.json());
mapRoutes(app);
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
