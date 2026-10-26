// programs/568-mine-cobble-at-shaft-and-transit-nether.js
console.log('=== Step: Mine 32+ Cobblestone at Shaft and Transit to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Mine 3 stone with wooden pickaxe
console.log('Mining 3 stone for stone pickaxe...');
for (let s = 0; s < 5; s++) {
  if (lib.count('cobblestone') >= 3) break;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Stone dig note:', e.message);
    }
  }
}

console.log('Cobblestone after 3 stone:', lib.count('cobblestone'), 'Inv:', JSON.stringify(lib.inv()));
if (lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone_pickaxe! Inv:', JSON.stringify(lib.inv()));
}

// 2. Mine 32+ cobblestone with stone pickaxe
console.log('Mining 32+ cobblestone...');
let digs = 0;
while (lib.count('cobblestone') < 32 && digs < 45 && !isCancelled()) {
  digs++;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id, mcData.blocksByName.andesite?.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Cobble dig note:', e.message);
    }
  } else {
    // Step forward into the shaft
    try {
      await bot.pathfinder.goto(new goals.GoalNear(bot.entity.position.x, bot.entity.position.y - 1, bot.entity.position.z + 1, 1));
    } catch (e2) {
      break;
    }
  }
}

console.log('Final Cobblestone count:', lib.count('cobblestone'));

// Craft stone swords
if (lib.count('stick') < 2) await lib.craft('stick', 4);
try {
  await lib.craft('stone_sword', 1);
} catch (e) {}
await lib.equipWeapon();
console.log('Armed with weapon! Inv:', JSON.stringify(lib.inv()));

// 3. Sprint to Nether Portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting to Nether portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  try {
    await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
  } catch (e2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(2000);
    bot.clearControlStates();
  }
}

console.log('Inside portal at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 4. Wait for Nether warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.chat(`beta: Re-armed with stone tools & ${lib.count('cobblestone')} cobble! In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Sprinting to spawner front!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
