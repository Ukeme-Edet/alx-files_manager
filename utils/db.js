import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
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

  isAlive() {
    return !!this.db;
  }

  nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}
const dbClient = new DBClient();
export default dbClient;
