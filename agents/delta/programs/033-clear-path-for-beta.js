// programs/033-clear-path-for-beta.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// 1. Fight immediate melee hostiles (zombies)
const hostiles = lib.hostiles(8);
console.log('Hostiles within 8m:', JSON.stringify(hostiles));

for (const h of hostiles) {
  if (h.name === 'zombie' && h.dist < 6) {
    console.log(`Fighting ${h.name} at ${h.dist}m...`);
    try {
      await lib.fight(6, 8);
    } catch (e) {
      console.log('Fight note:', e.message);
    }
  }
}

// 2. Check Beta's location
let beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta located at ${lib.fmt(beta.position)} (dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
}

// Walk towards junction / Beta at (298, 20, -20)
console.log('Moving toward Beta junction (298, 20, -20)...');
try {
  await lib.goTo(298, 20, -20, 3, { timeoutMs: 15000 });
} catch (e) {
  console.log('Move toward Beta note:', e.message);
}

// Re-check Beta
beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta now at ${lib.fmt(beta.position)} (dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}m)`);
  if (beta.position.distanceTo(bot.entity.position) < 6 && lib.count('cooked_chicken')) {
    console.log('Tossing cooked chicken to Beta...');
    await bot.lookAt(beta.position.offset(0, 1.2, 0));
    await bot.toss(mcData.itemsByName.cooked_chicken.id, null, 1);
    bot.chat('delta: Beta! Tossed you cooked chicken! Eat and follow Gamma & Delta up!');
  }
}

// Step back up to (300, 30, -37)
console.log('Ascending toward shaft staircase (300, 30, -37)...');
try {
  await lib.goTo(300, 30, -37, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('Ascent note:', e.message);
}

console.log('Delta pos now:', lib.fmt(bot.entity.position));
