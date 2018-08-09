var mongoose = require('mongoose');
var Blog = mongoose.model('Blog');
var request = require('request');
var Image = mongoose.model('Image');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var fs = require('fs'),
    AWS = require('aws-sdk');
    
    // AWS.config.update({
    //   region: 'us-east-1',
    //   accessKeyId: process.env.awsAccessKey,
    //   secretAccessKey: process.env.awsSecretAccessKey
    // });

    AWS.config.update({
       region: 'us-east-1',
       accessKeyId: process.env.awsAccessKey,
       secretAccessKey: process.env.awsSecretAccessKey
     });

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Requires login middleware
module.exports.requiresLogin = function (req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

var apiOptions = {
  server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = process.env.HEROKU_URL;
}

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var renderPostPage = function(req, res, postDetail) {
  console.log(postDetail.post.image.key + ': This is key');

  var params = {Bucket: 'clean-blog-assets', Key: postDetail.post.image.key};
  var url = s3.getSignedUrl('getObject', params);
  console.log('The URL is', url);

  res.render('post-info', {
    post: postDetail.post,
    imageUrl: url
  });
};

var renderEditPage = function(req, res, postDetail) {
  console.log(postDetail.post.image.key + ': This is key');

  var params = {Bucket: 'clean-blog-assets', Key: postDetail.post.image.key};
  var url = s3.getSignedUrl('getObject', params);
  console.log('The URL is', url);

  res.render('edit-post', {
    post: postDetail.post,
    imageUrl: url
  });
};

var doAddPost = function(req, res, blog) {

  var file = req.file;                                                                                                                
  let fileData = fs.readFileSync(file.path);
  console.log(file);
  var params = {
  Bucket: 'clean-blog-assets',
  Key: file.filename,
  Body: fileData,
  ACL:'public-read'
  };
  s3.putObject(params, function (perr, pres) {
      if (perr) {
          console.log("Error uploading image: ", perr);                                                
      } else {
          console.log("uploading image successfully");                       
      }                      
  });   

  // Putting uploaded image's path and name into document
  var imagepath = {};
  imagepath['path'] = file.path;
  imagepath['originalname'] = file.originalname;
  imagepath['key'] = file.filename;

  // Pushing post image, title, and content into db
  blog.posts.push({
    image: imagepath,
    title: req.body.post_title,
    content: req.body.post_content
  });
  blog.save();

  return res.redirect('/profile');

};

var doUpdatePost = function(req, res, blog) {

      var thisPost;
      thisPost = blog.posts.id(req.params.postid);

      if (!thisPost) {
        sendJsonResponse(res, 404, {
          "message": "postid not found!"
        });
      } else {
        
          // If new img was selected, insert new img to db    
          if (req.body.image_selected === 'true') {
            console.log('image was selected');
            var imagepath = {};
            var file = req.file;                                                                                                               
            let fileData = fs.readFileSync(file.path);
            var params = {
            Bucket: 'clean-blog-assets',
            Key: file.filename,
            Body: fileData,
            ACL:'public-read'
            };
            s3.putObject(params, function (perr, pres) {
                if (perr) {
                    console.log("Error uploading image: ", perr);                                                
                } else {
                    console.log("uploading image successfully");                       
                }                      
            });   

            // Putting uploaded image's path and name into document
            imagepath['path'] = file.path;
            imagepath['originalname'] = file.originalname;
            imagepath['key'] = file.filename;

            thisPost.image = imagepath;
          }

          thisPost.title = req.body.post_title;
          thisPost.content = req.body.post_content;
          thisPost.updated_at = new Date();
          thisPost.updated_at.post_updated = true;
          blog.save(function(err, blog) {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              // sendJsonResponse(res, 200, thisPost);
              res.redirect('/');
            }
          });
      }
}

// Error handler
var _showError = function(req, res, status) {
  var title, content;
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find the page. Sorry.";
  } else {
    title = status + ", something's gone wrong.";
    content = "Something, somwhere, has gone just a little bit wrong";
  }
  res.status(status);
  // res.render('generic-text', {
  //   title: title,
  //   content: content
  // });
};

var getPostsInfo = function(req, res, callback) {
  var requestOptions, path;
  path = '/api/blog/posts/' + req.params.postid;
  requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {},
  };
  request(requestOptions, function(err, response, body){
    var data = body; // data processing
    if (response.statusCode === 200) {
      callback(req, res, data);
    } else {
      _showError(req, res, response.statusCode);
    }
  });
};


module.exports.postsCreate = function(req, res, next) {

    Blog
    .findById('5b6cb900f291007b69c2e583')
    .select('posts')
    .exec(function(err, blog){
    if (err) {
        console.log('error');
      } else {
        doAddPost(req, res, blog);
      }
    });
};

module.exports.postsUpdateOne = function(req, res) {
  if (!req.params.postid) {
    sendJsonResponse(res, 404, {
      "message": "Not found! postid required"
    });
    return;
  }
  Blog
  .findById('5b6cb900f291007b69c2e583')
  .select('posts')
  .exec(function(err, blog) {
    var thisPost;
    if (!blog) {
      sendJsonResponse(res, 404, {
        "message": "blogid not found!"
      });
      return;
    } else if (err) {
      sendJsonResponse(res, 404, err);
      return;
    }
    if (blog.posts && blog.posts.length > 0) {
        doUpdatePost(req, res, blog);
    } else {
      sendJsonResponse(res, 404, {
        "message": "No posts found!"
      });
    }
  });
};

var renderBlogpage = function(req, res, responseBody) {

    // Flag for admin
    var isAdmin = false;
    var keyArray = [];
    var imageUrlList = [];

    if (req.session.userId) {
      isAdmin = true;
    } 

    if(responseBody.posts) {

      for (i = 0; i < responseBody.posts.length; i++) {
      var imageKey = responseBody.posts[i].image.key;
      keyArray[i] = imageKey;
      }

      for (i = 0; i < keyArray.length; i ++) {
        var params = {Bucket: 'clean-blog-assets', Key: keyArray[i]};
        var url = s3.getSignedUrl('getObject', params);
        imageUrlList[i] = url;
      }

      // Render blog page
      res.render('blog', {
      isAdmin,
      posts: responseBody.posts,
      imageUrl: imageUrlList,
      postSubmitted: false
      });
    } else {
        // Render blog page
        res.render('blog', {
        isAdmin,
        posts: [],
        imageUrl: imageUrlList,
        postSubmitted: false
        });
    }


};

/* GET blog page */
module.exports.blog = function(req, res){

  // GET blog posts through api
  var requestOptions, path;
  path = '/api/blog';
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {},
    qs: {

    }
  };

  // body is json data returned from api
  request(requestOptions, function(err, response, body){
    var data, i;
    if (err) {
      sendJsonResponse(res, 404, err);
      return;
    }
    data = body;
    renderBlogpage(req, res, data);
  });
};

/* GET posts info page */
module.exports.postInfo = function(req, res){
  getPostsInfo(req, res, function(req, res, responseData) {
    renderPostPage(req, res, responseData);
  });
};

/* GET posts info page */
module.exports.postEdit = function(req, res){
  getPostsInfo(req, res, function(req, res, responseData) {
    renderEditPage(req, res, responseData);
  });
};




