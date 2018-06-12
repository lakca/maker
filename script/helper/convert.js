const PowerRadix = require('power-radix');
const MATRIX = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
  'u', 'v', 'w', 'x', 'y', 'z', '-'
];

function convertRadix(chars, fromRadix, toRadix, radix = MATRIX) {
  if (fromRadix > radix.length || toRadix > radix.length) {
    throw new Error('radix argument out of range.');
  } else {
    return new PowerRadix(chars, radix.slice(0, fromRadix)).toString(radix.slice(0, toRadix));
  }
};

function encrypt(str) {
  const hex = Buffer.from(str).toString('hex');
  return convertRadix(hex, 16, MATRIX.length);
}

function decrypt(str) {
  const hex = convertRadix(str, MATRIX.length, 16);
  return Buffer.from(hex, 'hex').toString();
}

console.log(encrypt('grammar'))
console.log(decrypt(encrypt('grammar')));