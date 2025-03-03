const jwt = require('jsonwebtoken');

const secretKey=process.env.SECRET_KEY;


const createToken = (user) =>{
    const payload={
        email:user.email,
        role:user.role,
        // securityAnswer:user.securityAnswer
    };

    const options={
        expiresIn:'2h'
    };

    const token =jwt.sign(payload, secretKey, options);
    return token;
}


const verifyToken = (token) =>{
    try{
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    }catch(error){
        return null;
    }
 
}

module.exports = {
    createToken,
    verifyToken,

};