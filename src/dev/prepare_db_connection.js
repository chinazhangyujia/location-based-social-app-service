const mongoose = require('mongoose');

const connectToDB = (env) => {
  const mongodbUrl = env === 'PRODUCTION'
    ? 'mongodb+srv://location_based_social_app_rw:gcyz2021@cluster0.n1t8f.mongodb.net/location-based-social-app-production?retryWrites=true&w=majority'
    : 'mongodb+srv://location_based_social_app_rw:gcyz2021@cluster0.kz6u1.mongodb.net/location-based-social-app-dev?retryWrites=true&w=majority';
  mongoose.connect(mongodbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
  });

  mongoose.set('useFindAndModify', false);
  mongoose.set('useUnifiedTopology', true);
};

module.exports = connectToDB;
