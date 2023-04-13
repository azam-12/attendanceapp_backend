const mongoose = require('mongoose')
const { Schema } = mongoose;

const EmpLocationSchema = new Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee'
  },


  punchInLat: {
    type: String,
    default: 'Punch_In_Pending'
  },
  punchInLon: {
    type: String,
    default: 'Punch_In_Pending'
  },
  punchInAlt: {
    type: String,
    default: 'Punch_In_Pending'
  },
  punchInTime: {
    type: String,
    default: 'Punch_In_Pending'
  },
  punchInStatus: {
    type: String,
    default: 'Punch_In_Pending'
  },
  punchInLocation: {
    type: String,
    default: 'Punch_In_Location_Pending'
  },


  punchOutLat: {
    type: String,
    default: 'Punch_Out_Pending'
  },
  punchOutLon: {
    type: String,
    default: 'Punch_Out_Pending'
  },
  punchOutAlt: {
    type: String,
    default: 'Punch_Out_Pending'
  },
  punchOutTime: {
    type: String,
    default: 'Punch_Out_Pending'
  },
  punchOutStatus: {
    type: String,
    default: 'Punch_Out_Pending'
  },
  punchOutLocation: {
    type: String,
    default: 'Punch_Out_Location_Pending'
  },
 


  

  date: {
    type: Date,
    default: () => {
      const now = new Date();
      now.setUTCHours(0,0,0,0);
      now.toISOString()
      return now;
    }

  // attendanceMarked: {
  //   type: String,  // will have values absent, present, late or leave taken
  //   default: 'Punch_Out_Pending'
  // },


  // date: {
  //   type: Date,
  //   default: Date.now
  // }
  
  }



  // date: {
  //   type: String,
  //   default: () => {
  //     const now = new Date();
  //     const year = now.getFullYear();
  //     const month = now.getMonth() + 1;
  //     const day = now.getDate();
  //     return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  //   }
  // }


});

module.exports = mongoose.model('empLocation', EmpLocationSchema)