const userModel = require('../models/user.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const jwt = require('jsonwebtoken');
const captainModel = require('../models/captain.model');

module.exports.authUser = async (req, res, next) => {
    try {
        let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        const blacklistToken = await blacklistTokenModel.findOne({ token });

        if (blacklistToken) {
            return res.status(401).json({ message: 'Unauthorized - Token blacklisted' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    try {
        let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        const blacklistToken = await blacklistTokenModel.findOne({ token });

        if (blacklistToken) {
            return res.status(401).json({ message: 'Unauthorized - Token blacklisted' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized - Captain not found' });
        }

        req.captain = captain;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};
