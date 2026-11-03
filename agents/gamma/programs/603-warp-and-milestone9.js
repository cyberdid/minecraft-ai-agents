// programs/603-warp-and-milestone9.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 603: WARP & EXECUTE MILESTONE 9 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Wait for portal ignition (up to 45 seconds)
let portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
const waitStart = Date.now();
while ((!portalBlock || portalBlock.name !== 'nether_portal') && Date.now() - waitStart < 45000 && !isCancelled()) {
  portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  if (sill && sill.name === 'obsidian' && (!portalBlock || portalBlock.name !== 'nether_portal')) {
    console.log('Obsidian sill in place! Awaiting ignition...');
  } else if (sill && sill.name === 'lava') {
    console.log('Lava placed! Awaiting water quench...');
  }
  await sleep(1000);
}

portalBlock = bot.blockAt(new Vec3(299, 73, -54)) || bot.blockAt(new Vec3(300, 73, -54));
if (!portalBlock || portalBlock.name !== 'nether_portal') {
  console.log('Portal not lit yet within 45s. Sill status:', bot.blockAt(new Vec3(299, 72, -54))?.name);
  for (const [name, p] of Object.entries(bot.players)) {
    if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
  return { status: 'waiting_for_portal', sill: bot.blockAt(new Vec3(299, 72, -54))?.name };
}

console.log('PORTAL IS OFFICIALLY LIT! Active nether_portal block confirmed!');
bot.chat('gamma: Portal ignited! Stepping onto sill (299.5, 73.0, -53.5) for survival Nether warp!');

// Step 2: Step onto portal sill at (299.5, 73.0, -53.5)
await bot.lookAt(new Vec3(299.5, 73.0, -53.5), true);
try {
  await lib.goTo(299.5, 73.0, -53.5, 0.5, { timeoutMs: 5000 });
} catch (e) {
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

bot.pathfinder.stop();
bot.clearControlStates();

console.log('Standing motionless inside nether_portal block for 80 ticks...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp not triggered within timeout. Dimension:', bot.game.dimension);
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESSFUL! Arrived in the_nether at:', lib.fmt(bot.entity.position));
await sleep(400);

// Step 3: Step out into Nether bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

bot.chat(`gamma: Arrived in the_nether at ${lib.fmt(bot.entity.position)}! Marching safe East Ridge to Fortress Workshop Bunker (44, 65, -127)!`);

// Step 4: March safe East Ridge waypoints to Bunker
globalThis.configureFireAvoidance();
const bunkerWps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
  { x: 62, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }
];

let startIdx = 0;
let closestDist = Infinity;
for (let i = 0; i < bunkerWps.length; i++) {
  const d = bot.entity.position.distanceTo(new Vec3(bunkerWps[i].x, bunkerWps[i].y, bunkerWps[i].z));
  if (d < closestDist) {
    closestDist = d;
    startIdx = i;
  }
}
if (closestDist < 2.0 && startIdx < bunkerWps.length - 1) startIdx++;

for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();
  if (wp.z <= -95) bot.activateItem(true);
  else bot.deactivateItem();

  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) break;
}

// Step 5: Inside bunker at (44, 65, -128)
try {
  await lib.goTo(44, 65, -128, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {}

console.log('Arrived inside bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: Stationed at Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})!`);

// Step 6: Climb gold staircase to (36, 73, -134) and mine nether_gold_ore
console.log('Climbing staircase to gold ore vein at (36, 73, -134)...');
const steps = [
  new Vec3(42, 67, -134),
  new Vec3(40, 69, -134),
  new Vec3(38, 71, -134),
  new Vec3(36, 73, -134)
];
for (const s of steps) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(s.x, s.y, s.z)); } catch (e) {}
}

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Find and mine gold ores
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 6.0,
  count: 15
});
console.log(`Reachable nether_gold_ore blocks: ${ores.length}`);
for (const op of ores) {
  if (isCancelled()) break;
  try {
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(op.x, op.y, op.z);
    await lib.pickup(4.0);
  } catch (e) {}
}

await lib.pickup(6.0);
console.log('Gold nuggets in inv:', lib.count('gold_nugget'));

// Return to bunker crafting table at (44, 65, -134)
try {
  await lib.goTo(44, 65, -134, 1.5, { dig: false, timeoutMs: 8000 });
} catch (e) {}

// Craft gold ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    const crafts = Math.floor(lib.count('gold_nugget') / 9);
    await lib.craft('gold_ingot', crafts);
    console.log(`Crafted ${crafts} gold_ingot! Total: ${lib.count('gold_ingot')}`);
    bot.chat(`gamma: Crafted ${crafts} gold ingots! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {}
}

// Step 7: Barter with Piglin if in covered tunnel
const piglin = Object.values(bot.entities).find(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
if (piglin && lib.count('gold_ingot') > 0) {
  bot.chat('gamma: Neutral Piglin found! Bartering gold ingot for Ender Pearls!');
  for (let r = 0; r < lib.count('gold_ingot') && !isCancelled(); r++) {
    try {
      const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (!ingot) break;
      await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
      await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
      bot.tossStack(bot.heldItem);
      await sleep(8000);
      await lib.pickup(5.0);
    } catch (e) {}
  }
}

await lib.pickup(5.0);
console.log('=== END PROGRAM 603: Pearls:', lib.count('ender_pearl'), 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`gamma: Milestone 9 status — Pearls: ${lib.count('ender_pearl')}/12, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  goldIngots: lib.count('gold_ingot'),
  inv: lib.inv()
};
