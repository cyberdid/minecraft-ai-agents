// programs/040-tower-to-base-door.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk / tower up to base door at (294, 72, -53)
const doorPos = new Vec3(294, 72, -54);
console.log('Navigating to door...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);
console.log('At door vicinity:', lib.fmt(bot.entity.position));

// 2. Open door and walk inside
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Withdraw food from chest and eat
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const foodKeys = ['cooked_chicken', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'];
for (const f of foodKeys) {
  if (chest[f]) {
    console.log(`Withdrawing ${f} from chest...`);
    await lib.withdraw({ [f]: 1 }, chestPos.x, chestPos.y, chestPos.z);
    break;
  }
}

if (lib.inv().cooked_chicken || lib.inv().cooked_beef || lib.inv().cooked_porkchop || lib.inv().cooked_mutton) {
  console.log('Eating food to regenerate health...');
  await lib.eat();
  console.log('Health now:', bot.health, 'Food now:', bot.food);
}

// 4. Deposit surplus cobblestone & pickaxes for Beta
try {
  await lib.deposit({ cobblestone: 64, stone_pickaxe: 2 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited spare cobblestone & pickaxes in chest.');
} catch (e) {
  console.log('Deposit note:', e.message);
}

// 5. Sleep in Bed 2 at dusk
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in Bed 2...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

console.log('End health:', bot.health, 'Food:', bot.food);
bot.chat(`delta: Secure inside base. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
