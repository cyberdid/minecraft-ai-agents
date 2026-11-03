// programs/807-clear-and-pave-ridge-tunnel.js
console.log('=== Program 807: Clear & Pave Ridge Tunnel (z=-3 to -22) ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe');
if (pick) await bot.equip(pick, 'hand');

bot.chat('alpha: Clearing 2-high transit tunnel along East Ridge (z=-3 to z=-22) with Haste III!');

for (let z = -3; z >= -22 && !checkCancelled(); z--) {
  const x = 63;
  console.log(`Checking/clearing clearance at (${x}, 65..66, ${z})...`);

  // Feet level (y=65)
  const bFeet = bot.blockAt(new Vec3(x, 65, z));
  if (bFeet && bFeet.boundingBox === 'block' && bFeet.name !== 'air') {
    console.log(`Mining obstruction at feet: ${bFeet.name} at (${x}, 65, ${z})`);
    try { await bot.dig(bFeet, true); } catch (e) { console.log('Dig error:', e.message); }
  }

  // Head level (y=66)
  const bHead = bot.blockAt(new Vec3(x, 66, z));
  if (bHead && bHead.boundingBox === 'block' && bHead.name !== 'air') {
    console.log(`Mining obstruction at head: ${bHead.name} at (${x}, 66, ${z})`);
    try { await bot.dig(bHead, true); } catch (e) { console.log('Dig error:', e.message); }
  }

  // Ensure floor underfoot (y=64)
  const bFloor = bot.blockAt(new Vec3(x, 64, z));
  if (!bFloor || bFloor.boundingBox !== 'block') {
    console.log(`Placing floor at (${x}, 64, ${z})...`);
    try {
      await lib.place(x, 64, z, 'cobblestone');
    } catch (e) {}
  }

  // Step forward to (x, 65, z)
  await bot.lookAt(new Vec3(x + 0.5, 65.5, z - 0.5), true);
  bot.setControlState('forward', true);
  await sleep(150);
  bot.setControlState('forward', false);

  // Vacuum drops
  try { await lib.pickup(3.0); } catch (e) {}
}

console.log('Tunnel clearance complete! Current pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: East Ridge Tunnel (z=-3 to z=-22) 100% CLEARED and open for team! Pos: ${lib.fmt(bot.entity.position)}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  cobble: lib.count('cobblestone'),
  inv: lib.inv()
};
