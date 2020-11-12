const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/location-based-social-app', {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true
})

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);