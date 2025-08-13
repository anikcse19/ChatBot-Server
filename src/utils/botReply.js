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
const staticFaqs = require("./faqs");
const stringSimilarity = require("string-similarity");

function detectCategory(userMessage) {
  const categories = [...new Set(staticFaqs.map((f) => f.categoryName))];

  console.log("categories", categories);

  const categoryExamples = categories.map((cat) => {
    const examples = staticFaqs
      .filter((f) => f.categoryName === cat)
      .map((f) => f.question);
    const representative = examples.reduce(
      (a, b) => (a.length > b.length ? a : b),
      ""
    );
    return { category: cat, representative };
  });

  console.log("categoryExamples", categoryExamples);

  const matches = stringSimilarity.findBestMatch(
    userMessage,
    categoryExamples.map((c) => c.representative)
  );

  console.log("matches", matches);

  const bestMatch = matches.bestMatch;
  console.log("bestMatch", bestMatch);
  if (bestMatch.rating > 0.4) {
    console.log(
      "returned",
      categoryExamples.find((c) => c.representative === bestMatch.target)
        ?.category || null
    );
    return (
      categoryExamples.find((c) => c.representative === bestMatch.target)
        ?.category || null
    );
  }
  return null;
}

async function generateBotReply(userMessage) {
  // const input = userMessage.toLowerCase();

  // const detectedCategory = detectCategory(userMessage);

  // console.log("detected categry", detectedCategory);

  // if (detectedCategory) {
  //   // Map detected category to its handler
  //   const handlerMap = {
  //     Account_Issues: handleAccountIssues,
  //     Account_Verification: handleAccountVerification,
  //     App_Mobile: handleAppMobile,
  //     Basic_Query: handleBasicQuery,
  //     Betting_Process: handleBettingProcess,
  //     Bonus_Referral: handleBonusReferral,
  //     Campaign_Offers: handleCampaignOffers,
  //     Casino_Games: handleCasinoGames,
  //     Customer_Support: handleCustomerSupport,
  //     Device_Issues: handleDeviceIssues,
  //     General_Queries: handleGeneralQueries,
  //     Legal_Policy: handleLegalPolicy,
  //     Login_Problems: handleLoginProblems,
  //     Payment_Issues: handlePaymentIssues,
  //     Payment_Methods: handlePaymentMethods,
  //     Sports_Betting: handleSportsBetting,
  //     Time_Limits: handleTimeLimits,
  //     Turnover_Balance: handleTurnoverBalance,
  //     Uncategorized: handleUncategorized,
  //     Withdrawal_Deposit_Rules: handleWithdrawalDepositRules,
  //   };

  //   const handler = handlerMap[detectedCategory];
  //   if (handler) {
  //     const reply = await handler(userMessage);
  //     if (reply) return reply;
  //   }
  // }

  const questions = staticFaqs.map((f) => f.question);
  if (!questions.length) return null;
console.log("user message ", userMessage)
  const matches = stringSimilarity.findBestMatch(userMessage, questions);
  console.log("match ",matches)
  const bestMatch = matches.bestMatch;

  if (bestMatch.rating > 0.6) {
    const matched = staticFaqs.find((f) => f.question === bestMatch.target);
    const detectedCategory = matched.categoryName;
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
        console.log("handler reply", reply);
        if (reply) return reply;
      }
    }
    return matched?.answer || null;
  }

  return "আপনার প্রশ্নটি বুঝতে পারিনি। অনুগ্রহ করে আবার প্রশ্ন করুন।";
}

module.exports = { generateBotReply };
