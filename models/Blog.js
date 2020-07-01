const mongoose = require('mongoose')
const Schema = mongoose.Schema
const marked = require('marked')
const slugify = require('slugify')
const createdDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createdDomPurify(new JSDOM().window)

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images:[{
        type: String
    }],
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String
    },
    poweruser: {
        type: String
    },
    userslug: {
        type: String
    },
    sanitizedHtml: {
        type: String
    }

})

blogSchema.pre('validate', function(next){
    if(this.title){
        this.slug = slugify(this.title, {lower: true, strict: true})
    }
    if(this.content){
        this.sanitizedHtml = dompurify.sanitize(marked(this.content))
    }

    next()
})

const Blog = mongoose.model("blogs", blogSchema)
module.exports = Blog