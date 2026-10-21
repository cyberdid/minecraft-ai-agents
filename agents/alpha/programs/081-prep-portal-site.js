// programs/081-prep-portal-site.js
// Inspect, clear leaves, and place solid foundation for the Nether portal at (298, 72, -54)

console.log('alpha at:', lib.fmt(bot.entity.position), '| time:', lib.time().timeOfDay);

// 1. Step outside door
await lib.goThroughDoor(294, 72, -54);

// 2. Foundation check for portal frame: bottom row is at y=72 from x=298 to 301, z=-54
// Floor under frame is at y=71
for (let x = 298; x <= 301; x++) {
  const floorPos = new Vec3(x, 71, -54);
  const floorBlock = bot.blockAt(floorPos);
  console.log(`Floor at ${floorPos}: ${floorBlock ? floorBlock.name : 'air'}`);
  if (!floorBlock || floorBlock.boundingBox !== 'block') {
    console.log(`Placing cobblestone foundation at ${floorPos}...`);
    try {
      await lib.place('cobblestone', floorPos.x, floorPos.y, floorPos.z);
    } catch (e) {
      console.log(`Place foundation at ${floorPos} note:`, e.message);
    }
  }
}

// 3. Clear 4 wide x 5 high x 3 deep box around portal: x=298..301, y=72..76, z=-55..-53
console.log('Clearing leaves/blocks in portal box...');
for (let y = 72; y <= 76; y++) {
  for (let x = 298; x <= 301; x++) {
    for (let z = -55; z <= -53; z++) {
      const p = new Vec3(x, y, z);
      const b = bot.blockAt(p);
      if (b && (b.name.includes('leaves') || b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass')) {
        console.log(`Clearing ${b.name} at ${p}...`);
        try {
          await lib.dig(p.x, p.y, p.z);
        } catch (e) {
          console.log(`Dig at ${p} note:`, e.message);
        }
      }
    }
  }
}

// 4. Check materials for portal
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(portalFrame);
console.log('Portal materials needed:', JSON.stringify(mat));

// 5. Return inside base
console.log('Returning to base...');
await lib.goToXZ(294, -53);
await lib.goThroughDoor(294, 72, -54);

bot.chat('alpha: Nether portal site at (298, 72, -54) prepped with solid foundation and clear space.');
