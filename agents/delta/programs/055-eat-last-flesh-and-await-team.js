// programs/055-eat-last-flesh-and-await-team.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Consume last rotten flesh
if (lib.count('rotten_flesh') > 0) {
  const fleshItem = mcData.itemsByName.rotten_flesh;
  await bot.equip(fleshItem.id, 'hand');
  await bot.consume();
  await sleep(200);
}
console.log('Food now:', bot.food, 'Health now:', bot.health);

// 2. Check chest for any food brought by Alpha/Gamma
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

const foodKeys = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton', 'porkchop', 'chicken'];
for (const fk of foodKeys) {
  if (chest[fk]) {
    console.log(`Found ${fk} in chest! Withdrawing...`);
    await lib.withdraw({ [fk]: 1 }, chestPos.x, chestPos.y, chestPos.z);
    try {
      await lib.eat();
      console.log('Ate food! Food now:', bot.food, 'Health now:', bot.health);
    } catch (e) {
      console.log('Eat note:', e.message);
    }
    break;
  }
}

// 3. Check all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat(`delta: Inside base. Health: ${bot.health}/20, Food: ${bot.food}/20. Bed 2 ready for night sleep!`);
