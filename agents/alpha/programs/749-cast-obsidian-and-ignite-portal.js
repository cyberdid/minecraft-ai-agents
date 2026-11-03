// programs/749-cast-obsidian-and-ignite-portal.js
console.log('=== Program 749: Cast Obsidian & Reignite Nether Portal ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Ascend mine shaft to surface
console.log('Ascending mine shaft to surface at (302, 71, -44)...');
const ascent = [
  new Vec3(299, 53, -58),
  new Vec3(302, 60, -50),
  new Vec3(302, 66, -46),
  new Vec3(302, 71, -44)
];

for (let i = 0; i < ascent.length && !checkCancelled(); i++) {
  const p = ascent[i];
  try {
    await lib.goTo(p.x, p.y, p.z, 1.5, { timeoutMs: 7000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
  }
}

console.log('At surface:', lib.fmt(bot.entity.position));

// 3. Walk to surface lava pool at (333, 62, -78) and scoop lava
console.log('Walking to surface lava pool (333, 62, -78)...');
bot.chat('alpha: Sourcing lava from surface pool (333, 62, -78) with bucket to cast missing obsidian!');

try {
  await lib.goTo(333, 63, -76, 2.0, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(333, 63, -76, 2.5)); } catch (e2) {}
}

console.log('Near lava pool at:', lib.fmt(bot.entity.position));

// Find lava source block
const lavaBlock = bot.findBlock({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 6
});

if (lavaBlock) {
  console.log(`Found lava source at ${lib.fmt(lavaBlock.position)}! Scooping...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');
  await bot.lookAt(lavaBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.activateItem();
  await sleep(1000);
}

const hasLava = lib.count('lava_bucket') > 0;
console.log(`Lava bucket status: ${hasLava ? 'SCOOPED' : 'FAILED'}`);
if (!hasLava) {
  throw new Error('Failed to scoop lava bucket at surface pool');
}

bot.chat('alpha: Lava scooped! Returning to portal frame (299, 72, -54) to cast obsidian!');

// 4. Return to portal frame at (299, 73, -52)
console.log('Returning to portal frame...');
try {
  await lib.goTo(299, 73, -52, 1.2, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2)); } catch (e2) {}
}

console.log('At portal frame:', lib.fmt(bot.entity.position));

// 5. Place lava into basin at (299, 72, -54)
const basinBlock = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Current block at basin (299, 72, -54): ${basinBlock?.name}`);

if (basinBlock && (basinBlock.name === 'air' || basinBlock.name === 'cave_air')) {
  console.log('Placing lava into basin...');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) await bot.equip(lb, 'hand');
  
  // Look at top of block below basin (299, 71, -54)
  await bot.lookAt(new Vec3(299.5, 71.9, -54.0), true);
  bot.activateItem();
  await sleep(1000);
}

console.log('After lava placement, basin is:', bot.blockAt(new Vec3(299, 72, -54))?.name);

// 6. Walk to water source at base (292, 71, -50) and scoop water
console.log('Scooping water bucket from base water source...');
const waterBlock = bot.findBlock({
  matching: b => b && b.name === 'water' && b.metadata === 0,
  maxDistance: 16
});

if (waterBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(waterBlock.position.x, waterBlock.position.y + 1, waterBlock.position.z, 2.0));
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(waterBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.activateItem();
    await sleep(800);
  } catch (e) {}
}

const hasWater = lib.count('water_bucket') > 0;
console.log(`Water bucket status: ${hasWater ? 'SCOOPED' : 'FAILED'}`);

// 7. Return to portal frame and quench lava into obsidian
if (hasWater) {
  console.log('Returning to portal frame to quench lava into obsidian...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2));
  } catch (e) {}

  // Pour water against (298, 73, -54) so it flows into (299, 72, -54)
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) await bot.equip(wb, 'hand');
  await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
  bot.activateItem();
  await sleep(1500); // Wait for water to convert lava to obsidian

  // Pick water back up
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');
  await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
  bot.activateItem();
  await sleep(800);
}

// 8. Verify obsidian at (299, 72, -54)
const finalObs = bot.blockAt(new Vec3(299, 72, -54));
console.log(`*** Block at (299, 72, -54) is now: ${finalObs?.name} ***`);

// 9. Ignite portal frame with flint_and_steel!
const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
if (fas) {
  console.log('Igniting portal frame with flint_and_steel...');
  await bot.equip(fas, 'hand');
  const sill = bot.blockAt(new Vec3(299, 72, -54)) || bot.blockAt(new Vec3(300, 72, -54));
  if (sill) {
    await bot.activateBlock(sill);
    await sleep(1000);
  }
}

// 10. Verify active nether_portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 6
});

console.log(`Active nether_portal blocks: ${portals.length}`);
if (portals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL REPAIRED AND LIT! ${portals.length} active portal blocks verified! Milestone 7 RESTORED!`);
} else {
  bot.chat('alpha: Portal sill cast! Attempting second strike with flint_and_steel...');
  if (fas) {
    await bot.equip(fas, 'hand');
    const sill2 = bot.blockAt(new Vec3(300, 72, -54));
    if (sill2) await bot.activateBlock(sill2);
    await sleep(1000);
  }
}

return {
  obsidianCast: finalObs?.name === 'obsidian',
  portalsActive: portals.length,
  pos: bot.entity.position,
  dim: bot.game.dimension,
  inv: lib.inv()
};
