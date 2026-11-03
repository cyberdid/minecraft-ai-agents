// programs/855-excavate-stronghold.js
console.log('=== Program 855: Excavate Stronghold at (233, y, -98) ===');
console.log('Alpha starting at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const isStrongholdBlock = (b) => {
  if (!b) return false;
  return b.name.includes('stone_brick') || b.name === 'end_portal_frame' || b.name === 'iron_bars';
};

// Check if already near Stronghold XZ
const cur = bot.entity.position;
const distToStronghold = Math.hypot(cur.x - 233, cur.z - (-98));
console.log(`Distance to Stronghold column: ${distToStronghold.toFixed(1)}m`);

if (distToStronghold > 5.0) {
  console.log('Navigating to surface above Stronghold (233, y, -98)...');
  try {
    await lib.goToXZ(233, -98, { timeoutMs: 30000 });
  } catch (e) {
    console.log('goToXZ error:', e.message);
  }
}

console.log(`At excavation column: pos=${lib.fmt(bot.entity.position)}`);
bot.chat('alpha: Commencing safe 2x1 staircase descent at (233, y, -98) to locate Stronghold!');

// Equip iron pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Safe 2x1 descent down from current Y to y=10
let foundStronghold = false;
let currentY = Math.floor(bot.entity.position.y);

while (currentY > 10 && !foundStronghold) {
  // Check blocks beneath in a 3x3 area
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      for (let dy = -3; dy <= 0; dy++) {
        const checkPos = new Vec3(233 + dx, currentY + dy, -98 + dz);
        const b = bot.blockAt(checkPos);
        if (isStrongholdBlock(b)) {
          foundStronghold = true;
          console.log(`STRONGHOLD DETECTED! Found ${b.name} at ${lib.fmt(checkPos)}!`);
          bot.chat(`alpha: STRONGHOLD FOUND! Detected ${b.name} at ${lib.fmt(checkPos)}!`);
          break;
        }
      }
      if (foundStronghold) break;
    }
    if (foundStronghold) break;
  }

  if (foundStronghold) break;

  // Dig 2x1 column: stand at (233, currentY, -98), dig ahead at (233, currentY - 1, -97) and (233, currentY - 2, -97)
  const targetCol = (currentY % 2 === 0) ? new Vec3(233, currentY, -97) : new Vec3(233, currentY, -98);
  const dig1 = bot.blockAt(targetCol.offset(0, -1, 0));
  const dig2 = bot.blockAt(targetCol.offset(0, -2, 0));

  if (dig1 && dig1.boundingBox === 'block') {
    try { await bot.dig(dig1, true); } catch (e) {}
  }
  if (dig2 && dig2.boundingBox === 'block') {
    try { await bot.dig(dig2, true); } catch (e) {}
  }

  // Step down into the cleared column
  await bot.lookAt(targetCol.offset(0.5, -1.0, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.clearControlStates();

  currentY = Math.floor(bot.entity.position.y);
  console.log(`Descended to Y=${currentY}`);
}

console.log(`Descent completed. Pos=${lib.fmt(bot.entity.position)}, foundStronghold=${foundStronghold}`);
