const mongoose = require('mongoose');
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const url = "mongodb+srv://mmm:mmm@cluster0.gvyon.mongodb.net/mydb?appName=Cluster0"

// asynchronous function - returns Promise object
mongoose.connect(url)
    .then((result) => {
        console.log('database connected');
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = mongoose;