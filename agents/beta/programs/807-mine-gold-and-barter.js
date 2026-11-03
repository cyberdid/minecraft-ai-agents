// programs/807-mine-gold-and-barter.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 807: Mine Nether Gold Ore & Barter with Piglins ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

// Equip iron pickaxe in hand
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 1: Step to crafting table area at (44, 65, -134)
try {
  await lib.goTo(44, 65, -134, 1.0, { timeoutMs: 5000 });
} catch (e) {}

console.log('At Crafting Table area:', lib.fmt(bot.entity.position));

// Step 2: Search for reachable or nearby nether_gold_ore blocks
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 16,
  count: 20
});
console.log(`Found ${goldOres.length} gold ores within 16m:`, goldOres.map(p => lib.fmt(p)).join(', '));

// Step 3: Dig out path towards the gold ore vein at (34, 74, -135) or any reachable ore
let minedOres = 0;
for (const orePos of goldOres) {
  if (minedOres >= 8 || isCancelled()) break;
  const dist = bot.entity.position.distanceTo(orePos);
  console.log(`Targeting ore at ${lib.fmt(orePos)} (dist: ${dist.toFixed(1)}m)...`);

  if (dist <= 4.5) {
    const ob = bot.blockAt(orePos);
    if (ob && ob.name.includes('gold')) {
      try {
        await bot.dig(ob, true);
        minedOres++;
        console.log(`Mined gold ore at ${lib.fmt(orePos)}! Total mined: ${minedOres}`);
      } catch (e) {
        console.log(`Dig ore error:`, e.message);
      }
    }
  } else {
    // Try to navigate closer safely
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 3.5));
      const ob = bot.blockAt(orePos);
      if (ob && ob.name.includes('gold')) {
        await bot.dig(ob, true);
        minedOres++;
        console.log(`Mined gold ore at ${lib.fmt(orePos)}!`);
      }
    } catch (e) {
      console.log(`Cannot reach ore at ${lib.fmt(orePos)}:`, e.message);
    }
  }
  await lib.pickup(3.0);
}

// Vacuum all dropped nuggets
await lib.pickup(5.0);

console.log(`Gold nuggets in inventory: ${lib.count('gold_nugget')}`);

// Step 4: Craft gold nuggets into gold ingots at crafting table (44, 65, -134)
try {
  await lib.goTo(44, 65, -134, 1.2, { timeoutMs: 5000 });
} catch (e) {}

const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const craftCount = Math.floor(nuggets / 9);
  console.log(`Crafting ${craftCount} gold ingots from ${nuggets} nuggets...`);
  try {
    await lib.craft('gold_ingot', craftCount);
    console.log(`Crafted gold ingots! Total ingots now: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft gold_ingot error:', e.message);
  }
}

// Step 5: Advance to covered tunnel opening at (44, 65, -145) to locate neutral Piglins
console.log('Advancing to Covered Tunnel (44, 65, -144)...');
try {
  await lib.goTo(44, 65, -144, 1.2, { timeoutMs: 6000 });
} catch (e) {}

console.log('At Covered Tunnel:', lib.fmt(bot.entity.position));

// Scan for nearby Piglins
const piglins = Object.values(bot.entities).filter(e => 
  e.name === 'piglin' && 
  bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Found ${piglins.length} Piglins nearby:`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Step 6: Barter with Piglin if we have gold ingots!
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  const targetPiglin = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(targetPiglin.position)} using ${ingots} gold ingots...`);
  
  for (let b = 0; b < ingots && !isCancelled(); b++) {
    const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!goldItem) break;

    bot.chat(`Beta: Tossing gold ingot to neutral Piglin for Milestone 9 barter #${b + 1}!`);
    await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
    try {
      await bot.toss(goldItem.type, null, 1);
      console.log('Tossed gold ingot! Waiting 7s for barter inspection & drop...');
      await sleep(7500);
      await lib.pickup(5.0);
    } catch (e) {
      console.log('Toss error:', e.message);
    }

    if (lib.count('ender_pearl') > 0) {
      bot.chat(`Beta: Barter SUCCESS! Harvested ${lib.count('ender_pearl')} Ender Pearl(s)!`);
      console.log(`SUCCESS: Ender Pearls secured: ${lib.count('ender_pearl')}`);
    }
  }
}

// Step 7: Check for Endermen in view from under 2-high roof
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 30);
console.log(`Endermen in view (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Aggroing Enderman at ${lib.fmt(em.position)} from safe 2-high covered tunnel...`);
  await bot.lookAt(em.position.offset(0, 2.7, 0), true);
  await sleep(1500);

  // Ready weapon
  const weapon = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (weapon) await bot.equip(weapon, 'hand');

  const fightStart = Date.now();
  while (Date.now() - fightStart < 8000 && !isCancelled()) {
    const live = bot.entities[em.id];
    if (!live || !live.isValid || live.health <= 0) break;
    const d = bot.entity.position.distanceTo(live.position);
    if (d <= 3.8) {
      bot.attack(live);
      await sleep(600);
    }
    await sleep(100);
  }
  await lib.pickup(4.0);
}

// Ensure golden boots still on
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}

console.log('=== Program 807 Summary ===');
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
  gold_nuggets: lib.count('gold_nugget'),
  piglins: piglins.length,
  endermen: endermen.length
};
