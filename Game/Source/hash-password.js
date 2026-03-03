const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });

rl._writeToOutput = s => {
  if (s.trimEnd() === 'Password:') process.stdout.write(s);
};

rl.question('Password: ', async p => {
  rl.close();
  process.stdout.write('\n');

  const enc = new TextEncoder();

  // Step 1: SHA-256 of password → hex digest (used as PRNG seed)
  const b1 = await crypto.subtle.digest('SHA-256', enc.encode(p));
  const hex = Array.from(new Uint8Array(b1)).map(x => x.toString(16).padStart(2, '0')).join('');

  // Step 2: seed xoshiro128** with first 128 bits of hex digest
  let s0 = parseInt(hex.slice(0,  8), 16);
  let s1 = parseInt(hex.slice(8,  16), 16);
  let s2 = parseInt(hex.slice(16, 24), 16);
  let s3 = parseInt(hex.slice(24, 32), 16);

  const rotl = (x, k) => (x << k) | (x >>> (32 - k));
  const next = () => {
    const v = (Math.imul(rotl(Math.imul(s1, 5), 7), 9)) >>> 0;
    const t = s1 << 9;
    s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= t; s3 = rotl(s3, 11);
    return v;
  };

  // Step 3: generate 64-char hex salt from PRNG
  let salt = '';
  for (let i = 0; i < 8; i++) salt += next().toString(16).padStart(8, '0');

  // Step 4: SHA-256(salt + password)
  const b2 = await crypto.subtle.digest('SHA-256', enc.encode(salt + p));
  const hash = Array.from(new Uint8Array(b2)).map(x => x.toString(16).padStart(2, '0')).join('');
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
