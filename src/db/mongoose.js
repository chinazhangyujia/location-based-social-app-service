const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/location-based-social-app', {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true
})