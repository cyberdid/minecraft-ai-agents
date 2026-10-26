// programs/229-follow-to-lava-lake.js
console.log('=== Program 229: Follow Beta to Lava Lake at (285, 18, 7) ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const targetArea = new Vec3(285, 18, 7);

for (let step = 0; step < 20; step++) {
  if (isCancelled()) break;
  
  // 1. Check hostiles
  const hostiles = lib.hostiles(8);
  if (hostiles.length > 0) {
    console.log(`Hostile detected: ${hostiles[0].name} at ${lib.fmt(hostiles[0].pos)}! Fighting...`);
    const sword = mcData.itemsByName.stone_sword?.id;
    if (sword) await bot.equip(sword, 'hand');
    await lib.fight(8, 5).catch(() => {});
  }

  // 2. Locate Beta
  const beta = bot.players.beta?.entity;
  if (beta) {
    const dist = beta.position.distanceTo(bot.entity.position);
    console.log(`Step ${step+1}: Beta at ${lib.fmt(beta.position)} (dist: ${dist.toFixed(1)}m), held: ${beta.heldItem?.name}`);
    if (dist > 3) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(beta.position.x, beta.position.y, beta.position.z, 2));
      } catch (e) {}
    }
  } else {
    console.log(`Step ${step+1}: Beta not in sight. Navigating towards target area (285, 18, 7)...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetArea.x, targetArea.y, targetArea.z, 4));
    } catch (e) {}
  }

  // 3. Scan for lava / obsidian
  const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 24, count: 50 });
  const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 24, count: 20 });
  if (lavas.length > 0 || obs.length > 0) {
    console.log(`  Nearby: ${lavas.length} lava blocks, ${obs.length} obsidian blocks!`);
  }

  // 4. Pickup any drops nearby
  await lib.pickup(5);

  await sleep(1500);
}

console.log('Alpha pos now:', lib.fmt(bot.entity.position));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Alpha with you! Pos: ${lib.fmt(bot.entity.position)}. Obsidian on Alpha: ${lib.count('obsidian')}.`);
