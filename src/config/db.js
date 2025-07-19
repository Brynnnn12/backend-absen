const mongoose = require('mongoose');
const { logger } = require('../utils');

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    logger.logError('MongoDB connection failed', error);
    process.exit(1); // Exit the process with failure
  }
};
