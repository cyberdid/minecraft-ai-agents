// programs/157-receive-gamma-at-bunker.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Move to bunker center at (44.5, 65.0, -129.0) to meet Gamma at entrance
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {}

console.log('Meeting position:', lib.fmt(bot.entity.position));

// 2. Track Gamma for up to 30s
const start = Date.now();
while (Date.now() - start < 30000) {
  if (isCancelled()) break;
  const g = bot.players['gamma'];
  if (g && g.entity) {
    const d = Math.round(bot.entity.position.distanceTo(g.entity.position));
    console.log(`Gamma pos: ${lib.fmt(g.entity.position)}, distance: ${d}m`);
    if (d <= 6) {
      console.log('GAMMA HAS REACHED THE BUNKER!');
      bot.chat('delta: Welcome Gamma! Step inside the 7m fortified hallway. Fortress bunker is 100% blast-proof. Blaze Spawner at (32, 68, -190) is 4 blocks away!');
      break;
    }
  }
  await sleep(3000);
}

// 3. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
