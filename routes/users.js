const router = require('express').Router()
const nodemailer = require('nodemailer')
require('dotenv').config()
const randonstring = require('randomstring')
const multer = require('multer')

// DB MODELS
const User = require('../models/User')
const Blog = require('../models/Blog')

const{ forwardAuthenticated, ensureAuthenticated } = require('../config/auth')
const passport = require('passport')

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './uploads')
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 20
    },
    fileFilter: fileFilter
})

// Nodemailer service
const client = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

// Get registration form
router.route('/register').get(forwardAuthenticated ,(req, res) => {
    res.render('poweruser', {title: 'Power User', user: null})
})
// POST registration form
router.route('/register').post((req, res) => {
    const {name, email, password, password2} = req.body

    User.findOne({email}).then(user => {
        if(user){
            console.log('Already registered')
            res.redirect('/')
        }else{

            if(password !== password2){
                console.log('Passwords dont match')
            }else{
                const code = randonstring.generate(4)

                const user = new User({
                name,
                email,
                password,
                code
            })

            var sendEmail = {
                from: 'gocool.adhikari11@gmail.com',
                to: email,
                subject: 'Account verification',
                text: '',
                html: `Code: ${code}`

            }
            client.sendMail(sendEmail, (err, info) => {
                if(err) {
                    console.log(err)
                }else{
                    console.log(info)
                    user.save().then(user => {
                        console.log(user)
                        res.redirect(`/user/${user.slug}/verify`)
                    }).catch(err => console.log(err))
                }
            })

            }
           
        }
    }).catch(err => console.log(err))
})

// Verification code form
router.route('/:slug/verify').get((req, res) => {
    User.findOne({slug: req.params.slug}).then(user => {
        if(!user){
            console.log('Invalid url')
            res.redirect('/')
        }else{
            if(user.code === ''){
                console.log('You are a verified user')
                res.redirect(`/user/${user.slug}/register`)
            }else{
                 res.render('verify', {title: 'User Verification', slug: user.slug, user: null})
            }
           
        }
    })
    
})
// Verification code POSTING form
router.route('/:slug/verify').post((req, res) => {
    const code = req.body.code
    User.findOne({code: code}).then(user => {
        if(!user){
            console.log('NO user registered !!!')
            res.redirect('/user/register')
        }else{

            console.log('Continue with furthur registration')
            user.code = ''
            user.save()
            res.redirect(`/user/${user.slug}/register`)
            
        }
    }).catch(err => console.log(err))
})

// Profile picture form
router.route('/:slug/register').get((req, res) => {
    User.findOne({slug: req.params.slug}).then(user => {

        if(!user){
            console.log('invalid url')
            res.redirect('/')
        }else{
            if(user.code === ''){
                res.render('finalregistration', {title: 'Final update', slug: user.slug, user: user})
                 
                //  if(user.image === ''){
                    
                // }else{
                //     console.log('Already added profile pic')
                //     res.redirect(`/user/${user.slug}/profile`)
                // }

            }else{
                console.log('Proceed with code verification')
                res.redirect(`/user/${user.slug}/verify`)
            }
           
        }
    }).catch(err => console.log(err))
    
})
// Profile Picture POSTING route
router.post('/:slug/register', upload.single('image'), (req, res) => {
    const image = req.file.path.replace(/\\/g, '/')
    User.findOne({slug: req.params.slug}).then(user => {
        if(!user){
            console.log("No url")
            res.redirect('/')
        }else{

            user.image = image
            user.save().then(user => {
                console.log(user)
                res.redirect(`/user/${user.slug}/dashboard`)
            }).catch(err => console.log(err))
            
        }
    })
    
})
// User profile page
router.route('/:slug/profile').get( (req, res) => {
    User.findOne({slug: req.params.slug}).then(user => {
        if(!user){
            console.log('Invalid URL')
            res.redirect('/')
        }else{
            Blog.find({poweruser: user.name}).then(posts => {
                // console.log(posts)
                if(req.isAuthenticated()){
                res.render('profile', {title: user.name, user: user, name: user.name, posts})
                }else{
                res.render('profile', {title: user.name, user: null, name: user.name, posts: posts})
                }
            }).catch(err => console.log(err))
            
            
            // if(user.code === ''){
                
            // }else{
            //      console.log('Verify your account first')
            //     res.redirect(`/user/${user.slug}/verify`)
            // }
           
        }
    }).catch(err => console.log(err))
})

// User Dashboard
router.route('/:slug/dashboard').get(ensureAuthenticated, (req, res) => {
    if(req.user.slug === req.params.slug){
        // console.log('itss me')
    User.findOne({slug: req.params.slug}).then(user => {
        if(!user){
            console.log('Invalid URL')
            res.redirect('/')
        }else{
           
            Blog.find({poweruser: user.name}).sort({createdAt: -1}).then(posts => {
                // console.log(posts)
                res.render('dashboard', {title: user.name, user: user, posts: posts})
            }).catch(err => console.log(err))
        }
    }).catch(err => console.log(err))

    }else{
        console.log('You are unauthorized to view this')
        res.redirect('/')
    }
})

// GET Login page
router.route('/login').get(forwardAuthenticated ,(req, res) => {
    res.render('login', {title: 'Login', user: null})
})

// POST login info
router.route('/login').post( async (req, res, next) => {
    const {email} = req.body
    const result = User.findOne({email: email}, null)
    const user = await result.exec()
        passport.authenticate('local', {
        successRedirect: `/user/${user.slug}/dashboard`,
        failureRedirect: '/user/login'
    })(req, res, next)
   
    
})

// Logout route
router.route('/logout').get((req, res) => {
    req.logout()
    res.redirect('/user/login')
})


router.route('/:slug').get(ensureAuthenticated ,async (req, res) => {
    var user = User.findOne({slug: req.params.slug}, null)  
    var posts = Blog.find(). sort({createdAt: -1})
    var result = await user.exec()
    var postresult = await posts.exec()
    // console.log(result)
    // console.log(postresult)

    res.render('index', {title: "It's My Blog", posts: postresult, user: req.user.name})

})

// GET User Blog posting form
router.route('/:slug/write').get(ensureAuthenticated, (req, res) => {
    User.findOne({slug: req.params.slug}).then(user => {
        if(!user){
            console.log("Invalid url")
            res.redirect('/')
        }else{
            res.render('new', {title: 'Write a new Blog', user: null, slug: user.slug})
            // if(user.code === ''){ 
            // }else{
            //    console.log('Verify your account first')
            //     res.redirect(`/user/${user.slug}/verify`)
            // }

        }
    })

    
})

// router.route('/test').get(async (req, res) => {
//     var user = User.findOne({name: 'Gokul Adhikari'}, null)
//     // console.log(user)
//     var result = await user.exec()
//     console.log(result)

//     Blog.findOne({title: 'aaaaaaa'}).then(post => {
//         console.log(post)
//     }).catch(err => console.log (err))  
// })


router.post('/:slug/write', upload.array('images', 3), async (req, res) => {

    var user = User.findOne({slug: req.params.slug}, null)  
    var result = await user.exec() 
    
    const title = req.body.title
    const description = req.body.description
    const content = req.body.content
    var poweruser = result.name
    const userslug = result.slug
    // const newpat

    const blog = new Blog({
        title,
        description,
        content,
        poweruser,
        userslug
    })

    // replace(/\\/g,'/')

    for(var i = 0; i< req.files.length; i++){
        
        blog.images.push(req.files[i].path.replace(/\\/g,'/'))
    }

    blog.save().then(post => {
        console.log(post)
        // console.log(newpath)
        res.redirect('/user/<%= result.slug%>/dashboard')
    }).catch(err => console.log(err))
})


module.exports = router