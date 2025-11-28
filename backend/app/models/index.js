const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url; // <- now reads MONGO_URL if set
db.tutorials = require("./tutorial.model.js")(mongoose);

module.exports = db;
// const dbConfig = require("../config/db.config.js");

// const mongoose = require("mongoose");
// mongoose.Promise = global.Promise;

// const db = {};
// db.mongoose = mongoose;
// db.url = dbConfig.url;
// db.tutorials = require("./tutorial.model.js")(mongoose);

// module.exports = db;
