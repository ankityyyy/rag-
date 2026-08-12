import mongoose from "mongoose"

const userSchema=new mongoose.schema({
     name:{
          type:String,
          required:true,
     },
     password:{
          type:String,
          required:true,
     },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
})

const user=mongoose.model("User", userSchema);

export default user;