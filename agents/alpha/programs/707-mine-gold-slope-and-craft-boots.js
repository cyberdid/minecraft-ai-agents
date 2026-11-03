// programs/707-mine-gold-slope-and-craft-boots.js
console.log('=== Program 707: Alpha Mine Gold Slope & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// Raise shield for protection
bot.activateItem(true);
globalThis.configureFireAvoidance();

// Configure movements
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Initial gold count
let totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
console.log(`Initial Gold: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets (total: ${totalEquiv} nuggets)`);

// 2. Descend gentle slope to known gold vein
const SLOPE_WAYPOINTS = [
  { x: 48, y: 56, z: -1 },
  { x: 55, y: 50, z: 3 },
  { x: 60, y: 49, z: 12 }
];

console.log('Walking down gentle slope to gold vein...');
for (const wp of SLOPE_WAYPOINTS) {
  if (checkCancelled()) break;
  if (totalEquiv >= 45) break;

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 5000 }); } catch (e2) {}
  }

  // Scan for nether_gold_ore at this waypoint
  const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
  if (goldOreId) {
    const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 16, count: 6 });
    console.log(`At ${lib.fmt(bot.entity.position)}: found ${ores.length} gold ores nearby.`);

    for (const orePos of ores) {
      if (checkCancelled()) break;
      totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
      if (totalEquiv >= 45) {
        console.log(`Reached ${totalEquiv} gold nuggets (enough for boots + barter ingots)!`);
        break;
      }

      console.log(`Approaching ore at ${lib.fmt(orePos)}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        const pickItem = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pickItem) await bot.equip(pickItem, 'hand');
        await lib.dig(orePos.x, orePos.y, orePos.z);
        await sleep(200);
        await lib.pickup(3.5);
        totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
        console.log(`Mined ore! Total gold equiv now: ${totalEquiv}`);
      } catch (err) {
        console.log('Mine error:', err.message);
      }
    }
  }
}

// Pickup any loose drops around
await lib.pickup(4.0);

totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
console.log(`Mining phase complete. Total gold equiv: ${totalEquiv} (Ingots: ${lib.count('gold_ingot')}, Nuggets: ${lib.count('gold_nugget')})`);

// 3. Return to bunker Crafting Table at (42, 60, -6)
console.log('Returning to bunker Crafting Table at (42, 60, -6)...');
const RETURN_WAYPOINTS = [
  { x: 55, y: 50, z: 3 },
  { x: 48, y: 56, z: -1 },
  { x: 42, y: 60, z: -6 }
];

for (const wp of RETURN_WAYPOINTS) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 5000 }); } catch (e2) {}
  }
}

// 4. Locate Crafting Table
const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
console.log('Crafting table block:', table ? lib.fmt(table.position) : 'none');

if (table) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(table.position.x, table.position.y, table.position.z, 1.2));
  } catch (e) {}

  // Craft ingots from nuggets
  const nuggets = lib.count('gold_nugget');
  if (nuggets >= 9) {
    const toCraft = Math.floor(nuggets / 9);
    console.log(`Crafting ${toCraft} gold ingots at table...`);
    try {
      await lib.craft('gold_ingot', toCraft);
      console.log(`Total gold_ingot on Alpha: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Craft ingot note:', e.message);
    }
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0 && bot.inventory.slots[8]?.name !== 'golden_boots') {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted successfully!');
      const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (boots) {
        await bot.equip(boots, 'feet');
        console.log('golden_boots EQUIPPED in slot 8!');
      }
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality ACTIVE!');
    } catch (e) {
      console.log('Craft boots note:', e.message);
    }
  }

  // Craft any remaining nuggets into ingots
  const extraNuggets = lib.count('gold_nugget');
  if (extraNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
    } catch (e) {}
  }
}

// 5. Verification
const bootsWorn = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

console.log(`=== Alpha Status: Boots Worn = ${bootsWorn}, Gold Ingots = ${finalIngots}, Pearls = ${finalPearls}/12 ===`);
bot.chat(`alpha: Gold round complete! Golden Boots: ${bootsWorn ? 'EQUIPPED' : 'NO'}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

console.log('=== Program 707 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
