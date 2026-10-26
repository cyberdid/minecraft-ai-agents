// programs/174-guide-beta-along-ridge.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Broadcast waypoints to Beta
bot.chat('delta: Welcome Beta! Follow East Ridge waypoints: (63, 64, -5) -> (62, 66, -30) -> (61, 67, -59) -> (54, 65, -90) -> bunker (44, 65, -127)!');

// 2. Position Delta at bunker junction
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -128));
} catch (e) {}

// 3. Track Beta for up to 25s
const start = Date.now();
while (Date.now() - start < 25000) {
  if (isCancelled()) break;
  const b = bot.players['beta'];
  if (b && b.entity) {
    const d = Math.round(bot.entity.position.distanceTo(b.entity.position));
    console.log(`Beta pos: ${lib.fmt(b.entity.position)}, distance: ${d}m, held: ${b.entity.heldItem?.name || 'none'}`);
    if (d <= 6) {
      console.log('BETA AT THE DOORWAY!');
      bot.chat('delta: Welcome inside Beta! Move into advance hallway at (44, 65, -133). 100% blast-proof and safe.');
      break;
    }
  } else {
    console.log('Beta moving along ridge trail...');
  }
  await sleep(3000);
}

// 4. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
