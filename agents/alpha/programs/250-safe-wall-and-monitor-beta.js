// programs/250-safe-wall-and-monitor-beta.js
console.log('=== Program 250: Safe Defense & Monitor Beta Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Block tunnel towards zombies if they are within 10m
const hostiles = lib.hostiles(12);
console.log(`Hostiles in 12m: ${hostiles.length}`);
for (const h of hostiles) {
  console.log(`  Hostile: ${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m away)`);
}

// 2. Monitor Beta and chat for 30s
for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  
  const b = bot.players.beta?.entity;
  if (b) {
    console.log(`[t=${i*2}s] Beta pos: ${lib.fmt(b.position)}, held: ${b.heldItem?.name}`);
  }
  
  await sleep(2000);
}

bot.chat('beta: Alpha safe in tunnel monitoring your progress! Obsidian status?');
console.log('Finished 250. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health);
