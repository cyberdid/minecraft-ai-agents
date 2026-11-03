// programs/645-descend-craft-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 645: SAFE DESCENT, CRAFT INGOTS & BARTER ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Safe movement configuration (strictly no falling)
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.maxDropDown = 1; // Strict 1-block descent only to prevent fall damage!
moves.allowParkour = false;
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// 3. Descend to Bunker (44, 65, -131)
console.log('Carefully descending to Bunker at (44, 65, -131)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44, 65, -131, 1.5));
  console.log('Arrived at Bunker! Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
} catch (e) {
  console.log('Descent pathfinder error:', e.message);
  // Try intermediate waypoint at staircase top/middle
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 69, -134, 1.5));
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -131, 1.5));
  } catch (e2) {
    console.log('Fallback descent error:', e2.message);
  }
}

// 4. Find Crafting Table in Bunker
let table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 16 });
if (!table) {
  console.log('Crafting table not found within 16m, scanning 32m...');
  table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 32 });
}

if (table) {
  console.log(`Crafting table located at ${lib.fmt(table.position)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(table.position.x, table.position.y, table.position.z, 2.0));
  } catch (e) {}

  const nuggets = lib.count('gold_nugget');
  console.log(`Nuggets available: ${nuggets}`);
  if (nuggets >= 9) {
    const toCraft = Math.floor(nuggets / 9);
    console.log(`Crafting ${toCraft} gold ingots...`);
    try {
      await lib.craft('gold_ingot', toCraft);
      console.log(`Crafted! Current gold_ingots: ${lib.count('gold_ingot')}`);
      bot.chat(`gamma: Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    } catch (err) {
      console.log('lib.craft gold_ingot failed:', err.message);
    }
  }
} else {
  console.log('No crafting table nearby! Check if teammates have tables.');
}

// 5. Check if we have gold ingots now
let ingots = lib.count('gold_ingot');
console.log(`Gold ingots ready for bartering: ${ingots}`);

// 6. Barter with neutral Piglins at (43, 67, -116..-117)
if (ingots > 0) {
  console.log('Navigating to Piglin bartering post at (43, 67, -117)...');
  try {
    // Relax maxDropDown slightly for the 2-block ridge climb/descent
    moves.maxDropDown = 2;
    bot.pathfinder.setMovements(moves);
    await bot.pathfinder.goto(new goals.GoalNear(43, 67, -117, 2.5));
  } catch (e) {
    console.log('Pathfind to piglin post error:', e.message);
  }

  // Find reachable Piglin
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 6.0
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  console.log(`Reachable Piglins: ${piglins.length}`);

  if (piglins.length > 0) {
    const piglin = piglins[0];
    console.log(`Starting barter rounds with Piglin at ${lib.fmt(piglin.position)}...`);

    for (let r = 0; r < ingots && !isCancelled(); r++) {
      // Ensure golden boots still equipped
      if (bot.inventory.slots[8]?.name !== 'golden_boots') {
        const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
        if (gb) await bot.equip(gb, 'feet');
      }

      const curIngot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (!curIngot) break;

      await bot.equip(curIngot, 'hand');
      await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);

      console.log(`Handing ingot ${r + 1}/${ingots} to Piglin...`);
      try {
        bot.activateEntity(piglin);
        bot.chat(`gamma: Bartering gold ingot ${r + 1}/${ingots} with Piglin!`);
      } catch (ae) {
        console.log('activateEntity failed, tossing ingot:', ae.message);
        await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      }

      console.log('Waiting 8.5 seconds for barter inspection...');
      await sleep(8500);

      // Vacuum rewards
      await lib.pickup(5.0);

      // Check if food dropped and eat if hungry
      const foods = ['cooked_porkchop', 'bread', 'apple'];
      for (const f of foods) {
        if (lib.count(f) > 0 && bot.food < 18) {
          console.log(`Eating dropped ${f} to heal!`);
          try { await lib.eat(); } catch (e) {}
          break;
        }
      }

      console.log(`Barter round ${r + 1} complete. Current Pearls: ${lib.count('ender_pearl')}, HP: ${bot.health}`);
    }
  } else {
    console.log('No piglin within 6m right now.');
  }
}

// 7. Re-vacuum area
await lib.pickup(6.0);

// Re-equip weapons/shield
try { await lib.equipWeapon(); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

const finalPearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 645: Gamma Pearls: ${finalPearls}, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);
bot.chat(`gamma: Barter round finished! Pearls held: ${finalPearls}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  pearls: finalPearls,
  ingots: lib.count('gold_ingot'),
  nuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
