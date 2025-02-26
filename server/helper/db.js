const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = () => {
    mongoose.set('strictQuery', false); // Recommended for Mongoose 7+

    mongoose.connect('mongodb://127.0.0.1:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.once('open', () => {
        console.log('✅ MongoDB Connection Successful');
    });

    db.on('error', (err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });
};