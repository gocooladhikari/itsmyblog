const express = require('express')
const router = express.Router()

// GET about page
router.route('/').get((req, res) => {
    res.render('about',{title: "About Me", user: null})
})


module.exports = router