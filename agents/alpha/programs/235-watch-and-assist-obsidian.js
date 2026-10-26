// programs/235-watch-and-assist-obsidian.js
console.log('=== Program 235: Obsidian Mining at Lake Edge ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Loop for 30s watching for obsidian and assisting
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  
  // 1. Check Beta status
  const beta = bot.players.beta?.entity;
  if (beta) {
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(beta.position)}, held: ${beta.heldItem?.name}`);
  }
  
  // 2. Scan obsidian blocks
  const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 16, count: 20 });
  if (obs.length > 0) {
    console.log(`Found ${obs.length} obsidian blocks at pool!`);
  }
  
  // 3. Pickup any drops
  const gained = await lib.pickup(6);
  if (gained > 0) {
    console.log(`Picked up drops! Obsidian now: ${lib.count('obsidian')}`);
  }
  
  // Eat if we picked up food
  for (const f of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton']) {
    if (lib.count(f) > 0) {
      try { if (typeof safeEat === 'function') await safeEat(f); else await lib.eat(); } catch (e) {}
    }
  }

  // 4. If Alpha picked up diamond pickaxe, help mine obsidian
  if (lib.count('diamond_pickaxe') > 0 && obs.length > 0 && lib.count('obsidian') < 10) {
    const diaPick = mcData.itemsByName.diamond_pickaxe.id;
    await bot.equip(diaPick, 'hand');
    console.log(`Mining obsidian at ${lib.fmt(obs[0])}...`);
    try {
      await lib.dig(obs[0].x, obs[0].y, obs[0].z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig obsidian note:', e.message);
    }
  }

  await sleep(1500);
}

const finalObs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 16, count: 20 });
console.log(`Total obsidian in Alpha inventory: ${lib.count('obsidian')}, obsidian in lake: ${finalObs.length}`);
bot.chat(`beta: Obsidian status: Alpha holds ${lib.count('obsidian')}/10, lake has ${finalObs.length} obsidian blocks!`);
