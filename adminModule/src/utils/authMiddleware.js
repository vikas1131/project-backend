//const jwtHelper = require('../utils/jwtHelper');
// const User = require('../model/users.model');
// const Engineer =require('../model/engineers.model');
// const Admin = require('../model/admin.model');
// const Auth = require('../model/auth.model');
// const authMiddleware = async (req, res, next) => {
    
//     try {
//         // Verify JWT
//         if(!req.headers.authorization){
//             return res.status(401).json({ error: 'Unauthorized: No token provided' });
//         }
//         const token = req.headers.authorization.split(' ')[1];

//         if (!token) {
//             return res.status(401).json({ error: 'No token provided' });
//         }
//         const decoded = jwtHelper.verifyToken(token);

//         const user = await Auth.findOne({email:decoded.email})
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         req.user = user;  // Attach user info to request
//         next();  // Proceed to the next route
//     } catch (err) {
//         return res.status(500).json({ error: 'Authentication failed' });
//     }
// };

// module.exports = authMiddleware;

const jwtHelper = require('../utils/jwtHelper');
const Auth = require('../model/auth.model');

const authMiddleware = (requiredRoles = []) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        const decoded = jwtHelper.verifyToken(token);
        const user = await Auth.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user; // Attach user details to the request

        // If roles are specified, check if user has access
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
        }

        next(); // Proceed to the next middleware or route
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed: Invalid or expired token' });
    }
};

module.exports = authMiddleware;
