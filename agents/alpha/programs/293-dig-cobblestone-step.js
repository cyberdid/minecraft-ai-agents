// programs/293-dig-cobblestone-step.js
console.log('=== Program 293: Break Cobblestone Step ===');
const target = new Vec3(336, 23, -69);
const b = bot.blockAt(target);
console.log(`Block at ${lib.fmt(target)}: ${b?.name}`);

if (b && b.name.includes('cobblestone')) {
  console.log('Digging cobblestone with fists (takes ~7.5s)...');
  await bot.dig(b);
  console.log('Broken cobblestone!');
  await sleep(500);
  await lib.pickup(4);
}

// Now inspect blocks at dz=+1, +2, +3
const pos = bot.entity.position.floored();
for (let dz = 1; dz <= 4; dz++) {
  const p = pos.offset(0, 0, dz);
  console.log(`dz=+${dz} (${lib.fmt(p)}): floor=${bot.blockAt(p.offset(0, -1, 0))?.name}, feet=${bot.blockAt(p)?.name}, head=${bot.blockAt(p.offset(0, 1, 0))?.name}, above=${bot.blockAt(p.offset(0, 2, 0))?.name}`);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
