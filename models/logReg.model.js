const mongoose = require('mongoose')

 const  Schemae = mongoose.Schema

 const crudSchema = Schemae({
    firstname:{type:String, required:true},
    lastname:{type:String, required:true},
    fullname:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    image: { type: String },
    isDeleted:{type:Boolean, enum:[true,false], default:false}
},{
    timestamps:true,
    versionkey:false
})

module.exports = mongoose.model('crud', crudSchema)