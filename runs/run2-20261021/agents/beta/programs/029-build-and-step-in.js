console.log('Heading to base (10, 67, -25)...');
await lib.goTo(10, 67, -25, 2);
console.log('At base! Bot pos:', lib.fmt(bot.entity.position));

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

// 1. Build with our current 7 sandstone
console.log('Building with initial sandstone...');
try {
  const r1 = await lib.build(bp, { replace: false });
  console.log('Placed initial blocks:', r1.placed);
} catch (e) {
  console.log('Build note:', e.message);
}

// 2. Craft remaining sandstone from sand
const sandCount = lib.count('sand');
if (sandCount >= 4) {
  const crafts = Math.floor(sandCount / 4);
  console.log(`Crafting ${crafts} sandstone...`);
  try {
    await lib.craft('sandstone', crafts);
  } catch (ce) {
    console.log('Craft note:', ce.message);
  }
}
console.log('Sandstone count now:', lib.count('sandstone'));

// 3. Build again with newly crafted sandstone
if (lib.count('sandstone') > 0) {
  console.log('Building newly crafted sandstone...');
  try {
    const r2 = await lib.build(bp, { replace: false });
    console.log('Placed second round:', r2.placed);
  } catch (e) {
    console.log('Build round 2 note:', e.message);
  }
}

// 4. Verify house progress
let placed = 0;
for (const b of bp) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placed++;
}
console.log(`House progress: ${placed}/${bp.length} blocks placed!`);

// 5. Check night protocol
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${Math.round(t.secondsUntilNight)}s`);

if (t.secondsUntilNight < 90 || t.night) {
  console.log('Night approaching (<90s). Stepping inside house through door...');
  try {
    await lib.goThroughDoor(12, 67, -21);
    console.log('Safely inside the house! Pos:', lib.fmt(bot.entity.position));
  } catch (de) {
    console.log('Door passage note:', de.message);
  }
}

bot.chat(`alpha: House is at ${placed}/${bp.length} blocks! Time until night: ${Math.round(t.secondsUntilNight)}s.`);
return { placed, total: bp.length, pos: lib.fmt(bot.entity.position) };
