const express = require('express')
const router = express.Router()

// GET contact us page
router.route('/').get((req, res) => {
    res.render('contact', {title: 'Contact Me', user: null})
})

module.exports = router