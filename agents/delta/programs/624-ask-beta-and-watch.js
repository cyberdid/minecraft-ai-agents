bot.chat('beta: Beta, do you have the lava bucket? Let us know when you begin ascending!');

const sillPos = new Vec3(299, 72, -54);
const portalPos = new Vec3(299, 73, -54);

const start = Date.now();
while (!isCancelled() && Date.now() - start < 30000) {
  const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
  const sill = bot.blockAt(sillPos);
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

  if (Math.round((Date.now() - start)/1000) % 3 === 0) {
    console.log(`[${Math.round((Date.now() - start)/1000)}s] Sill: ${sill?.name} | Beta: ${beta ? lib.fmt(beta.position) + ' [' + (beta.heldItem?.name || '') + ']' : 'in deep shaft'}`);
  }

  if (portal) {
    console.log('PORTAL ACTIVE!');
    bot.chat('delta: NETHER PORTAL ACTIVE! Warping to Nether!');
    await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
    await sleep(4500);
    break;
  }

  if (sill && sill.name === 'obsidian') {
    console.log('Obsidian placed! Igniting...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(600);
      const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (p) {
        bot.chat('delta: NETHER PORTAL IGNITED! Warping now!');
        await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
        await sleep(4500);
        break;
      }
    } catch (e) {
      console.log('Ignite error:', e.message);
    }
  }

  await sleep(1500);
}
