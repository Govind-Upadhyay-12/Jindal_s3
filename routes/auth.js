const express = require('express');
const router = express.Router();
const requestIp = require('request-ip');
const Admin = require('../models/admin');
const AdminToken = require("../models/AdminToken")
const { validPassword, generateSalt, hashPassword, generateJWT } = require('../helper/auth');
const responseManagement = require('../helper/responseManagement');
const httpStatus = require('http-status-codes');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Email already in use');
        }

        const salt = generateSalt();
        const hash = hashPassword(password, salt);

        const newAdmin = new Admin({
            name,
            email,
            salt,
            hash,
            ip: req.ip, 
        });

        await newAdmin.save();
        responseManagement.sendResponse(res, httpStatus.CREATED, 'Admin registered successfully');
    } catch (error) {
        console.error(error);
        responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
});

router.post('/login', async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;
        const req_ip = requestIp.getClientIp(req);
        const user = await Admin.findOne({ email: email });

        if (user && user.salt && user.hash) {
            if (validPassword(password, user.hash, user.salt)) {
                if (user.status) {
                    if (user.ip) {
                        const newObj = {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        }
                        const token = generateJWT(newObj);
                        await AdminToken.create({ admin_id: user._id, token, req_ip, user_agent: req.headers['user-agent'] });
                        responseManagement.sendResponse(res, httpStatus.OK, 'Logged in successfully', { token });
                    } else {
                        responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid IP address');
                    }
                } else {
                    responseManagement.sendResponse(res, httpStatus.UNAUTHORIZED, 'User is inactive');
                }
            } else {
                responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid credentials');
            }
        } else {
            responseManagement.sendResponse(res, httpStatus.BAD_REQUEST, 'Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        responseManagement.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
});

module.exports = router;
