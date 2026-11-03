// programs/541-hunt-plains-food.js
console.log('=== DELTA: SCAN & HUNT IN PLAINS ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Scan peaceful animals in 64m
const mobs = Object.values(bot.entities).filter(e =>
  e !== bot.entity &&
  ['sheep', 'pig', 'cow', 'chicken'].includes(e.name)
).map(e => ({
  id: e.id,
  name: e.name,
  pos: lib.fmt(e.position),
  dist: bot.entity.position.distanceTo(e.position).toFixed(1),
  rawPos: e.position
})).sort((a, b) => a.dist - b.dist);

console.log(`Passive mobs found: ${mobs.length}`);
for (const m of mobs) {
  console.log(`  ${m.name} at ${m.pos} (dist: ${m.dist})`);
}

// If animals found, hunt the closest one!
if (mobs.length > 0) {
  const target = mobs[0];
  console.log(`Hunting ${target.name}...`);
  await lib.equipWeapon();
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.rawPos.x, target.rawPos.y, target.rawPos.z, 2));
    const entity = bot.entities[target.id];
    if (entity) {
      await bot.lookAt(entity.position.offset(0, entity.height * 0.5, 0), true);
      bot.attack(entity);
      await sleep(650);
      if (entity.isValid) {
        bot.attack(entity);
        await sleep(650);
      }
      await lib.pickup(5);
    }
  } catch (e) {
    console.log('Hunt attack notice:', e.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
return { mobs: mobs.length, inv: lib.inv() };
