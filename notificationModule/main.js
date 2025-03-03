require('dotenv').config();
const { connectDB }=require('./dbConnect');
const app = require('./app');
const http = require('http');
const fs = require('fs');
const path = require('path');


// let sslOption = {
//     key: fs.readFileSync(path.join(basePath, 'key.pem')),
//     cert: fs.readFileSync(path.join(basePath, 'cert.pem')),
//     passphrase:'password'
// }

const server=http.createServer(app); 

const PORT = process.env.PORT || 5000;



console.log('inside server');
async function startServer() {
    try{
        await connectDB();
        server.listen(PORT,() =>  {
            console.log(`Server running at https://localhost:${PORT}`)
        })
    }catch(err){
        console.error('Error starting the server',err);
    }
}

startServer();
