// programs/068-pave-floor-and-place-chest.js
// Pave missing floor blocks at y=71 and place chest at (293, 72, -57)

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Place cobblestone at (293, 71, -57)
const spot71 = bot.blockAt(new Vec3(293, 71, -57));
if (!spot71 || spot71.boundingBox !== 'block') {
  console.log('Placing cobblestone floor at (293, 71, -57)...');
  await lib.place('cobblestone', 293, 71, -57);
}
console.log('Floor at (293, 71, -57) is now:', bot.blockAt(new Vec3(293, 71, -57)).name);

// 2. Place cobblestone at other missing floor spots if needed
const missing = [
  new Vec3(293, 71, -56),
  new Vec3(294, 71, -55),
  new Vec3(293, 71, -55)
];

for (const p of missing) {
  const b = bot.blockAt(p);
  if (!b || b.boundingBox !== 'block') {
    try {
      console.log(`Placing cobblestone floor at ${p}...`);
      await lib.place('cobblestone', p.x, p.y, p.z);
    } catch (e) {
      console.log(`Floor at ${p} note:`, e.message);
    }
  }
}

// 3. Now place chest at (293, 72, -57)
console.log('Placing chest at (293, 72, -57)...');
await lib.place('chest', 293, 72, -57);
console.log('Chest block:', bot.blockAt(new Vec3(293, 72, -57)).name);

// 4. Verify chest access
const contents = await lib.chestContents();
console.log('Chest opened successfully! Contents:', JSON.stringify(contents));

bot.chat('alpha: Base floor paved and chest placed at (293, 72, -57)!');
