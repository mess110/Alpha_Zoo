const { hashPassword } = require('./password-hash');
const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });

rl._writeToOutput = s => {
  if (s.trimEnd() === 'Password:') process.stdout.write(s);
};

rl.question('Password: ', async p => {
  rl.close();
  process.stdout.write('\n');

  const hash = await hashPassword(p);
  console.log(hash);

  // Step 5: write hash into browser_compat.js
  const fs = require('fs');
  const path = require('path');
  const target = path.join(__dirname, 'browser_compat.js');
  const src = fs.readFileSync(target, 'utf8');
  const updated = src.replace(
    /const PASSWORD_HASH = "[^"]*"/,
    `const PASSWORD_HASH = "${hash}"`
  );
  fs.writeFileSync(target, updated, 'utf8');
  console.log('browser_compat.js updated.');
});
