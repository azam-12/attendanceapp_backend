const mongoose = require('mongoose')

require("dotenv").config();
const mongoURI = process.env.MONGO_URI
// console.log('Mongo_URI', mongoURI)

const connectToMongo = async() => {
    mongoose.connect(mongoURI, () => {
        console.log('Connected to mongo Successfully')
    })
}


module.exports = connectToMongo;