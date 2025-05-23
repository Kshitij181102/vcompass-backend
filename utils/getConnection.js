// utils/getConnection.js
const mongoose = require("mongoose");

const db1Uri = process.env.MONGO_URI1;
let db1Connection = null;

// Singleton connection for db1 creating user
const connectDb1 = () => {
  if (!db1Connection) {
    db1Connection = mongoose.createConnection(db1Uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db1 connection established");
  }
  return db1Connection;
};

// For db2, keep it as-is Booking database
const db2Uri = process.env.MONGO_URI2;
const connectDb2 = () => {
  return mongoose.createConnection(db2Uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
};

const db3Uri = process.env.MONGO_URI3;
// used for the mentor
const connectDb3 = () => {
  return mongoose.createConnection(db3Uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
//useed for the news
const db4Uri = process.env.MONGO_URI4;
const connectDb4 = () => {
  return mongoose.createConnection(db4Uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
// used for the poster
const db5Uri = process.env.MONGO_URI5;
const connectDb5 = () => {
  return mongoose.createConnection(db5Uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};



module.exports = { connectDb1, connectDb2,connectDb3,connectDb4,connectDb5  };
