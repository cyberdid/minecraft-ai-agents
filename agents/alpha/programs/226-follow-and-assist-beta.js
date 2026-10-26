// programs/226-follow-and-assist-beta.js
console.log('=== Program 226: Follow Beta towards Lava Lake (286, 18, 8) ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Time:', lib.time());

// 1. Inspect Beta
let betaPos = null;
if (bot.players.beta?.entity) {
  betaPos = bot.players.beta.entity.position;
  console.log('Beta pos:', lib.fmt(betaPos), 'held:', bot.players.beta.entity.heldItem?.name);
} else {
  console.log('Beta entity not in line of sight right now.');
}

// 2. Check main mine shaft at (302, 71, -44)
const shaftEntrance = new Vec3(302, 71, -44);
console.log(`Checking shaft entrance at ${lib.fmt(shaftEntrance)}: block=${bot.blockAt(shaftEntrance)?.name}`);

// 3. If Beta is visible and moving, move near Beta
if (betaPos) {
  console.log(`Moving towards Beta at ${lib.fmt(betaPos)}...`);
  try {
    await lib.goTo(betaPos.x, betaPos.y, betaPos.z, 2, { timeoutMs: 20000 });
    console.log('Near Beta! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Go to Beta note:', e.message);
  }
} else {
  // Move towards the mine shaft entrance (302, 71, -44)
  console.log('Moving towards mine shaft entrance (302, 71, -44)...');
  try {
    await lib.goTo(302, 71, -44, 2, { timeoutMs: 20000 });
  } catch (e) {
    console.log('Go to shaft note:', e.message);
  }
}

// 4. Scan for lava in the direction of (286, 18, 8)
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 48, count: 50 });
console.log(`Found ${lavas.length} lava blocks within 48 blocks.`);
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 48, count: 20 });
console.log(`Found ${obs.length} obsidian blocks within 48 blocks.`);

bot.chat(`beta: Alpha following to assist! Pos: ${lib.fmt(bot.entity.position)}. Lava in range: ${lavas.length}, Obsidian: ${obs.length}.`);
