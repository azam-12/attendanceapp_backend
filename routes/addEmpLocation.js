const express = require('express')
const router = express.Router()
// const empLocation = require('../models/EmpLocation')
const { body} = require('express-validator');
const EmpLocation = require('../models/empLocation');


var fetchuser = require('../middleware/fetchuser')


// Route 1:  Add employee punchIn location using push using : POST "/api/emplocation/addPunchInLocation". 
router.post('/addPunchInLocation', fetchuser, [
    body('punchInLat'),
    body('punchInLon'),
    body('punchInAlt'),
    body('punchInTime'),
    body('punchInStatus'),
    body('punchInLocation'),
    body('punchOutLat'),
    body('punchOutLon'),
    body('punchOutAlt'),
    body('punchOutTime'),
    body('punchOutStatus'),
    body('punchOutLocation'),
    body('ownerId')
], async (req, res) => {

    // Since these values are not taken from user so no validation is required, the values are saved when user punch-ins
    try {
        // let empLocation = await EmpLocation.create({
        //     punchInLat: req.body.punchInLat,
        //     punchInLon: req.body.punchInLon,
        //     punchInAlt: req.body.punchInAlt,
        //     punchInTime: req.body.punchInTime,
        //     punchInStatus: req.body.punchInStatus,
        // })
        // const {punchInLat, punchInLon, punchInAlt, punchInTime, punchInStatus, punchInLocation, ownerId} = req.body
        // const empLocation = new EmpLocation({punchInLat, punchInLon, punchInAlt, punchInTime, punchInStatus, punchInLocation, ownerId})
        // empLocation.save()

        const empLocation = await EmpLocation.create({
            punchInLat: req.body.punchInLat,
            punchInLon: req.body.punchInLon,
            punchInAlt: req.body.punchInAlt,
            punchInTime: req.body.punchInTime,
            punchInStatus: req.body.punchInStatus,
            punchInLocation: req.body.punchInLocation,
            ownerId: req.body.ownerId
        })
        
        res.json(empLocation)

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some error occured')
    }
})



// Route 2:  Update employee punchOut location using push using : PUT "/api/emplocation/addPunchOutLocation". 
router.put('/addPunchOutLocation', fetchuser, [
    // body('punchOutLat'),
    // body('punchOutLon'),
    // body('punchOutAlt'),
    // body('punchOutTime'),
    // body('punchOutStatus'),
    body('punchOutLat'),
    body('punchOutLon'),
    body('punchOutAlt'),
    body('punchOutTime'),
    body('punchOutStatus'),
    body('punchOutLocation'),
    // body('attendanceMarked'),
    body('_id')
], async (req, res) => {

    // Since these values are not taken from user so no validation is required, the values are saved when user punch-ins
    try {
        const {punchOutLat, punchOutLon, punchOutAlt, punchOutTime, punchOutStatus, punchOutLocation, _id} = req.body
        // const empLocation = new EmpLocation({punchOutLat, punchOutLon, punchOutAlt, punchOutTime, punchOutStatus, _id})
        const punchOutLocationDetails = {}
        if (punchOutLat) { punchOutLocationDetails.punchOutLat = punchOutLat }
        if (punchOutLon) { punchOutLocationDetails.punchOutLon = punchOutLon }
        if (punchOutAlt) { punchOutLocationDetails.punchOutAlt = punchOutAlt }
        if (punchOutTime) { punchOutLocationDetails.punchOutTime = punchOutTime }
        if (punchOutStatus) { punchOutLocationDetails.punchOutStatus = punchOutStatus }
        if (punchOutLocation) { punchOutLocationDetails.punchOutLocation = punchOutLocation }

        // Find the Location id to be updated and update
        // Here _id is primary key of empLocation collection
        // console.log(_id)
        let updateLocation = await EmpLocation.findByIdAndUpdate(_id, { $set: punchOutLocationDetails }, { new: true })
        res.json(updateLocation)
        // console.log(updateLocation)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some error occured')
    }
})


// Route 2:  Get punchin status using : GET "/api/emplocation/fetchpunchinstatus". 
// router.get('/fetchpunchinstatus', async (req, res) => {
//     try {
        // pass mobile number of user to get his punch in status from collection
//         const empPunchInStatus = await EmpLocation.find()
//         if (!empPunchInStatus) {
//             return res.status(400).json({ error: "Punch In not yet done." })
//         }
//         res.json(empPunchInStatus)
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).send('Some error occured')
//     }
// })


module.exports = router