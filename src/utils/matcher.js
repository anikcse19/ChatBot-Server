const stringSimilarity = require("string-similarity");
const fs = require("fs");
const path = require("path");
const FAQ = require("../models/FAQ");
const staticFaqs = require("./faqs");
const {
  handleAccountIssues,
  handleAccountVerification,
  handleAppMobile,
  handleBasicQuery,
  handleBettingProcess,
  handleBonusReferral,
  handleCampaignOffers,
  handleCasinoGames,
  handleCustomerSupport,
  handleDeviceIssues,
  handleGeneralQueries,
  handleLegalPolicy,
  handleLoginProblems,
  handlePaymentIssues,
  handlePaymentMethods,
  handleSportsBetting,
  handleTimeLimits,
  handleTurnoverBalance,
  handleUncategorized,
  handleWithdrawalDepositRules,
} = require("./CategorizedFunctions");

const LEARNED_FILE = path.join(__dirname, "learned_replies.json");

// Load learned replies from file
function loadLearnedReplies() {
  if (!fs.existsSync(LEARNED_FILE)) return [];
  try {
    const data = fs.readFileSync(LEARNED_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load learned replies:", e);
    return [];
  }
}

// Main matcher function
async function findBestReply(userMessage) {
  if (typeof userMessage !== "string") return null;

  // Fetch from all sources
  // const dbFaqs = await FAQ.find();
  // const learnedFaqs = loadLearnedReplies();

  // Combine all
  // const allFaqs = [
  //   ...staticFaqs,
  //   ...dbFaqs.map(f => ({ question: f.question, answer: f.answer })),
  //   ...learnedFaqs.map(f => ({ question: f.question, answer: f.answer }))
  // ];

  const detectedCategory = detectCategory(userMessage);

  console.log("detected categry", detectedCategory);

  if (detectedCategory) {
    // Map detected category to its handler
    const handlerMap = {
      Account_Issues: handleAccountIssues,
      Account_Verification: handleAccountVerification,
      App_Mobile: handleAppMobile,
      Basic_Query: handleBasicQuery,
      Betting_Process: handleBettingProcess,
      Bonus_Referral: handleBonusReferral,
      Campaign_Offers: handleCampaignOffers,
      Casino_Games: handleCasinoGames,
      Customer_Support: handleCustomerSupport,
      Device_Issues: handleDeviceIssues,
      General_Queries: handleGeneralQueries,
      Legal_Policy: handleLegalPolicy,
      Login_Problems: handleLoginProblems,
      Payment_Issues: handlePaymentIssues,
      Payment_Methods: handlePaymentMethods,
      Sports_Betting: handleSportsBetting,
      Time_Limits: handleTimeLimits,
      Turnover_Balance: handleTurnoverBalance,
      Uncategorized: handleUncategorized,
      Withdrawal_Deposit_Rules: handleWithdrawalDepositRules,
    };

    const handler = handlerMap[detectedCategory];
    if (handler) {
      const reply = await handler(userMessage);
      if (reply) return reply;
    }
  }

  const questions = staticFaqs.map((f) => f.question);
  if (!questions.length) return null;

  const matches = stringSimilarity.findBestMatch(userMessage, questions);
  const bestMatch = matches.bestMatch;

  if (bestMatch.rating > 0.6) {
    const matched = staticFaqs.find((f) => f.question === bestMatch.target);
    return matched?.answer || null;
  }

  return null;
}

// Used by adminReply controller to add new learned replies
async function learnReplyFromAdmin(messages) {
  if (messages.length < 2) return;

  const [prev, last] = messages.slice(-2);
  if (prev.sender !== "user" || last.sender !== "admin") return;

  const newEntry = {
    question: prev.message,
    answer: last.message,
  };

  const existing = loadLearnedReplies();
  existing.push(newEntry);
  fs.writeFileSync(LEARNED_FILE, JSON.stringify(existing, null, 2));
}

module.exports = {
  findBestReply,
  learnReplyFromAdmin,
};
