console.log('=== WATCH PORTAL & IGNITE ===');
const sillPos = new Vec3(299, 72, -54);
const portalPos = new Vec3(299, 73, -54);

for (let i = 0; i < 20; i++) {
  const sill = bot.blockAt(sillPos);
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
  
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
  const playerInfo = players.map(p => `${p.username}: ${lib.fmt(p.position)} (dist ${p.position.distanceTo(bot.entity.position).toFixed(1)})`).join(', ');

  console.log(`[t=${i*1.5}s] Sill: ${sill ? sill.name : 'null'} | Portal: ${portal ? 'ACTIVE' : 'none'} | Players: ${playerInfo}`);

  if (portal) {
    console.log('PORTAL ACTIVE! Walking into portal...');
    bot.chat('delta: Portal is active! Warping into the_nether...');
    await bot.pathfinder.goto(new goals.GoalBlock(portalPos.x, portalPos.y, portalPos.z));
    await sleep(4500); // 4 seconds motionless warp
    break;
  }

  if (sill && sill.name === 'obsidian' && !portal) {
    console.log('Sill is obsidian! Equipping flint_and_steel and igniting...');
    try {
      await lib.ignite(299, 72, -54);
      await sleep(1000);
      const pAfter = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
      if (pAfter) {
        bot.chat('delta: NETHER PORTAL IGNITED! Warping now!');
        await bot.pathfinder.goto(new goals.GoalBlock(portalPos.x, portalPos.y, portalPos.z));
        await sleep(4500);
        break;
      }
    } catch (e) {
      console.log('Ignite attempt error:', e.message);
    }
  }

  await sleep(1500);
}

console.log('Final dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
