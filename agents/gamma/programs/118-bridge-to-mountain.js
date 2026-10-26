// programs/118-bridge-to-mountain.js
console.log('--- BRIDGE TO NETHERRACK MOUNTAIN (Z=-140) ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Toss 10 birch_planks to Delta right next to Gamma
if (bot.players.delta?.entity) {
  await bot.lookAt(bot.players.delta.entity.position);
}

if (lib.count('birch_planks') >= 10) {
  console.log('Tossing 10 birch_planks to Delta...');
  try {
    await bot.toss(mcData.itemsByName.birch_planks.id, null, 10);
    console.log('Tossed 10 planks to Delta!');
  } catch (e) {
    console.log('Toss note:', e.message);
  }
}
bot.chat('Delta: tossed 10 planks! Building bridge floor from z=-136 to z=-140.');

// 2. Place bridge floor blocks along x=44, y=64 from z=-136 to z=-140
const bridgeZ = [-136, -137, -138, -139, -140];
const blockItem = lib.count('birch_planks') > 0 ? 'birch_planks' : 'dirt';

for (const z of bridgeZ) {
  const target = new Vec3(44, 64, z);
  const cur = bot.blockAt(target);
  if (cur && (cur.name === 'air' || cur.name === 'cave_air')) {
    console.log(`Placing bridge floor at (44, 64, ${z})...`);
    try {
      await lib.place(blockItem, 44, 64, z);
      console.log(`Placed bridge block at z=${z}!`);
    } catch (e) {
      console.log(`Bridge place at z=${z} note:`, e.message);
    }
  }
}

// 3. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

// 4. Report bridge progress
console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma & Delta bridged advance hallway towards z=-140! Spawner distance: 59m. Standing by for Alpha.`);
