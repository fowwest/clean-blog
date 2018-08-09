var mongoose = require('mongoose');
var Blog = mongoose.model('Blog');
var Image = mongoose.model('Image');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.getBlogPosts = function(req, res) {
	Blog
	.findById('5b6cb900f291007b69c2e583')
	.exec(function(err, blog){
			if (!blog) {
				sendJsonResponse(res, 404, {
						"message": "blog not found!"
				});
				return;
			} else if (err) {
				sendJsonResponse(res, 400, err);
				return;
			}
			sendJsonResponse(res, 200, blog);

	});
};

// Test heroku

module.exports.blogPostsReadOne = function(req, res) {
	if (req.params && req.params.postid) {
		Blog
		.findById('5b6cb900f291007b69c2e583')
		.select("posts")
		.exec(function(err, blog){
			var response, post;
			if(!blog) {
				sendJsonResponse(res, 404, {
					"message": "blog not found!"
				});
				return;
			} else if (err) {
				sendJsonResponse(res, 400, err);
				return;
			}
			if (blog.posts && blog.posts.length > 0) {
				console.log(req.params.postid);
				post = blog.posts.id(req.params.postid);
				if (!post) {
					sendJsonResponse(res, 404, {
						"message": "postid not found!"
					});
				} else {
					response = {
						blog: {
							id: '5b6cb900f291007b69c2e583'
						},
						post: post
					};
					sendJsonResponse(res, 200, response);
				}
				
			} else {
				sendJsonResponse(res, 404, {
					"message": "No posts found!"
				});
			}	
		});
	} else {
		console.log('paramaters not entered');
		sendJsonResponse(res, 404, {
			"message": "postid required!"
		});
	}
};

module.exports.blogPostsDeleteOne = function(req, res) {
	if (!req.params.postid) {
		sendJsonResponse(res, 404, {
			"message": "Need postid"
		});
		return;
	}
	Blog
	.findById('5b6cb900f291007b69c2e583')
	.select("posts")
	.exec(function(err, blog) {
		var thisPost;
		if (!blog) {
			sendJsonResponse(res, 404, {
				"message": "blogid not found"
			});
			return;
		} else if (err) {
			sendJsonResponse(res, 404, err);
		}
		if (blog.posts && blog.posts.length > 0) {
			
			if (!blog.posts.id(req.params.postid)) {
				sendJsonResponse(res, 404, {
					"message": "postid not found"
				});
				return;
			} else {
				blog.posts.id(req.params.postid).remove();
				blog.save(function(err) {
					if (err) {
						sendJsonResponse(res, 404, err);
					} else {
						console.log('Succesful deletion');
						return res.redirect('/');
					}
				});

			}
		} else {
			sendJsonResponse(res, 404, {
				"message": "No posts found"
			});
		}
	});

};

