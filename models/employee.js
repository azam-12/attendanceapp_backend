const mongoose = require('mongoose')
const { Schema } = mongoose;

var EmpLocation = require('./empLocation')


const EmployeeSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  mobileNumber: {
    type: String,
    require: true,
    unique: true,
  },
  emailid: {
    type: String,
    default: 'abc@example.com',
  },
  company: {
    type: String,
    // default: 'NA',
    require: true
  },
  role: {
    type: String,
    default: 0,     //  0 is for emplyee, 1 is for admin
  },
  password: {
    type: String,
    require: true
  },

  designation: {
    type: String,
    default: 'EMP',
    // require: true
  },
  department: {
    type: String,
    default: 'NA',
    // require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// when employee is deleted below function will delete all its foreign key documents in emplocation collection
EmployeeSchema.pre('remove', async function (next) {
    const employee = this
    await EmpLocation.deleteMany({ ownerId: employee._id })
    next()
})


module.exports = mongoose.model('employee', EmployeeSchema)