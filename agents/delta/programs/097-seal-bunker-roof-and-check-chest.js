// programs/097-seal-bunker-roof-and-check-chest.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Locate chest in bunker
const chests = bot.findBlocks({ matching: b => b.name === 'chest', maxDistance: 8, count: 5 });
console.log(`Found ${chests.length} chests in bunker`);
for (const c of chests) {
  try {
    const contents = await lib.chestContents(c.x, c.y, c.z);
    console.log(`Chest at ${lib.fmt(c)}:`, JSON.stringify(contents));
    // Check if food inside
    for (const f of ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple']) {
      if (contents[f] && bot.food < 18) {
        await lib.withdraw({ [f]: Math.min(2, contents[f]) }, c.x, c.y, c.z);
        while (lib.count(f) > 0 && bot.food < 18) {
          await lib.eat();
          await sleep(300);
          console.log(`Ate ${f}, food now: ${bot.food}`);
        }
        break;
      }
    }
  } catch (e) {
    console.log(`Chest check err at ${lib.fmt(c)}:`, e.message);
  }
}

// 2. Seal the bunker roof at y = 68
console.log('Checking bunker roof at y = 68...');
const roofTargets = [];
for (let x = 39; x <= 42; x++) {
  for (let z = -8; z <= -6; z++) {
    const blk = bot.blockAt(new Vec3(x, 68, z));
    if (!blk || blk.name === 'air' || blk.name === 'cave_air') {
      roofTargets.push(new Vec3(x, 68, z));
    }
  }
}
console.log(`Roof blocks missing: ${roofTargets.length}`);

for (const t of roofTargets) {
  if (lib.count('cobblestone') < 5) break;
  try {
    console.log(`Placing cobblestone at roof ${lib.fmt(t)}...`);
    const res = await lib.place('cobblestone', t.x, t.y, t.z);
    console.log(`Placed at ${lib.fmt(t)}: ${res}`);
  } catch (err) {
    console.log(`Roof place at ${lib.fmt(t)}:`, err.message);
  }
}

console.log('Cobblestone remaining:', lib.count('cobblestone'));

// 3. Check Alpha's position and route North
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha is at ${lib.fmt(alpha.position)} (dist ${Math.round(bot.entity.position.distanceTo(alpha.position))})`);
}

bot.chat(`delta: Nether bunker secured! Cobble left: ${lib.count('cobblestone')}. Ready to advance North to Fortress!`);
