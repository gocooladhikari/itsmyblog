const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')

const user = new Schema({
    name: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    slug: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
})
user.pre('validate', function(next){
    if(this.name){
        this.slug = slugify(this.name, {lower: true, strict: true})
    }
    next()
})

const User = mongoose.model('user', user)
module.exports = User