// programs/233-meet-and-quench-lava.js
console.log('=== Program 233: Meet Beta & Quench 10 Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: makeObsidianSafe ready in team/autoload.js (fixes cave_air bug)! I am at (287, 19, 8) at the lava lake waiting for you!');

// Loop for 30s waiting for Beta / checking inventory
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  
  // Check Beta
  const beta = bot.players.beta?.entity;
  if (beta) {
    const dist = beta.position.distanceTo(bot.entity.position);
    console.log(`Beta at ${lib.fmt(beta.position)} (${dist.toFixed(1)}m away), held: ${beta.heldItem?.name}`);
    if (dist < 4) {
      console.log('Beta is right next to Alpha!');
      // Pickup any tossed items
      await lib.pickup(5);
      
      // If we got food, eat
      for (const food of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton']) {
        if (lib.count(food) > 0) {
          try { if (typeof safeEat === 'function') await safeEat(food); else await lib.eat(); } catch (e) {}
        }
      }
      
      // If Alpha holds diamond_pickaxe & water_bucket, make obsidian directly!
      if (lib.count('diamond_pickaxe') > 0 && lib.count('water_bucket') > 0 && lib.count('obsidian') < 10) {
        console.log('Alpha holds diamond_pickaxe and water_bucket! Running makeObsidianSafe(10)...');
        try {
          const res = await makeObsidianSafe(10);
          console.log('makeObsidianSafe result:', JSON.stringify(res));
          bot.chat(`beta: 10 obsidian mined! Count: ${lib.count('obsidian')}. Returning to base portal!`);
        } catch (e) {
          console.log('makeObsidianSafe note:', e.message);
        }
      }
    }
  } else {
    console.log('Beta descending...');
  }
  
  // Fight any hostile in 6m
  const hostiles = lib.hostiles(6);
  if (hostiles.length > 0) {
    const sword = mcData.itemsByName.stone_sword?.id;
    if (sword) await bot.equip(sword, 'hand');
    await lib.fight(6, 3).catch(() => {});
  }
  
  await sleep(2000);
}

// Check obsidian count in loaded chunks
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 24, count: 20 });
console.log(`Obsidian blocks nearby: ${obs.length}, in inventory: ${lib.count('obsidian')}`);

bot.chat(`beta: Alpha update: Pos ${lib.fmt(bot.entity.position)}, Obsidian in inv: ${lib.count('obsidian')}, in lake: ${obs.length}.`);
