// programs/177-track-alpha-ridge-run.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Position at bunker entrance
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -128));
} catch (e) {}

// 2. Track Alpha for up to 25s
const start = Date.now();
while (Date.now() - start < 25000) {
  if (isCancelled()) break;
  const a = bot.players['alpha'];
  if (a && a.entity) {
    const d = Math.round(bot.entity.position.distanceTo(a.entity.position));
    console.log(`Alpha pos: ${lib.fmt(a.entity.position)}, distance: ${d}m, held: ${a.entity.heldItem?.name || 'none'}`);
    if (d <= 6) {
      console.log('ALPHA REACHED BUNKER!');
      bot.chat('delta: Welcome Alpha! Step inside the 7m blast-proof hallway. Floor is 100% complete to z=-140!');
      break;
    }
  } else {
    console.log('Alpha moving along ridge trail...');
  }
  await sleep(3000);
}

// 3. Move back into advance tunnel
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 4. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
