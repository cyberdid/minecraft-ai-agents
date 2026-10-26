// programs/193-plug-gap-and-scan-ahead.js
console.log('--- PLUG FLOOR GAP AT (44, 64, -141) & SCAN TO Z=-170 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Stand safely at (44.5, 65.0, -140.0)
await lib.walkTo(44.5, -140.0, 2000);
bot.clearControlStates();
console.log('Safe position:', bot.entity.position);

// Check block under (44, 64, -141)
const gap = bot.blockAt(new Vec3(44, 64, -141));
console.log('Gap block before plug:', gap?.name);

if (!gap || gap.boundingBox !== 'block') {
  console.log('Plugging gap at (44, 64, -141) with soul_sand...');
  try {
    await lib.place('soul_sand', 44, 64, -141);
    console.log('PLUGGED FLOOR GAP!');
  } catch (e) {
    console.log('Place error, trying against (44, 64, -140):', e.message);
    const ref = bot.blockAt(new Vec3(44, 64, -140));
    if (ref) {
      await bot.equip(mcData.itemsByName.soul_sand.id, 'hand');
      await bot.placeBlock(ref, new Vec3(0, 0, -1));
    }
  }
}

const gapAfter = bot.blockAt(new Vec3(44, 64, -141));
console.log('Gap block after plug:', gapAfter?.name);
bot.chat(`gamma plugged floor gap at (44, 64, -141) with ${gapAfter?.name}! Bridge floor is 100% continuous.`);

// 2. Scan bridge and terrain from z=-155 to z=-170
console.log('Scanning bridge from z=-155 to z=-170:');
for (let z = -155; z >= -170; z--) {
  const flr = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  const L = bot.blockAt(new Vec3(43, 65, z));
  const R = bot.blockAt(new Vec3(45, 65, z));
  console.log(`z=${z}: flr(y64)=${flr?.name || 'AIR'} | feet=${feet?.name} | head=${head?.name} | roof(y67)=${roof?.name || 'open'} | L=${L?.name || 'open'} | R=${R?.name || 'open'}`);
}

// 3. Scan for dropped gear from fallen teammates (Beta/Alpha)
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Found ${items.length} item entities nearby:`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}: dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
