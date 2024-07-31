const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const validPassword = (password, hash, salt) => {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return hash === hashVerify;
};

const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString('hex');
};

const generateJWT = (admin) => {
    const payload = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { validPassword, generateSalt, hashPassword, generateJWT };
