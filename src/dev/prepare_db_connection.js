const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://location_based_social_app_rw:gcyz2021@cluster0.kz6u1.mongodb.net/location-based-social-app-dev?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: true,
});

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
