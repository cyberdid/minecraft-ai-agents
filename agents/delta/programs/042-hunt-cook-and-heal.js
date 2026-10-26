// programs/042-hunt-cook-and-heal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step out through door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294.5, -50);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Fill a water bucket if nearby water exists
if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  console.log('Filling water bucket...');
  try {
    await lib.fillBucket('water');
    console.log('Filled water bucket! Have water_bucket:', lib.count('water_bucket'));
  } catch (e) {
    console.log('fillBucket note:', e.message);
  }
}

// 3. Equip stone sword and hunt animals for meat
await lib.equipWeapon();
const mobs = ['cow', 'pig', 'sheep'];
let killed = 0;
for (const m of mobs) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    console.log(`Hunting ${m}...`);
    const r = await lib.hunt(m, 2);
    console.log(`Hunted ${m}:`, JSON.stringify(r));
    killed += r.killed;
    if (killed >= 2) break;
  } catch (err) {
    console.log(`Hunt ${m} note:`, err.message);
  }
}

// 4. Return inside base to cook meat
console.log('Returning to base to smelt food...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);
if (door && !bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}

// Smelt raw food
const rawKeys = ['beef', 'raw_beef', 'porkchop', 'raw_porkchop', 'mutton', 'raw_mutton', 'chicken', 'raw_chicken'];
for (const raw of rawKeys) {
  const c = lib.inv()[raw];
  if (c > 0) {
    console.log(`Smelting ${c} of ${raw}...`);
    try {
      await lib.smelt(raw, 'coal', c);
    } catch (e) {
      console.log('Smelt with coal error, trying planks:', e.message);
      try {
        await lib.smelt(raw, 'birch_planks', c);
      } catch (e2) {
        console.log('Smelt with planks error:', e2.message);
      }
    }
  }
}

// 5. Eat food to regenerate health
console.log('Eating cooked food...');
try {
  await lib.eat();
  console.log('Ate food! Health:', bot.health, 'Food:', bot.food);
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Delta status: health', bot.health, 'food', bot.food, 'water_bucket:', lib.count('water_bucket'));
bot.chat(`delta: Health: ${bot.health}/20, Food: ${bot.food}/20. Water bucket: ${lib.count('water_bucket')}. Ready for East hill iron expedition!`);
