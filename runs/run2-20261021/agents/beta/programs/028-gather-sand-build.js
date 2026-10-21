bot.chat("alpha: Gathering sand right here to craft sandstone and help finish the house!");

// 1. Collect sand nearby (within 24 blocks, safe on surface)
console.log('Collecting 48 sand...');
try {
  await lib.collect('sand', 48);
  console.log('Sand in inventory now:', lib.count('sand'));
} catch (e) {
  console.log('Sand collect note:', e.message);
}

// 2. Craft sandstone
const sandHave = lib.count('sand');
if (sandHave >= 4) {
  const toCraft = Math.floor(sandHave / 4);
  console.log(`Crafting ${toCraft} sandstone from ${sandHave} sand...`);
  await lib.craft('sandstone', toCraft);
  console.log('Sandstone in inventory:', lib.count('sandstone'));
}

// 3. Define the house blueprint
const bp = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

// 4. Build into blueprint
console.log('Building blueprint blocks with sandstone...');
const r = await lib.build(bp, { replace: false });
console.log('Build result:', JSON.stringify(r));

// 5. Verify total placed blocks
let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placed++;
}

console.log(`House progress: ${placed}/${bp.length} blocks placed!`);
bot.chat(`alpha: House is at ${placed}/${bp.length} blocks! ${bp.length - placed} remaining.`);

return { placed, total: bp.length, timeRemaining: lib.time().secondsUntilNight };
