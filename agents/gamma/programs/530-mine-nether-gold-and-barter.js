// programs/530-mine-nether-gold-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 530: MINE NETHER GOLD & BARTER FOR ENDER PEARLS ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Ensure golden boots are strictly worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Equipped golden_boots!');
  }
}

// Step 2: Ensure shield in offhand and iron sword ready
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}
try { await lib.equipWeapon(); } catch (e) {}

// Step 3: Enter Nether Portal if in Overworld
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Entering Nether portal to mine gold and barter with Piglins for Ender Pearls!');
  console.log('Warping into Nether...');
  const portalRes = await globalThis.enterNetherPortal();
  console.log('Portal result:', JSON.stringify(portalRes));
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether, stopping.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

// Step 4: March to Fortress Workshop Bunker (WP 11: 44, 65, -127)
globalThis.configureFireAvoidance();
const bunkerTarget = new Vec3(44, 65, -127);
console.log('Marching along safe East Ridge to Fortress Workshop Bunker (44, 65, -127)...');

// Waypoints from portal camp (WP 0) to Bunker (WP 11)
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

// Determine starting waypoint
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
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z)); // Keep gaze low

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

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march.`);
    break;
  }
}

console.log(`Arrived at/near Bunker! Current Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);
bot.chat(`gamma: Stationed at Fortress Bunker (${lib.fmt(bot.entity.position)})! Scouting nether gold ore & Piglins!`);

// Step 5: Find nether_gold_ore within 16m
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
  maxDistance: 16,
  count: 10
});

console.log(`Found ${ores.length} nether_gold_ore blocks within 16m.`);
for (const op of ores) {
  if (isCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(op)}...`);
  try {
    // Equip iron pickaxe
    const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
    if (pick) await bot.equip(pick, 'hand');
    await lib.dig(op.x, op.y, op.z);
    await lib.pickup(4.0);
    console.log('Mined gold ore successfully!');
  } catch (e) {
    console.log(`Mining note at ${lib.fmt(op)}:`, e.message);
  }
}

// Pickup any drops
await lib.pickup(5.0);

// Craft nuggets into ingots
const nuggets = lib.count('gold_nugget');
console.log(`Current gold_nugget count: ${nuggets}`);
if (nuggets >= 9) {
  try {
    const crafts = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', crafts);
    console.log(`Crafted ${crafts} gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft gold_ingot note:', e.message);
  }
}

// Step 6: Barter with neutral Piglins if we have gold ingots
const totalIngots = lib.count('gold_ingot');
console.log(`Ready to barter with ${totalIngots} gold_ingot(s)!`);

if (totalIngots > 0) {
  // Find neutral Piglin within 16m
  const piglin = Object.values(bot.entities).find(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
  );

  if (piglin) {
    console.log(`Piglin found at ${lib.fmt(piglin.position)} (dist: ${bot.entity.position.distanceTo(piglin.position).toFixed(1)}m)!`);
    bot.chat('gamma: Neutral Piglin located! Tossing gold ingot for bartering!');

    for (let r = 0; r < totalIngots && !isCancelled(); r++) {
      try {
        const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
        if (!ingot) break;

        await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
        await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
        bot.tossStack(bot.heldItem);
        console.log(`Tossed gold ingot ${r + 1}/${totalIngots}! Waiting for barter inspection (8s)...`);
        await sleep(8000);
        await lib.pickup(5.0);
        console.log(`Barter round ${r + 1} complete. Inventory:`, lib.inv());
      } catch (e) {
        console.log('Barter loop note:', e.message);
      }
    }
  } else {
    console.log('No Piglin within 16m of current bunker position.');
  }
}

// Step 7: Final pickup and status report
await lib.pickup(5.0);
const finalPearls = lib.count('ender_pearl');
const finalIngots = lib.count('gold_ingot');
console.log(`=== END PROGRAM 530: Pearls: ${finalPearls}/12, Gold ingots: ${finalIngots}, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);

bot.chat(`gamma: At Fortress Bunker (${lib.fmt(bot.entity.position)}). Pearls: ${finalPearls}/12, Gold ingots: ${finalIngots}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: finalPearls,
  goldIngots: finalIngots,
  inv: lib.inv()
};
