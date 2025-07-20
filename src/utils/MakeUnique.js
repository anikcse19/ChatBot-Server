const faqs = require("./faqs");

console.log("length of original faqs", faqs.length);

function UniqueArray(arr) {
  const unique = [];
  const duplicates = [];
  const count = {};
  for (const item of arr) {
    const key = item.question;
    if (count[key]) {
      count[key]++;
      if (count[key] == 2) {
        duplicates.push(item);
      }
    } else {
      count[key] = 1;
      unique.push(item);
    }
  }
  return { unique, duplicates };
}

const result = UniqueArray(faqs);

console.log("unique array", result.unique.length);
console.log("duplicate array", result.duplicates.length);

function assignBatchNamesToUniqueQuestions(uniqueQuestions) {
  let batchCounter = 1;

  return uniqueQuestions.map((item) => {
    item.batchName = `b${String(batchCounter).padStart(3, "0")}`;
    batchCounter++;
    return item;
  });
}
const uniqueQuestionsWithBatchNames = assignBatchNamesToUniqueQuestions(
  result.unique
);

console.log(
  "Unique ArrayOfObject with Batch Names:",
  uniqueQuestionsWithBatchNames
);
