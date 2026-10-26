// programs/074-explore-fortress.js
console.log('--- EXPLORING NETHER FORTRESS ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk right next to Alpha
const alpha = bot.players.alpha?.entity;
if (alpha) {
  console.log('Moving adjacent to Alpha at:', lib.fmt(alpha.position));
  try {
    await lib.goTo(alpha.position.x, alpha.position.y, alpha.position.z, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Approach Alpha note:', e.message);
  }
}

await lib.pickup(6);
bot.chat('Alpha: Gamma linked up with you inside the Fortress! Scanning corridors for chests, blazes, and nether wart.');

// 2. Scan for fortress features
const pos = bot.entity.position.floored();
const chests = bot.findBlocks({ matching: b => b && b.name === 'chest', maxDistance: 32, count: 5 });
const warts = bot.findBlocks({ matching: b => b && b.name === 'nether_wart', maxDistance: 32, count: 10 });
const spawners = bot.findBlocks({ matching: b => b && b.name === 'spawner', maxDistance: 32, count: 5 });

console.log(`Fortress scan: chests=${chests.length}, warts=${warts.length}, spawners=${spawners.length}`);

// If chest found, inspect and loot!
for (const cp of chests) {
  console.log(`Found fortress chest at ${lib.fmt(cp)}! Moving to loot...`);
  try {
    await lib.goTo(cp.x, cp.y, cp.z, 2, { timeoutMs: 15000 });
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log('Chest contents:', JSON.stringify(contents));
    // Withdraw useful items (diamonds, iron, gold, food, obsidian)
    const loot = {};
    for (const [item, count] of Object.entries(contents)) {
      if (/diamond|iron|gold|obsidian|bread|porkchop|beef|saddle/.test(item)) {
        loot[item] = count;
      }
    }
    if (Object.keys(loot).length > 0) {
      console.log('Withdrawing loot:', JSON.stringify(loot));
      await lib.withdraw(loot, cp.x, cp.y, cp.z);
    }
  } catch (e) {
    console.log('Chest loot error:', e.message);
  }
}

// 3. Scan for nearby mobs
const hostiles = lib.hostiles(24);
console.log('Nearby hostiles:', JSON.stringify(hostiles));

// Check for Blaze or Wither Skeleton
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.position);
const witherSkeletons = Object.values(bot.entities).filter(e => e && e.name === 'wither_skeleton' && e.position);
console.log(`Special mobs: Blazes=${blazes.length}, WitherSkeletons=${witherSkeletons.length}`);

for (const b of blazes) {
  console.log(`Blaze at ${lib.fmt(b.position)}, dist: ${b.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

// 4. Place trail torch at current junction
if (lib.count('torch') > 0) {
  try {
    await lib.placeTorch();
    console.log('Placed fortress trail torch');
  } catch (e) {}
}

console.log('Gamma status:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma in Fortress at ${lib.fmt(bot.entity.position)}: chests=${chests.length}, blazes=${blazes.length}, spawners=${spawners.length}`);
