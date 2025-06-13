const { isValidWord } = require('./dist/lib/wordUtils');

// Test words that were previously problematic
const testWords = [
  'cat', 'dog', 'hat', 'pen', 'run', 'sun', 'fun', 'big', 'small', 'quick',
  'jump', 'over', 'lazy', 'fox', 'brown', 'zoo', 'quiz', 'jazz', 'hymn', 'lynx',
  'gym', 'pyx', 'cwm', 'qat', 'xylophone', 'rhythm', 'sphinx', 'jazz', 'hajj', 'xylophone'
];

console.log('Testing word validation:');
console.log('-----------------------');

let validCount = 0;
const results = [];

for (const word of testWords) {
  const isValid = isValidWord(word);
  if (isValid) validCount++;
  results.push({
    word,
    length: word.length,
    valid: isValid ? '✅' : '❌',
    reason: !isValid ? 'Not in dictionary' : ''
  });
}

// Display results in a table
console.table(results);
console.log(`\nValid words: ${validCount}/${testWords.length} (${(validCount/testWords.length*100).toFixed(1)}%)`);

// Check if any words were invalid
const invalidWords = results.filter(r => !r.valid.includes('✅')).map(r => r.word);
if (invalidWords.length > 0) {
  console.log('\nThe following words were invalid:');
  console.log(invalidWords.join(', '));
} else {
  console.log('\nAll test words are valid!');
}
