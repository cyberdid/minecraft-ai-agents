console.log('=== TRACK PORTAL AND PLAYERS ===');
const sill = bot.blockAt(new Vec3(299, 72, -54));
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

console.log(`Sill: ${sill?.name}, Portal: ${portal ? 'ACTIVE' : 'none'}`);

const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'empty'}`);
}

if (portal) {
  console.log('PORTAL ACTIVE! Entering...');
  bot.chat('delta: Nether portal is active! Warping to Nether!');
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  await sleep(4500);
} else if (sill && sill.name === 'obsidian') {
  console.log('Obsidian is placed! Igniting...');
  try {
    await lib.ignite(299, 72, -54);
    await sleep(800);
    const p = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
    if (p) {
      bot.chat('delta: Ignited portal! Warping to Nether!');
      await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
      await sleep(4500);
    }
  } catch (e) {
    console.log('Ignite error:', e.message);
  }
}
