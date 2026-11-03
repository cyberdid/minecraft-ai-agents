// programs/539-tunnel-to-gold-ore.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 539: TUNNEL TO GOLD ORE VEIN ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Walk to Crafting Table inside bunker at (44, 65, -134)
try {
  await lib.goTo(44, 65, -133, 1.2, { timeoutMs: 6000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -133, 1.0));
  } catch (e2) {}
}

console.log('At bunker corridor pos:', lib.fmt(bot.entity.position));

// Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') ||
             bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Target gold ore vein at (34, 74, -135)
const targetOre = new Vec3(34, 74, -135);
console.log(`Targeting gold ore at ${lib.fmt(targetOre)} from ${lib.fmt(bot.entity.position)}...`);

// Step 2: Excavate upward staircase going West (-X) and Up (+Y) at z=-134
let curX = 43;
let curY = 65;
const curZ = -134;

for (let step = 0; step < 8 && !isCancelled(); step++) {
  console.log(`Digging step ${step + 1}: target x=${curX}, y=${curY}..${curY + 2}`);
  
  // Dig 2-3 blocks high clearance ahead
  for (let dy = 0; dy <= 2; dy++) {
    const b = bot.blockAt(new Vec3(curX, curY + dy, curZ));
    if (b && b.name !== 'air' && b.boundingBox === 'block') {
      try {
        await bot.dig(b);
      } catch (e) {}
    }
  }

  // Ensure solid floor underfoot at (curX, curY - 1, curZ)
  const floor = bot.blockAt(new Vec3(curX, curY - 1, curZ));
  if (!floor || floor.boundingBox !== 'block') {
    const cob = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
    if (cob) {
      try {
        await bot.equip(cob, 'hand');
        const neighbor = bot.blockAt(new Vec3(curX + 1, curY - 1, curZ));
        if (neighbor) await bot.placeBlock(neighbor, new Vec3(-1, 0, 0));
      } catch (e) {}
    }
  }

  // Move onto this step
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(curX, curY, curZ));
  } catch (e) {
    await bot.lookAt(new Vec3(curX + 0.5, curY + 1.0, curZ + 0.5), true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < curY) bot.setControlState('jump', true);
    await sleep(400);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);
  }

  await lib.pickup(3.0);

  // Check if any nether_gold_ore is now in reach (<= 4.5m)
  const reachableOres = bot.findBlocks({
    matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_block'),
    maxDistance: 4.5,
    count: 10
  });

  if (reachableOres.length > 0) {
    console.log(`REACHED GOLD VEIN! Found ${reachableOres.length} reachable gold ore blocks!`);
    for (const op of reachableOres) {
      console.log(`Mining nether_gold_ore at ${lib.fmt(op)}...`);
      try {
        if (pick) await bot.equip(pick, 'hand');
        await lib.dig(op.x, op.y, op.z);
        await lib.pickup(3.5);
      } catch (e) {
        console.log('Mining note:', e.message);
      }
    }
    break;
  }

  curX--;
  curY++;
}

// Vacuum all drops
await lib.pickup(5.0);

// Step 3: Return down staircase to Bunker at (44, 65, -134)
console.log('Returning down staircase to bunker crafting table...');
try {
  await lib.goTo(44, 65, -134, 1.5, { dig: false, timeoutMs: 8000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -134, 1.0));
  } catch (e2) {}
}

// Step 4: Craft nuggets into ingots
const nuggets = lib.count('gold_nugget');
console.log(`Total gold_nugget in inventory: ${nuggets}`);
if (nuggets >= 9) {
  try {
    const crafts = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', crafts);
    console.log(`Crafted ${crafts} gold_ingot! Total: ${lib.count('gold_ingot')}`);
    bot.chat(`gamma: Successfully mined Nether gold vein and crafted ${crafts} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Crafting note:', e.message);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldNuggets: lib.count('gold_nugget'),
  goldIngots: lib.count('gold_ingot'),
  inv: lib.inv()
};
