const express=require('express');
const router=express.Router();
const authMiddleware=require('../middlewares/auth.middleware.js')

const {body}=require('express-validator')
const userController = require('../controllers/user.controllers.js');




router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min:3}).withMessage('First name must be at least 3 character long'),
    body('password').isLength({min:8}).withMessage('password must be at least 8 character long'),
],
    userController.registerUser
)

router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:8}).withMessage('password must be at least 8 character long'),
],
    userController.loginUser,
)

router.get('/profile',authMiddleware.authUser,userController.getUserProfile)

router.get('/logout',authMiddleware.authUser,userController.logoutUser)


module.exports=router;