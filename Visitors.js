const mongoose = require('mongoose');

const visitorsSchema = mongoose.Schema({
  name:{
    type: String,
    required:true
  },
  email:{
    type: String,
    required:true
  },
  phnum:{
    type:String,
    required:true
  },
  checkin:{
    type:String,
    required: true
  },
  host:{type:
    {
      name:{type:String, required:true},
      email:{type:String, required:true},
      phnum:{type:String, required:true},
      address:{type:String, required:true}
    }
  },
  checkout:{
    type:String,
    default:'none'
  }
})

let Visitors = mongoose.model('Visitors', visitorsSchema);
module.exports = Visitors;
