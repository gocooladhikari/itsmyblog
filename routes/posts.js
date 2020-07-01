const router = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')
const multer = require('multer')
const { ensureAuthenticated } = require('../config/auth')


// Multer Congig
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './uploads/blogs')
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

// router.route('/post/new').get((req, res) => {
//     res.render('new', {title: 'Write a new Blog', user: null})
// })

router.route('/post/:slug').get((req, res) => {
    
        Blog.findOne({slug: req.params.slug}).then(post => {
                User.findOne({name: post.poweruser}).then(user => {
                    if(!user){
                        return console.log('Invalid URL')
                    }
                    if(req.isAuthenticated()){
                        res.render('post', {title: "Let's Read", blog: post, user: user})
                                    
                    }else{
                        res.render('post', {title: "Let's Read", blog: post, user: null})
                    }  
                }).catch(err => console.log(err))

                         
                        
                    }).catch(err => console.log(err))
    
})

// router.post('/post/new', upload.array('images', 3), (req, res) => {
//     const title = req.body.title
//     const description = req.body.description
//     const content = req.body.content
//     // const newpat

//     const blog = new Blog({
//         title,
//         description,
//         content
//     })

//     // replace(/\\/g,'/')

//     for(var i = 0; i< req.files.length; i++){
        
//         blog.images.push(req.files[i].path.replace(/\\/g,'/'))
//     }

//     blog.save().then(post => {
//         console.log(post)
//         // console.log(newpath)
//         res.redirect('/')
//     }).catch(err => console.log(err))
// })


router.route('/:userslug/post/:postslug').get(ensureAuthenticated, async (req, res) => {
    const userResult = User.findOne({slug: req.params.userslug})
    const user = await userResult.exec()
     
    Blog.findOne({slug: req.params.postslug}).then(post => {

        res.render('post', {title: "Let's Read", blog: post, user: user})

    }).catch(err => console.log(err))
})


module.exports = router