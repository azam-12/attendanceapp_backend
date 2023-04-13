const express = require('express')
const router = express.Router()
const Employee = require('../models/employee')
const { body, validationResult } = require('express-validator');

var fetchuser = require('../middleware/fetchuser')
// const EmpLocation = require('../models/empLocation')

const bcrypt = require('bcryptjs')


// Route 1:  Add user using push using : POST "/api/emp/addemployee". 
router.post('/addemployee', fetchuser, [
    body('name', 'Enter valid name').isLength({ min: 1 }),
    body('mobileNumber', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    // role and company fields are not keyed inputs
    body('company'),
    body('password'),
    body('role')
    
    // body('designation', 'Designation must be minimum 3 characters long').isLength({ min: 3 }),
    // body('department', 'Department name must be minimum 2 characters long').isLength({ min: 2 }),

], async (req, res) => {

    const userRole = req.user.user_role
    // user.user_role is a string datatype and same is defined in mongodb
    if (userRole === '1') {

        // If there are errors return bad requests and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check whether employee with this number exists already
            let employee = await Employee.findOne({ mobileNumber: req.body.mobileNumber })
            if (employee) {
                return res.status(400).json({ error: "Employee with this mobile number already exists, cannot add" })
            }

            // console.log('Password', req.body.password)

            // bcrpt.gensalt and bcrpt.hash returns a promise so await is used
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt)

            employee = await Employee.create({
                name: req.body.name,
                mobileNumber: req.body.mobileNumber,
                company: req.body.company,
                password: secPass,
                role: req.body.role,

                // designation: req.body.designation,
                // department: req.body.department,
            })

            res.json(employee)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Some error occured')
        }
    } else {
        res.status(401).send('Unauthorised user, access denied')
    }
})



// Route 2:  Get all employees using : GET "/api/emp/fetchallemployees". 
router.get('/fetchallemployees/:userCompany', fetchuser, async (req, res) => {

    // const userRole = '1'
    const userRole = req.user.user_role
    const companyName = req.params.userCompany

    

    // user.user_role is a string datatype and same is defined in mongodb
    // only admin can fetch all staff of his company only 
    if (userRole === '1') {
        try {
            // Check whether employee with this number exists already   , company: companyName     

            // when role is '0' then only employees and with admin's company only are selected
            const query = { role: '0', company: companyName }


            const employee = await Employee.find(query)
            if (!employee) {
                return res.status(400).json({ error: "No Employee added yet" })
            }
            res.json(employee)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Some error occured in fetchallemployees')
        }
    }
    else {
        res.status(401).send('Unauthorised user, access denied')
    }

})



// Route 3:  updating an existing employee using PUT "/api/emp/updateemployees". 
router.put('/updateemployee/:id/:loginid', fetchuser, async (req, res) => {

    //Since fetchallemployees api will fetch employees with admin's company staff only so we dont check company condition while update by
    // admin or employee

    const loginId = req.params.loginid
    const idToUpdate = req.params.id

    // got from fetchuser middleware
    const userRole = req.user.user_role

    // console.log(loginId)
    // console.log(userRole)

    // there are two checks 1st if role is 1 that is admin then he should be able to update any of his staff
    // other loggedin employee should be able to update only his own details which is the 2nd check 
    // user.user_role is a string datatype and same is defined in mongodb
    if (userRole === '1' || loginId === idToUpdate ) {
        try {
            // const { name, mobileNumber, designation, department } = req.body
            // const { staffName, staffNumber, staffEmailId } = req.body
            const { staffName, staffEmailId } = req.body

            // console.log(req.params.id)

            const newEmployee = {}
            if (staffName) { newEmployee.name = staffName }
            if (staffEmailId) { newEmployee.emailid = staffEmailId }
            // if (staffNumber) { newEmployee.mobileNumber = staffNumber }
            // if (designation) { newEmployee.designation = designation }
            // if (department) { newEmployee.department = department }

            // console.log(newEmployee)

            // Find the employee to be updated and update
            let employee = Employee.findById(req.params.id)
            if (!employee) { return res.status(404).send("Not found") }

            // If new content added then also it will update which is specified by last parameter in below line
            employee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true })

            res.json(employee)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Some error occured')
        }
    } else {
        res.status(401).send('Unauthorised user, access denied')
    }



})




// // Route 3:  updating an existing employee using PUT "/api/emp/updateemployees". 
// router.put('/updateemployee/:id', async (req, res) => {
//     try {

//         const { name, mobileNumber, designation, department } = req.body

//         const newEmployee = {}
//         if (name) { newEmployee.name = name }
//         if (mobileNumber) { newEmployee.mobileNumber = mobileNumber }
//         if (designation) { newEmployee.designation = designation }
//         if (department) { newEmployee.department = department }

//         // Find the employee to be updated and update
//         let employee = Employee.findById(req.params.id)
//         if (!employee) { return res.status(404).send("Not found") }

//         // If new content added then also it will update which is specified by last parameter in below line
//         employee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true })

//         res.json(employee)
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).send('Some error occured')
//     }
// })



// Route 4:  Delete an employee using DELETE"/api/emp/deleteemployee". 
router.delete('/deleteemploye/:id', fetchuser, async (req, res) => {

    //Since fetchallemployees api will fetch employees with admin's company staff only so we dont check company condition while deleting
    // employee by admin

    const userRole = req.user.user_role
    // user.user_role is a string datatype and same is defined in mongodb
    if (userRole === '1') {
        try {

            // Find the employee to be deleted and delete
            let employee = Employee.findById(req.params.id, function (err, employee) {
                if (err) {
                    // return next('addEmployee delete route block: ', err)
                    return res.status(404).send("Invalid id or Not found")
                }

                if (!employee) { return res.status(404).send("Id Not found") }

                employee.remove()
                res.json({ "Success": "Employee has been deleted" })
            })
            // if (!employee) { return res.status(404).send("outside : Not found") }

        } catch (error) {
            console.log(error.message)
            res.status(500).send('Some error occured')
        }
    } else {
        res.status(401).send('Unauthorised user, access denied')
    }
})





module.exports = router