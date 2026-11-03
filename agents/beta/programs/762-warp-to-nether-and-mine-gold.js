// programs/762-warp-to-nether-and-mine-gold.js
console.log('=== Program 762: Warp to Nether, Mine Gold & Barter with Piglins ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Feet armor slot:', bot.inventory.slots[8]?.name);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Step into Nether Portal
if (bot.game.dimension === 'overworld') {
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 10
  });
  console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

  if (portals.length === 0) {
    throw new Error('No nether_portal blocks found within 8m of Beta!');
  }

  // Target lowest portal block
  portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const targetPortal = portals[0];
  console.log('Entering portal block at:', lib.fmt(targetPortal));

  const pCenter = targetPortal.offset(0.5, 0.2, 0.5);
  await bot.lookAt(pCenter, true);

  // Walk and jump into portal block
  bot.setControlState('forward', true);
  if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  console.log('Standing inside portal block, waiting for warp...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 30000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4 || cur.y < targetPortal.y - 0.2) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      if (cur.y < targetPortal.y) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp to the_nether; still in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('SUCCESS: Beta is in the_nether at:', lib.fmt(bot.entity.position));
configureFireAvoidance();

// Step out of Nether portal into bunker
await sleep(400);
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

bot.chat('Beta: Arrived in Nether wearing golden_boots! Piglin neutrality ACTIVE! Mining gold for Milestone 9!');

// Step 2: Equip stone_pickaxe and offhand shield
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');
if (bot.inventory.slots[45]?.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// Step 3: Scan and mine nether_gold_ore within 24m
const goldOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 24,
  count: 12
});
console.log(`Found ${goldOres.length} nether_gold_ore blocks:`, goldOres.map(p => lib.fmt(p)).join(', '));

let minedCount = 0;
for (const op of goldOres) {
  if (isCancelled()) break;
  console.log(`Approaching nether_gold_ore at ${lib.fmt(op)} (dist: ${bot.entity.position.distanceTo(op).toFixed(1)}m)...`);
  await clearFireAhead();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.5));
    const b = bot.blockAt(op);
    if (b && b.name === 'nether_gold_ore') {
      const currentPick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (currentPick) await bot.equip(currentPick, 'hand');
      await bot.dig(b);
      minedCount++;
      await sleep(200);
      await lib.pickup(4.0);
    }
  } catch (err) {
    console.log(`Mining note at ${lib.fmt(op)}:`, err.message);
  }
}

await lib.pickup(5.0);
const totalNuggets = lib.count('gold_nugget');
console.log(`Mining complete. Mined ${minedCount} ores. Total nuggets: ${totalNuggets}`);
bot.chat(`Beta: Mined ${minedCount} Nether Gold Ore blocks! Holding ${totalNuggets} nuggets (${Math.floor(totalNuggets/9)} ingots)`);

// Step 4: Craft gold ingots from nuggets
if (totalNuggets >= 9) {
  console.log('Crafting gold ingots with lib.craft...');
  const ingotsToCraft = Math.floor(totalNuggets / 9);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${lib.count('gold_ingot')} Gold Ingots for Piglin bartering!`);
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

// Step 5: Check for nearby Piglins to barter
const ingotsAvailable = lib.count('gold_ingot');
console.log(`Gold ingots ready for bartering: ${ingotsAvailable}`);

if (ingotsAvailable > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 20
  );
  console.log(`Found ${piglins.length} Piglins within 20m`);

  if (piglins.length > 0) {
    const piglin = piglins[0];
    const pDist = bot.entity.position.distanceTo(piglin.position);
    console.log(`Approaching Piglin at ${lib.fmt(piglin.position)} (dist: ${pDist.toFixed(1)}m)...`);

    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.5));
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);

      // Toss 1 gold ingot to piglin
      console.log('Tossing gold ingot to Piglin...');
      bot.chat('Beta: Tossing Gold Ingot to Piglin for bartering!');
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);

      console.log('Waiting 7s for Piglin barter evaluation...');
      await sleep(7000);
      await lib.pickup(4.5);

      const pearls = lib.count('ender_pearl');
      console.log(`Barter complete! Ender Pearls in inventory: ${pearls}`);
      if (pearls > 0) {
        bot.chat(`Beta: BARTER SUCCESS! Holding ${pearls} Ender Pearls!`);
      }
    } catch (e) {
      console.log('Barter note:', e.message);
    }
  }
}

console.log('=== Program 762 Final State ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  mined_ores: minedCount,
  hp: bot.health,
  food: bot.food
};
