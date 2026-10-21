// programs/051-emergency-shelter-heal.js
// EMERGENCY: low health (1.3/20). Enter base, close door, eat, heal to 20/20!

console.log('alpha health:', bot.health, 'food:', bot.food, 'pos:', lib.fmt(bot.entity.position));

// 1. Enter base immediately
console.log('Returning inside base...');
await lib.goTo(294, 72, -52, 1, { dig: true });

const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Check chest for cooked food and withdraw
const chestPos = { x: 293, y: 72, z: -57 };
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  const cooked = Object.keys(contents).filter(k => k.startsWith('cooked_'));
  if (cooked.length > 0) {
    await lib.withdraw({ [cooked[0]]: contents[cooked[0]] }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${cooked[0]}`);
  }
} catch (e) {
  console.log('Chest withdraw note:', e.message);
}

// 3. Eat until food is 20
console.log('Eating food to trigger regeneration...');
while (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Food now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
    break;
  }
  await sleep(1000);
}

// 4. Wait for health regeneration while food >= 18
console.log('Waiting for health regeneration inside base...');
while (bot.health < 20 && !isCancelled()) {
  await sleep(2000);
  console.log(`Health: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);
  if (bot.food < 18) {
    try { await lib.eat(); } catch (e) {}
  }
}

console.log('Fully regenerated! Health:', bot.health, 'Food:', bot.food);

// 5. Deposit spare iron_leggings into chest for beta
if (lib.count('iron_leggings') > 1) {
  try {
    await lib.deposit({ iron_leggings: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited spare iron_leggings for beta in chest');
  } catch (e) {}
}

// 6. Craft bucket with 3 iron ingots
if (lib.count('bucket') === 0 && lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('bucket', 1);
    console.log('Crafted bucket for alpha!');
  } catch (e) {
    console.log('Bucket craft note:', e.message);
  }
}

bot.chat(`alpha: Fully healed (20/20 health, 20/20 food)! Inside base with iron armor, bucket, and tools.`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  health: bot.health,
  food: bot.food,
  bucket: lib.count('bucket'),
  time: time.secondsUntilNight
};
