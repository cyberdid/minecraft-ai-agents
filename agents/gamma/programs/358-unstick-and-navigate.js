// programs/358-unstick-and-navigate.js
console.log('=== UNSTICK AND DIAGNOSE (341, 77, 32) ===');
const pos = bot.entity.position;
console.log('Exact pos:', pos);

// Check blocks around Gamma
const p = pos.floored();
for (let dy = -1; dy <= 2; dy++) {
  let row = `y=${p.y + dy}: `;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const b = bot.blockAt(p.offset(dx, dy, dz));
      row += `[${dx},${dz}:${b ? b.name : 'null'}] `;
    }
  }
  console.log(row);
}

// Clear any blocks around feet/head
await lib.equipWeapon();
for (let dy = 0; dy <= 1; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dz === 0 && dy === 0) continue;
      const b = bot.blockAt(p.offset(dx, dy, dz));
      if (b && b.boundingBox === 'block' && b.name.includes('leaves')) {
        console.log(`Digging leaf block at ${lib.fmt(b.position)}...`);
        try { await bot.dig(b); } catch (e) {}
      }
    }
  }
}

// Try jump or moving straight towards -Z (towards base at z=-54)
console.log('Testing manual movement with bot.setControlState...');
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
await sleep(1000);
bot.setControlState('forward', false);

console.log('Pos after test jump/walk:', lib.fmt(bot.entity.position));

// Now use lib.goToXZ towards base (294, -54)
console.log('Trying lib.goToXZ(294, -54)...');
try {
  await lib.goToXZ(294, -54);
  console.log('Arrived via goToXZ! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goToXZ error:', e.message);
  // Fallback: simple step towards base
  try {
    const moves = new Movements(bot, mcData);
    moves.canDig = true;
    moves.allowParkour = true;
    moves.allow1by1towers = true;
    bot.pathfinder.setMovements(moves);
    await bot.pathfinder.goto(new goals.GoalXZ(294, -54));
    console.log('Arrived via custom Movements! Pos:', lib.fmt(bot.entity.position));
  } catch (e2) {
    console.log('Custom Movements error:', e2.message);
  }
}

console.log('Ending pos:', lib.fmt(bot.entity.position));
