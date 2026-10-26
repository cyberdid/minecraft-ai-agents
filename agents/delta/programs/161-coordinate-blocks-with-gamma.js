// programs/161-coordinate-blocks-with-gamma.js
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check nearby items on ground
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 5);
console.log(`Nearby items on ground: ${items.length}`);
for (const it of items) {
  let name = 'unknown';
  let count = 1;
  try {
    if (typeof it.getDroppedItem === 'function') {
      const o = it.getDroppedItem();
      if (o) { name = o.name; count = o.count; }
    }
  } catch (e) {}
  console.log(`- Item ${count}x ${name} at ${lib.fmt(it.position)} dist ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 2. Pick up any dropped items
if (items.length > 0) {
  try {
    await lib.pickup(4);
    console.log('Picked up nearby items! Inventory now:', JSON.stringify(lib.inv()));
  } catch (e) {}
}

// 3. Ask Gamma for cobblestone to assist bridging
bot.chat('delta: Gamma, please toss 10 cobblestone to Delta at (44, 65, -133)! Together we can bridge the 4 blocks to z=-140.');

// 4. Check for Alpha and Beta in dimension
for (const name of ['alpha', 'beta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`Player ${name} active in Nether: pos=${lib.fmt(p.entity.position)}, dist=${d}m`);
  } else {
    console.log(`Player ${name} in transit / loading chunks.`);
  }
}

// Equip weapon
await lib.equipWeapon();
console.log('Delta inventory:', JSON.stringify(lib.inv()));
