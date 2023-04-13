const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')		//  required for cors policy
const path = require('path')


require("dotenv").config();
const host = process.env.HOST


connectToMongo()
const app = express()
const port = 5000
// const port = 19000

app.use(cors())				//  required for cors policy
app.use(express.json())



//Available routes


app.get('/reset/:id/:authtoken', function(req, res) {
  res.sendFile(path.join(__dirname, 'Views', '/ResetPassword.html'))
})

// app.get('/reset/:authtoken', function(req, res) {
//   res.sendFile(path.join(__dirname, '/ResetPassword.html'))
// })


//Add, delete or update empployee
app.use('/api/emp/', require('./routes/addEmployee'))

//Add, delete or update empployee location
app.use('/api/emplocation/', require('./routes/addEmpLocation'))
 
//Check employee authentication
app.use('/api/auth/', require('./routes/auth'))


// const host = 'http://192.168.1.102'
app.listen(port, () => {
  console.log(`Attendance Backend listening at ${host}:${port}`)
}) 



module.exports = app;			//  written for Lambda function requirements 

