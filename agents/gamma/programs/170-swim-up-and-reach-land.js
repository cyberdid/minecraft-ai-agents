// programs/170-swim-up-and-reach-land.js
console.log('--- SWIM UP, KILL DROWNED, REACH LAND ---');
console.log('Pos:', bot.entity.position);

// 1. Swim UP immediately
bot.setControlState('jump', true);
await lib.equipWeapon();

// Check hostiles (drowned)
const hostiles = lib.hostiles(8);
console.log('Hostiles within 8m:', JSON.stringify(hostiles));
if (hostiles.length > 0) {
  console.log('Fighting hostile nearby...');
  try {
    await lib.fight(8, 10);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// 2. Swim towards East (+X, +Z) towards base shore
console.log('Swimming East towards base shore...');
bot.setControlState('jump', true);
// Look towards base (294, 72, -54)
await bot.lookAt(new Vec3(294, 65, -54), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);

const t0 = Date.now();
while (Date.now() - t0 < 8000 && !isCancelled()) {
  await sleep(250);
  const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'water' && bot.entity.position.y >= 62) {
    console.log(`Stepped on solid land: ${under.name} at ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.clearControlStates();
console.log('Pos after swim:', lib.fmt(bot.entity.position));

// 3. If on solid ground, shelter now!
const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
console.log('Block under feet:', under?.name);
if (under && under.boundingBox === 'block' && under.name !== 'water') {
  console.log('Attempting emergency shelter...');
  try {
    await lib.shelter();
    console.log('Sheltered underground successfully!');
    bot.chat(`Gamma sheltered safely at ${lib.fmt(bot.entity.position)} for the night.`);
  } catch (e) {
    console.log('lib.shelter note:', e.message);
  }
} else {
  // If still in water, tower up with cobblestone!
  console.log('Still in water, towering up 3 cobblestone...');
  await bot.equip(mcData.itemsByName.cobblestone.id, 'hand');
  bot.setControlState('jump', true);
  for (let i = 0; i < 4; i++) {
    await sleep(250);
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (below) {
      try { await bot.placeBlock(below, new Vec3(0, 1, 0)); } catch (err) {}
    }
  }
  bot.setControlState('jump', false);
  console.log('Pos after tower:', lib.fmt(bot.entity.position));
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final time:', JSON.stringify(lib.time()));
console.log('Final HP:', bot.health, 'Food:', bot.food);
