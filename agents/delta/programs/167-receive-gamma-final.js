// programs/167-receive-gamma-final.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Stand at bunker entrance
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -128));
} catch (e) {}

// 2. Track Gamma for up to 25s
const start = Date.now();
while (Date.now() - start < 25000) {
  if (isCancelled()) break;
  const g = bot.players['gamma'];
  if (g && g.entity) {
    const d = Math.round(bot.entity.position.distanceTo(g.entity.position));
    console.log(`Gamma pos: ${lib.fmt(g.entity.position)}, distance: ${d}m, held: ${g.entity.heldItem?.name || 'none'}`);
    if (d <= 6) {
      console.log('GAMMA AT THE DOORWAY!');
      bot.chat('delta: Welcome inside Gamma! Move into the advance hallway at (44, 65, -133). 100% blast-proof and safe.');
      break;
    }
  }
  await sleep(3000);
}

// 3. Move together into advance tunnel
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 4. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
