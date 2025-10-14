const mongoose = require('mongoose');


const database = async () => {
  await mongoose.connect(process.env.DB_LINK)
}

module.exports = database;
