// programs/428-shield-up-and-slay.js
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Immediately raise shield in off-hand!
console.log('RAISING SHIELD IN OFF-HAND...');
bot.activateItem(true);
await sleep(300);

// 2. Check for nearby hostiles
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && bot.entity.position.distanceTo(e.position) <= 20);
console.log(`Hostiles nearby (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.position)} dist=${bot.entity.position.distanceTo(h.position).toFixed(1)}`).join(', ') || 'none');

const skel = hostiles.find(h => h.name === 'skeleton');
if (skel) {
  console.log(`Facing skeleton at ${lib.fmt(skel.position)} with raised shield...`);
  await bot.lookAt(skel.position.offset(0, 1.4, 0), true);
  
  // Place a protective cobblestone barricade in front if cobble available
  if (lib.count('cobblestone') >= 2) {
    const dir = skel.position.minus(bot.entity.position).normalize();
    const barricadePos = bot.entity.position.floored().offset(Math.round(dir.x), 0, Math.round(dir.z));
    try {
      console.log(`Placing protective barrier at ${lib.fmt(barricadePos)}...`);
      await lib.place('cobblestone', barricadePos.x, barricadePos.y, barricadePos.z);
    } catch (e) {
      console.log('Barrier note:', e.message);
    }
  }
}

// 3. Check if there are dropped items nearby to vacuum
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
if (items.length > 0) {
  try {
    const p = await lib.pickup(4);
    console.log(`Vacuumed ${p} items!`);
  } catch (e) {}
}

console.log('Status after shield raise: HP:', bot.health, 'Inv:', JSON.stringify(lib.inv()));
return { hp: bot.health, pos: bot.entity.position };
