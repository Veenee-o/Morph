// Simple test script to verify word validation
const { isValidWord } = require('./dist/lib/wordUtils');

const words = [
  'cat', 'dog', 'hat', 'pen', 'run', 'sun', 'fun', 'big', 'zoo', 'quiz',
  'jazz', 'hymn', 'lynx', 'gym', 'pyx', 'cwm', 'qat', 'hajj'
];

console.log('Word Validation Test Results:');
console.log('----------------------------');

words.forEach(word => {
  console.log(`${word}: ${isValidWord(word) ? '✅' : '❌'}`);
});
