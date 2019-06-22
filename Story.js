const mongoose = require("mongoose");

module.exports.Story = mongoose.model("Story", {
  id: String,
  title: String,
  link: String,
  comments: [
    mongoose.Schema({
      name: String,
      message: String
    })
  ]
});
