console.log('=== PLUG WATER SOURCE AT (298, 73, -53) ===');

// Place cobblestone at the water source block
try {
  console.log('Placing cobblestone at (298, 73, -53)...');
  await lib.place('cobblestone', 298, 73, -53);
  console.log('Water source plugged!');
  await sleep(600);
} catch (e) {
  console.log('Place error:', e.message);
}

// Dig the cobblestone back up
try {
  console.log('Mining cobblestone back...');
  await lib.dig(298, 73, -53);
  console.log('Cobblestone retrieved!');
} catch (e) {
  console.log('Dig error:', e.message);
}

await sleep(800);

// Check if any water remains
const waters = bot.findBlocks({ matching: b => b && b.name.includes('water'), maxDistance: 8, count: 10 });
console.log(`Remaining water blocks: ${waters.length}`);

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill (299, 72, -54): ${sill?.name}`);
