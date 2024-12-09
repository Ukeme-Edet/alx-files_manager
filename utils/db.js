import { MongoClient } from 'mongodb';

/**
 * DBClient class to manage database connections and operations.
 */
class DBClient {
  /**
     * Creates an instance of DBClient and connects to the MongoDB database.
     */ constructor() {
    this.db = null;
    MongoClient.connect(
      `mongodb://${process.env.DB_HOST || 'localhost'}:${
        process.env.DB_PORT || 27017
      }`,
      { useUnifiedTopology: true },
      (err, client) => {
        if (err) console.log(err);
        this.db = client.db(process.env.DB_DATABASE || 'files_manager');
      },
    );
  }

  /**
     * Checks if the database connection is alive.
     * @returns {boolean} True if the database connection is alive, otherwise false.
     */
  isAlive() {
    return !!this.db;
  }

  /**
     * Gets the number of users in the database.
     * @returns {Promise<number>} The number of users in the database.
     */
  nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
     * Gets the number of files in the database.
     * @returns {Promise<number>} The number of files in the database.
     */
  nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}
const dbClient = new DBClient();
export default dbClient;
