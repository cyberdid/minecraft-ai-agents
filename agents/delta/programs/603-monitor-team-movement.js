console.log('=== MONITOR TEAM MOVEMENT ===');
const start = Date.now();

for (let i = 0; i < 15; i++) {
  if (isCancelled()) break;
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

  if (portal) {
    console.log('PORTAL ACTIVE!');
    bot.chat('delta: NETHER PORTAL IS ACTIVE! Warping to Nether!');
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
    await sleep(4500);
    break;
  }

  if (sill && sill.name === 'obsidian') {
    console.log('Obsidian is placed! Igniting...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(800);
      const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (p) {
        bot.chat('delta: Ignited portal! Warping now!');
        await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
        await sleep(4500);
        break;
      }
    } catch (e) {
      console.log('Ignite error:', e.message);
    }
  }

  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  const pStr = players.map(p => `${p.username}@${lib.fmt(p.position)} [${p.heldItem?.name || 'empty'}]`).join(', ');
  console.log(`[t=${i*2}s] Sill: ${sill?.name} | ${pStr}`);

  await sleep(2000);
}
