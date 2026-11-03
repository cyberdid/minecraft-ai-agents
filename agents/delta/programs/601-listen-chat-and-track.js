console.log('=== LISTEN TO CHAT & TRACK TEAM ===');
const start = Date.now();

while (Date.now() - start < 20000 && !isCancelled()) {
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  const pStr = players.map(p => `${p.username}@${lib.fmt(p.position)} [${p.heldItem?.name || 'empty'}]`).join(', ');
  console.log(`[${Math.round((Date.now() - start)/1000)}s] Players: ${pStr}`);

  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  if (portal) {
    console.log('PORTAL ACTIVE!');
    bot.chat('delta: Portal is lit! Warping to Nether!');
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
    await sleep(4500);
    break;
  }
  if (sill && sill.name === 'obsidian' && !portal) {
    console.log('Obsidian placed! Igniting...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(1000);
      const p2 = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (p2) {
        bot.chat('delta: Ignited portal! Warping to Nether!');
        await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
        await sleep(4500);
        break;
      }
    } catch (e) {
      console.log('Ignite error:', e.message);
    }
  }

  await sleep(2000);
}
