const mongoose = require('mongoose');
const FAQSchema = new mongoose.Schema({
  question: String,  // preset questions in Bangla/Banglish
  answer: String
});
module.exports = mongoose.model('FAQ', FAQSchema);
