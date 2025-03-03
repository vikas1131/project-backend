const mongoose=require('mongoose');

require('dotenv').config();

async function connectDB(){
    try{
        mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDb!!");

    }catch(err){
        console.error('error',err.message);
        throw err;
    }
}

module.exports={ connectDB }