const express = require('express')
const expressLayout = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const morgan = require('morgan')
const session = require('express-session')
require('dotenv').config()

// DB models
const Blog = require('./models/Blog')
const User = require('./models/User')

// PAssport Config
require('./config/passport')(passport)

// MOngoDB Atlas connection string
// mongodb+srv://gocool:gocool@cluster0.3ujkq.mongodb.net/<dbname>?retryWrites=true&w=majority
// mongodb://localhost:27017/itsmyblog

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('DB connected!!!')
})


const app = express()

// body parser 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Public directories
app.use(express.static(__dirname + '/public'))
app.use('/post/uploads', express.static('./uploads'))
app.use('/post/uploads', express.static('uploads'))

app.use('/uploads', express.static('uploads'))
app.use('/uploads', express.static('./uploads'))


// EJS
app.use(expressLayout)
app.set('view engine', 'ejs')

// Express session
app.use(
    session({
        secret: 'itsmyblog',
        resave: true,
        saveUninitialized: true
    })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())


// Routes
const postRoute = require('./routes/posts')
const contactRoute = require('./routes/contact')
const aboutRoute = require('./routes/about')
const userRoute = require('./routes/users')

// Homepage route
app.get('/', (req, res) => {

    Blog.find(). sort({createdAt: -1}).then(items => {
        if(req.isAuthenticated()){
            // console.log(req.user)
            res.render('index', {title: "It's My Blog", posts: items, user: req.user})
        }else{
            res.render('index', {title: "It's My Blog", posts: items, user: null})
        }
        
    }).catch(err => console.log(err))
})

// app.get('/test', (req, res) => {
//     // console.log('Done')
//     res.render('login', {title: 'Login', user: null})
// })

app.use ('/user', userRoute)
app.use('/', postRoute)
app.use('/contact', contactRoute)
app.use('/about', aboutRoute)

app.listen(3000, ( ) => {
    console.log('Server is up and running on port 3000')
})