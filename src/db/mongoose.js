const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: true,
});

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
