const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDb1, connectDb2,connectDb3 ,connectDb4,connectDb5} = require('./utils/getConnection'); // Import connection functions
const userRoutes = require('./routes/user');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);

// Global error handler
app.use((error, req, res, next) => {
    const message = error.message || "Server error";
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: message });
});

// Database connections
const db1 = connectDb1();
const db2 = connectDb2();
const db3=connectDb3();
const db4=connectDb4();
const db5=connectDb5();



db1.once('open', () => {
    console.log('Database connection to db1 established successfully.');
});

db2.once('open', () => {
    console.log('Database connection to db2 established successfully.');
});
db3.once('open', () => {
    console.log('Database connection to db3 established successfully.');
});
db4.once('open', () => {
    console.log('Database connection to db4 established successfully.');
});
db5.once('open', () => {
    console.log('Database connection to db5 established successfully.');
});
db1.on('error', console.error.bind(console, 'db1 connection error:'));
db2.on('error', console.error.bind(console, 'db2 connection error:'));
db3.on('error', console.error.bind(console, 'db3 connection error:'));
db4.on('error', console.error.bind(console, 'db4 connection error:'));
db5.on('error', console.error.bind(console, 'db5 connection error:'));

// Server setup
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});
