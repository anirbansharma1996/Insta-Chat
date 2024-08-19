const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("db connected successfully");
    });
    connection.on('error',(error)=>{
       console.log('something went wrong =>', error)
    })
  } catch (error) {
    console.log("found an error =>", error.message);
  }
};
module.exports = connectDB;
