const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res, next) => {
    try{
        const { name, email, password } = req.body

        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please prove the credentials and try again"
            })
        }
        
        const exists = await User.findOne({ email })
        if(exists){
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            })
        }

        const user = await User.create({ name, email, password })

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user)
            }
        })
    } catch(err){
        next(err)
    }
}

exports.loginUser = async (req, res, next) => {
    try{
        const { email, password } = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter your credentials"
            })
        }

        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User does not exists. Please create an account first"
            })
        }

        const isMatch = await user.matchPassword(password)
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid user password"
            })
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user)
            }
        })
    } catch(err){
        next(err)
    }
}
