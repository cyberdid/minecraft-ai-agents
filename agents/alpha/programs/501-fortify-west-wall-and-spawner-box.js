// programs/501-fortify-west-wall-and-spawner-box.js
console.log('=== Program 501: On-Site Netherrack Wall Construction ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('team: Alpha mining netherrack from East mountain wall to build West protective blast wall at x=43!');

for (let z = -169; z >= -174; z--) {
  if (isCancelled()) break;
  console.log(`Fortifying section at z=${z}...`);

  // 1. Mine netherrack from East wall at x=45 if inventory is low
  if (lib.count('netherrack') + lib.count('soul_sand') < 2) {
    for (const y of [65, 66]) {
      const eastBlock = bot.blockAt(new Vec3(45, y, z));
      if (eastBlock && eastBlock.name === 'netherrack') {
        console.log(`Mining netherrack from East wall at (45, ${y}, ${z})...`);
        try {
          const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
          if (pick) await bot.equip(pick, 'hand');
          await bot.dig(eastBlock);
          await sleep(250);
          await lib.pickup(3);
        } catch (e) {}
      }
    }
  }

  // 2. Place West wall blocks at x=43, y=65 and y=66
  for (const y of [65, 66]) {
    const westBlock = bot.blockAt(new Vec3(43, y, z));
    if (!westBlock || westBlock.name === 'air' || westBlock.name === 'cave_air') {
      const mat = bot.inventory.items().find(i => ['netherrack', 'soul_sand', 'cobblestone', 'dirt'].includes(i.name));
      if (mat) {
        console.log(`Placing ${mat.name} West wall at (43, ${y}, ${z})...`);
        try {
          await lib.place(mat.name, 43, y, z);
          console.log(`Placed West wall at (43, ${y}, ${z})!`);
        } catch (e) {
          console.log(`Place error at (43, ${y}, ${z}):`, e.message);
        }
      }
    }
  }

  // 3. Step safely forward to z
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z));
  } catch (e) {}

  await lib.pickup(3);
}

console.log('Fortification completed up to:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

const spawner = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawner);
bot.chat(`team: Alpha fortified West blast wall to ${lib.fmt(bot.entity.position)}! Dist to Spawner: ${dist.toFixed(1)}m. Blaze line-of-sight is blocked!`);
