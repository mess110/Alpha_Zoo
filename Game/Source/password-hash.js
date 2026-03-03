// Shared password hashing algorithm used by both the browser gate and the
// Node.js hash-password.js CLI tool.  crypto.subtle is available as a global
// in both environments (Node 18+ and all modern browsers).

async function hashPassword(password) {
  const enc = new TextEncoder();

  // Step 1: SHA-256 of password → hex digest (used as PRNG seed)
  const b1 = await crypto.subtle.digest('SHA-256', enc.encode(password));
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
  const b2 = await crypto.subtle.digest('SHA-256', enc.encode(salt + password));
  return Array.from(new Uint8Array(b2)).map(x => x.toString(16).padStart(2, '0')).join('');
}

// Export for Node.js (hash-password.js); ignored in the browser.
if (typeof module !== 'undefined') module.exports = { hashPassword };
