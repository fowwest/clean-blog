var express = require('express');
var router = express.Router();
var ctrlBlog = require('../controllers/blog');

// Blog
router.get('/', ctrlBlog.getBlogPosts);
router.get('/blog/posts/:postid', ctrlBlog.blogPostsReadOne);
router.get('/blog/posts/:postid/delete', ctrlBlog.blogPostsDeleteOne);
 
module.exports = router;