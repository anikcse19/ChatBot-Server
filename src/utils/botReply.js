// function generateBotReply(userMessage) {
//   if (userMessage.includes("hello")) return "Hi there! How can I help you?";
//   if (userMessage.includes("price")) return "Please check our pricing page.";
//   return "Thank you for your message. Our team will get back to you soon.";
// }
const qaData = require("./faqs-bk");
// generateBotReply.js
// const qaData = require("./qaData");
const stringSimilarity = require("string-similarity");

function generateBotReply(userMessage) {
  const input = userMessage.toLowerCase();
  const questions = qaData.map(item => item.question.toLowerCase());
  
  const { bestMatch } = stringSimilarity.findBestMatch(input, questions);

  if (bestMatch.rating > 0.4) {
    const bestAnswer = qaData.find(
      q => q.question.toLowerCase() === bestMatch.target
    );
    return bestAnswer?.answer || "আপনার প্রশ্নটি বুঝতে পারিনি।";
  }

  return "আপনার প্রশ্নটি বুঝতে পারিনি। অনুগ্রহ করে বিস্তারিত লিখুন।";
}


module.exports = { generateBotReply };