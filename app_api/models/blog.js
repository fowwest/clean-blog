var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//path and originalname are the fields stored in mongoDB
var imageSchema = mongoose.Schema({
 path: {
	 type: String,
	 required: true,
	 trim: true
 },
 originalname: {
	 type: String,
	 required: true
 },
 key: {
  type: String,
  required:true
 }
 
});

var PostSchema = new mongoose.Schema({
	image: imageSchema,

  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  created_at: { type: Date, required:true, default: Date.now },
  updated_at: { 
      type: Date, 
      required:false, 
      default: null,
      
      // Changes to true when post is updated
      post_updated: false
  }
});

var BlogSchema = new mongoose.Schema({
    posts: [PostSchema]
})
 
var Image = module.exports = mongoose.model('Image', imageSchema);
 
var Blog = module.exports = mongoose.model('Blog', BlogSchema);