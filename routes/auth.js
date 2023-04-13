const express = require('express')
const router = express.Router()
const Employee = require('../models/employee')
const { body, validationResult } = require('express-validator');
const EmpLocation = require('../models/empLocation');
const bcrypt = require('bcryptjs')
// const { json } = require('express');

var fetchuser = require('../middleware/fetchuser')
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Attendanceappfor$epit';


const mongoose = require('mongoose');


require("dotenv").config();


// host: 'localhost',
// port: 1025
// email password for mailfromstore@gmail.com : store@123

const nodemailer = require('nodemailer')


// Route 1: Create User using : POST "/api/auth/ctreateuser". No login required. 
router.post('/createuser', [
    body('mobileNumber', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('company', 'Enter a valid company name').isLength({ min: 3 }),
    body('emailid', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8, max: 16 })
],
    async (req, res) => {

        let success = false;
        // If there are errors, then return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        // console.log('Mobile: ', req.body.mobileNumber)

        try {
            let user = await Employee.findOne({ mobileNumber: req.body.mobileNumber })
            // console.log(user)
            if (user) {
                return res.status(400).json({ success, error: "User with this mobile number already exists! Cannot create this user" });
            }

            // bcrpt.gensalt and bcrpt.hash returns a promise so await is used
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt)

            //  Create a new user
            //  We insert role to '1' since this user will be admin
            user = await Employee.create({
                mobileNumber: req.body.mobileNumber,
                name: req.body.name,
                company: req.body.company,
                emailid: req.body.emailid,
                role: '1',
                password: secPass
            })

            const data = {
                user: {
                    user_mobileNumber: user.mobileNumber,
                    user_role: user.role
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET)
            success = true;

            res.json({
                success,
                user_id: user._id, user_name: user.name, user_mobileNumber: user.mobileNumber,
                user_emailid: user.emailid, user_company: user.company, user_role: user.role, token: authtoken
            })
            // console.log(json)
        } catch (error) {
            console.log('login error :', error.message)
            res.status(500).send("Internal Server Error")
        }
    }
)




// Route 2: Authenticate a User using : POST "/api/auth/login". No login required. We retrieve user_id and user_name and after call store
//  them in asyncstorage variables @user_id and @user_name respectively when user enter his number during first login
router.post('/login', [
    body('mobileNumber', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('password', 'Enter a valid password').isLength({ min: 8, max: 16 })
],
    async (req, res) => {

        try {
            let success = false;
            // If there are errors, then return bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success, errors: errors.array() });
            }

            // console.log('Mobile: ',req.body.mobileNumber)
            const { mobileNumber, password } = req.body


            let user = await Employee.findOne({ mobileNumber })
            // console.log(user.password)
            if (!user) {
                return res.status(400).json({ success, error: "No user with this mobile number." });
            }


            const passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res.status(400).json({ success, error: "Please try to login with correct credentials." });
            }

            const data = {
                user: {
                    user_mobileNumber: user.mobileNumber,
                    user_role: user.role
                }
            }

            // console.log(user)

            const authtoken = jwt.sign(data, JWT_SECRET)
            success = true
            // console.log(success)
            res.json({
                success,
                user_id: user._id, user_name: user.name, user_mobileNumber: user.mobileNumber,
                user_emailid: user.emailid, user_company: user.company, user_role: user.role, token: authtoken
            })

            // res.json({ success, authtoken})

            // console.log(json)  dont console here otherwise you will receive error
        } catch (error) {
            console.log('login error :', error.message)
            res.status(500).json("Internal Server Error")
        }
    }
)





// Route 3: Get all the fields of single Staff for that admin  : POST "/api/auth/staffdetails". Login required.
// This method is used at 2 places : 
// by admin login to update employee email id and name on home page
// by profile page when admin updates his 2 fields and we need to store the modified fields back to asyncStorage variables
// by profile page when employee updates his 2 fields and we need to store the modified fields back to asyncStorage variables
// profile page is shared by admin(role == '1' ) and employee(role == '0' ) logins
router.post('/staffdetails', fetchuser, [
    // body('mobileNumber', 'Enter a valid mobile number').isLength({ min: 10, max: 10 })
    body('mobileNumber')
],
    async (req, res) => {

        // Get all the details 
        try {
            let user = await Employee.findOne({ mobileNumber: req.body.mobileNumber })
            // console.log(user)

            // dont require if condition since it will be the selected staff from staff list.
            if (!user) {
                return res.status(400).json({ success, error: "No user with this mobile number." });
            }

            res.json({
                user_id: user._id, user_name: user.name, user_mobileNumber: user.mobileNumber,
                user_emailid: user.emailid, user_company: user.company
            })

            // console.log(json)
        } catch (error) {
            console.log('login error :', error.message)
            res.status(500).send("Internal Server Error")
        }
    }
)




// Route 4: Get the current user's punchIn and PunchOut status by passing userId and id  : POST "/api/auth/fetchstatus". No login required.
// This api takes current day, employee id and punchOutStatus as 'Punch_Out_Pending' as parameters and us return punchIn, 
// punchOut status with that relevant id 
router.post('/status', fetchuser, [
    body('ownerId'),
    body('punchOutStatus'),
    body('date')
],
    async (req, res) => {

        try {
            const query = { ownerId: req.body.ownerId, date: req.body.date, punchOutStatus: 'Punch_Out_Pending' };

            // here punchInStatus: 1 means we want this field and punchInStatus: 0 means we don't need the field
            const projection = { punchInStatus: 1, punchOutStatus: 1, _id: 1 }

            let data = await EmpLocation.findOne(query, projection)
            if (data === null) {
                res.json({ punchInStatus: 'new_document', punchOutStatus: 'new_document', _id: 'new_document' })
                // return res.status(400).json({ success, error: "No user with this mobile number." });
            } else {
                res.json(data)
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).send("Internal Server Error")
        }
    }
)





// Route 5: Get the attendance data using user_id, from_date and to_date  : POST "/api/auth/report"
router.post('/report', fetchuser, [
    // body('employee'),    // since we need data for all employees and not single so we comment this
    body('from'),
    body('to'),
    body('company')
],
    async (req, res) => {

        try {
            // const { employee, from, to } = req.body  // since we need data for all employees and not single so we comment this
            const { from, to, company } = req.body


            // need to do it otherwise below comparison of $gte and $lte is not possible
            const fromDate = new Date(from);
            fromDate.setUTCHours(0, 0, 0, 0);
            fromDate.toISOString()
            // console.log(fromDate)

            // need to do it otherwise below comparison of $gte and $lte is not possible
            const toDate = new Date(to);
            toDate.setUTCHours(0, 0, 0, 0);
            toDate.toISOString()
            // console.log(toDate)


            //query has 5 parts in first data is filtered as per dates 2. join operation is done between 2 collections and userInfo array
            //  is created which shows documents from employee collection 3. unwind is used to flatters this userInfo array 4. addFields 
            // is used to add required fields from userInfo array 5. project is done just to minimize fields that are not required 
            let data = await EmpLocation.aggregate([
                {
                    $match:
                    {
                        date: { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $lookup:
                    {
                        from: "employees",
                        localField: 'ownerId',
                        foreignField: "_id",
                        as: "userInfo"
                    }
                },
                {
                    $unwind: '$userInfo'
                },
                {
                    $addFields: {
                        name: '$userInfo.name',
                        mobileNumber: '$userInfo.mobileNumber',
                        companyName: '$userInfo.company'
                    }
                },
                {
                    $match:
                    {
                        companyName: { $eq: company }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        employee: 0,
                        __v: 0,
                        userInfo: 0
                    }
                }
            ]).sort({ date: -1 })
            // console.log(data)




            // let data = await EmpLocation.aggregate([
            //     {
            //         $match:
            //         {
            //             date: { $gte: fromDate, $lte: toDate }
            //         }
            //     },
            //     {
            //         $lookup:
            //         {
            //             from: "employees",
            //             localField: 'ownerId',
            //             foreignField: "_id",
            //             as: "userInfo"
            //         }
            //     },
            //     {
            //         $unwind: '$userInfo'
            //     },
            //     {
            //         $addFields: {
            //             name: '$userInfo.name',
            //             mobileNumber: '$userInfo.mobileNumber',
            //             companyName: '$userInfo.company'
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 0,
            //             employee: 0,
            //             __v: 0,
            //             userInfo: 0
            //         }
            //     }
            // ]).sort({ date: -1 })
            // console.log(data)



            //  old code for query
            //   let data = await EmpLocation.find({ 
            //     $and: [ 
            //         {employee:  mongoose.Types.ObjectId(employee)},
            //         {date : { $gte: dfrom,  $lte: dto }}
            //     ]               
            //   })
            //   .sort({ date: -1 })


            if (data === null) {
                // res.json({punchInStatus: 'new_document', punchOutStatus: 'new_document', _id: 'new_document'})
                return res.status(400).json({ success, error: "No user with this mobile number." });
            } else {
                res.json(data)
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).send("Internal Server Error")
        }
    }
)


// Gmail Settings
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     service: 'gmail',
//     secure: true,
//     port: 465,
//     auth: {
//         user: "mailfromstore6@gmail.com",
//         pass: "dzpiicbvgvogakow"
//     }
// });





const transporter = nodemailer.createTransport({
    host: process.env.HOSTNAME,
    port: process.env.MAILPORT,
    service: process.env.MAILSERVICE,
    secure: true,
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
    }
});


// const port = ':5000'                     //  when on laptop
// const host = process.env.HOST + port     //  when on laptop   


const host = process.env.HOST               //  when up

// Route 6: Forgot password link take email and mobile no as input and sent the reset password link to email id  : POST "/api/auth/forgot"
router.post('/forgot', [
    body('mobileNumber', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('emailid', 'Enter a valid password').isEmail()
],
    async (req, res) => {

        try {
            let success = false;
            // If there are errors, then return bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success, errors: errors.array() });
            }

            // console.log('Mobile: ',req.body.mobileNumber)
            const { mobileNumber, emailid } = req.body

            let user = await Employee.findOne({ mobileNumber })
            const id = user.id         //  Send this id into link and receive at reset password api
            // console.log(user.password)
            // console.log(user.id)

            // Since we have to generate the link which can be used only ont time we append the user hashed pasasword with JWT_SECRET
            const oneTimeToken = JWT_SECRET + user.password

            if (!user) {
                return res.status(400).json({ success, error: "No user with this mobile number." });
            }

            const newEmployee = {}
            if (emailid) { newEmployee.emailid = emailid }
            user = await Employee.findByIdAndUpdate(user.id, { $set: newEmployee }, { new: true })

            // console.log(user)
            // set success true because user is valid
            success = true

            const data = {
                user: {
                    user_mobileNumber: user.mobileNumber,
                    user_role: user.role
                }
            }
            const authtoken = jwt.sign(data, oneTimeToken)      //      , {expiresIn: '10m'}

            // const url = `https://${host}/reset/${id}/${authtoken}`       //  when on laptop
            const url = `${host}/reset/${id}/${authtoken}`          // when up


            const info = await transporter.sendMail({
                from: 'azam@electropotentinfotech.com',
                to: emailid,
                subject: 'Reset your Password! - Attendance App',
                html: `Dear ${user.name},<br><br>
                        Click <a href="${url}">here</a> to reset your password! <br><br><br>
                        This is autogenerated email, please do not reply.
                        <br><br>
                        Thank you,<br>
                        Admin`
            })
            // console.log('Mail transporter info :', info.messageId)


            res.json({
                message: 'One time link has been sent to your email id which is valid for 10 minutes!',
                success,
                user_id: user._id, user_name: user.name, user_mobileNumber: user.mobileNumber,
                user_emailid: user.emailid, user_company: user.company, user_role: user.role, token: authtoken
            })

            // res.send({
            //     message: 'One time link has been sent to your email id which is valid for 10 minutes!'
            // })

        } catch (error) {
            console.log('forgot password submit :', error.message)
            res.status(500).json("Internal Server Error")
        }

    }
)



// Route 7: Reset Password route take in new password and save to database : POST "api/auth/reset/"
// router.post('/reset/:id/:authtoken',  
router.post('/reset/:id/:authtoken',
    [
        body('password')
    ],
    async (req, res) => {

        // if (req.body.password !== req.body.confirmpassword) {
        //     return res.status(400).send({
        //         message: 'Passwords do not match!'
        //     })
        // }

        const token = req.params.authtoken
        try {
            const employee = await Employee.findOne({ _id: req.params.id })
            // console.log(employee)

            // Since we have to generate the link which can be used only ont time we append the user hashed pasasword with JWT_SECRET
            const oneTimeToken = JWT_SECRET + employee.password

            const payload = jwt.verify(token, oneTimeToken)
            // console.log(payload)

            // bcrpt.gensalt and bcrpt.hash returns a promise so await is used
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(req.body.password, salt)
            employee.save()

            res.send({
                message: 'Password updated successfully! Login with new password to continue.'
            })


        } catch (error) {
            console.log('Inside Auth - reset API', error.message)
            // res.send(error.message)
            res.send({
                message: 'Invalid token!'
            })

        }


    }
)

module.exports = router;