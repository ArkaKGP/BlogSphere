const express = require('express');
const {
    getBlogs,
    getoneBlog,
    createBlog,
    deleteBlog,
    updateBlog,
    updateBlogLikes,
    addBlogComment,
    getmyBlogs,
    semanticSearchBlogs,
    getRecommendationsForUser,
    addCollaborator
} = require('../Controllers/controllers');

const router = express.Router();

// GET semantic vector search
router.get('/search/semantic', semanticSearchBlogs);

// GET personalized recommendations
router.get('/recommendations/for-you', getRecommendationsForUser);

// GET all blogs
router.get('/', getBlogs);

// GET single blog
router.get('/:id', getoneBlog);

// GET blogs by username
router.get('/username/:username', getmyBlogs);

// POST new blog
router.post('/', createBlog);

// DELETE blog
router.delete('/:id', deleteBlog);

router.patch('/:id', updateBlog);  // For editing blog content

router.patch('/:id/like', updateBlogLikes);  // For likes

router.patch('/:id/comment', addBlogComment); // For adding a comment

router.patch('/:id/collaborators', addCollaborator); // For adding a collaborator

module.exports = router;