// programs/818-mine-vein-and-barter.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 818: Mine Mountain Gold Vein & Barter for Ender Pearls ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 1: Walk to base of mountain wall at (46, 65, -114)
console.log('Walking to base of mountain wall at (46, 65, -114)...');
try {
  await lib.goTo(46, 65, -114, 1.2, { timeoutMs: 5000 });
} catch (e) {}

// Step 2: Excavate staircase going West (-X) and Up (+Y) along z=-114
const zCoord = -114;
let curY = 65;

for (let curX = 45; curX >= 39 && !isCancelled(); curX--) {
  curY = Math.min(75, curY + 1);
  console.log(`Digging staircase step at x=${curX}, y=${curY}, z=${zCoord}...`);

  // Clear 2-high head clearance ahead at curX
  for (let dy = 0; dy <= 2; dy++) {
    const b = bot.blockAt(new Vec3(curX, curY + dy, zCoord));
    if (b && b.boundingBox === 'block' && b.name !== 'air') {
      try { await bot.dig(b, true); } catch (e) {}
    }
  }

  // Ensure solid floor underfoot at (curX, curY - 1, zCoord)
  const floor = bot.blockAt(new Vec3(curX, curY - 1, zCoord));
  if (!floor || floor.boundingBox !== 'block') {
    const mat = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'netherrack' || it.name === 'granite');
    if (mat) {
      try {
        await bot.equip(mat, 'hand');
        const ref = bot.blockAt(new Vec3(curX + 1, curY - 1, zCoord));
        if (ref) await bot.placeBlock(ref, new Vec3(-1, 0, 0));
        if (pick) await bot.equip(pick, 'hand');
      } catch (e) {}
    }
  }

  // Move onto this step
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(curX, curY, zCoord));
  } catch (e) {
    await bot.lookAt(new Vec3(curX + 0.5, curY + 1.0, zCoord + 0.5), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < curY) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  await lib.pickup(3.0);
}

console.log('Arrived at gold vein elevation! Pos:', lib.fmt(bot.entity.position));

// Step 3: Find and mine all reachable gold ores
const reachableOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 6.0,
  count: 15
});
console.log(`Found ${reachableOres.length} gold ores reachable from shaft:`, reachableOres.map(p => lib.fmt(p)).join(', '));

if (pick) await bot.equip(pick, 'hand');
for (const op of reachableOres) {
  if (isCancelled()) break;
  const b = bot.blockAt(op);
  if (b && b.name.includes('gold')) {
    console.log(`Mining gold ore at ${lib.fmt(op)}...`);
    try {
      await bot.dig(b, true);
    } catch (e) {
      console.log('Dig error:', e.message);
    }
  }
}

// Vacuum all dropped nuggets
await lib.pickup(6.0);
console.log(`Gold nuggets in inventory: ${lib.count('gold_nugget')}`);

// Step 4: Descend staircase back to walkway
console.log('Descending staircase back to walkway...');
for (let curX = 40; curX <= 46 && !isCancelled(); curX++) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(curX, 65, zCoord, 1.2));
  } catch (e) {
    try { await lib.goTo(curX, 65, zCoord, 1.5, { timeoutMs: 2500 }); } catch (e2) {}
  }
}

// Step 5: Walk to Crafting Table at (44, 65, -134)
console.log('Walking to team Crafting Table at (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1.2, { timeoutMs: 5000 });
} catch (e) {}

// Craft gold ingots from nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingotsToCraft = Math.floor(nuggets / 9);
  console.log(`Crafting ${ingotsToCraft} gold ingots at Crafting Table...`);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    console.log(`SUCCESS: Total gold ingots now: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${ingotsToCraft} gold ingots! Total ingots ready for bartering: ${lib.count('gold_ingot')}!`);
  } catch (e) {
    console.log('Craft gold_ingot notice:', e.message);
  }
}

// Step 6: Locate nearest neutral Piglin
const piglins = Object.values(bot.entities).filter(e => 
  e.name === 'piglin' && 
  bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Piglins found nearby (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Step 7: Barter with Piglin
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const piglin = piglins[0];
  console.log(`Approaching Piglin at ${lib.fmt(piglin.position)} to barter ${ingots} gold ingots...`);
  
  try {
    await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 2.5));
  } catch (e) {}

  for (let b = 0; b < ingots && !isCancelled(); b++) {
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!gold) break;

    bot.chat(`Beta: Tossing gold ingot to neutral Piglin for Milestone 9 barter #${b + 1}!`);
    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    try {
      await bot.toss(gold.type, null, 1);
      console.log('Tossed gold ingot! Waiting 7.5s for inspection & drop...');
      await sleep(7500);
      await lib.pickup(5.0);
    } catch (e) {
      console.log('Toss error:', e.message);
    }

    const pearls = lib.count('ender_pearl');
    if (pearls > 0) {
      bot.chat(`Beta: Barter SUCCESS! Harvested ${pearls} Ender Pearl(s)! Milestone 9 progressing!`);
      console.log(`SUCCESS: Harvested ${pearls} Ender Pearl(s)!`);
    }
  }
}

// Ensure golden boots still on
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}

console.log('=== Program 818 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls in inv:', lib.count('ender_pearl'));
console.log('Gold ingots in inv:', lib.count('gold_ingot'));
console.log('Gold nuggets in inv:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget')
};
