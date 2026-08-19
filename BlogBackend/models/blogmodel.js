const mongoose = require('mongoose')

const schema = mongoose.Schema

const blogSchema = new schema({
    title:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    choice:{
        type: String,
        default: 'public',
        required: true
    },
    description:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    likedBy: {
        type: [String],
        default: []
    },
    author:{
        type: String,
        required: false
    },
    username:{
        type: String,
        required: true
    },
    comments:{
        type: [String], // Array of comment strings
        default: []     // Initialize as empty array
    },
    collaborators: {
        type: [String], // Array of collaborator usernames
        default: []
    },
    embedding: {
        type: [Number],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    summary: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['processing', 'published'],
        default: 'published'
    }
},{timestamps:true})

module.exports = mongoose.model('Blog',blogSchema)