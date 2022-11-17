require('dotenv').config()
require('./config/database').connect()
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require('./model/user')
const auth = require('./middleware/auth')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rendering template View engine middleware
app.set("view engine", "ejs")

const { TOKENSECRETCODE } = process.env

app.get('/', (req, res) => {
    return res.status(200).send(`<h1>App is running</h1>`)
})

app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body

        if(!(firstname && lastname && email && password)) {
            return res.status(400).send('fill all the fields')
        }
    
        const user = await User.findOne({ email })
    
        if(user) {
            return res.status(400).send('user is already exists')
        }
    
        const encryptpassword = await bcrypt.hash(password, 10)
    
        const createduser = await User.create({
            firstname,
            lastname,
            email,
            password: encryptpassword
        })
        
        const token = jwt.sign({
            id: createduser._id, email
        }, TOKENSECRETCODE, { expiresIn: '2h' })
    
        createduser.token = token
        createduser.password = undefined
    
        return res.status(200).json(createduser)

    }catch(error) {
        return res.status(500).send('Something went wrong please try again later')
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if(!(email && password)) {
            return res.status(400).send('fill all the fields')
        }

        const user = await User.findOne({ email })
        const checkpassword = await bcrypt.compare(password, user.password)

        if(user && checkpassword) {
            const token = jwt.sign({
                id: user._id, email
            }, TOKENSECRETCODE, { expiresIn: '2h' })
        
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            
            return res.status(200).cookie("token", token, options).json({ success: true, token })
        } else {
            return res.status(400).send('User is not exist')
        }
        
    }catch(error) {
        return res.status(500).send('Something went wrong please try again later')
    }
})

app.get('/getForm', (req, res) => {
    return res.render('getForm')
})

app.get('/myget', (req, res) => {
    return res.send(req.query)
})

app.get('/postForm', (req, res) => {
    return res.render('postForm')
})

app.post('/mypost', (req, res) => {
    return res.send(req.body)
})

app.get('/dashboard', auth, (req, res) => {
    const { email } = req.user
    return res.status(200).send(`Welcome to the dashboard ${email}`)
})

module.exports = app