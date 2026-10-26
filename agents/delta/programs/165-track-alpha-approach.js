// programs/165-track-alpha-approach.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Send path warning to Alpha
bot.chat('delta: Alpha, follow high ridge (x=63). Beware fire patches at z=-60! Delta is waiting at bunker (44, 65, -129).');

// 2. Position Delta at bunker junction
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {}

// 3. Track Alpha for up to 25s
const start = Date.now();
while (Date.now() - start < 25000) {
  if (isCancelled()) break;
  const a = bot.players['alpha'];
  if (a && a.entity) {
    const d = Math.round(bot.entity.position.distanceTo(a.entity.position));
    console.log(`Alpha pos: ${lib.fmt(a.entity.position)}, distance: ${d}m, held: ${a.entity.heldItem?.name || 'none'}`);
    if (d <= 6) {
      console.log('ALPHA HAS ARRIVED AT BUNKER!');
      bot.chat('delta: Welcome Alpha! Step inside the 7m blast-proof hallway. Delta has tunnel secured to z=-135!');
      break;
    }
  } else {
    console.log('Alpha moving along ridge trail...');
  }
  await sleep(3000);
}

// 4. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
