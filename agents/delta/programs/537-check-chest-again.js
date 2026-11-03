// programs/537-check-chest-again.js
console.log('=== CHECK CHEST FOR NEW DEPOSITS ===');

const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  const chest = await bot.openChest(cBlock);
  const items = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
  console.log('Chest contents now:');
  console.log(JSON.stringify(items));

  // If food is present, withdraw all food!
  const foods = chest.containerItems().filter(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken', 'beef', 'mutton', 'porkchop', 'chicken'].includes(i.name));
  for (const f of foods) {
    console.log(`Withdrawing food: ${f.name} x${f.count}`);
    await chest.withdraw(f.type, null, f.count);
  }

  // If iron or shields are present, withdraw!
  for (const itName of ['iron_ingot', 'shield', 'iron_chestplate', 'iron_leggings', 'iron_helmet']) {
    const item = chest.containerItems().find(i => i.name === itName);
    if (item && lib.count(itName) === 0) {
      console.log(`Withdrawing ${item.name} x${item.count}`);
      await chest.withdraw(item.type, null, item.count);
    }
  }

  chest.close();
}

// Eat any edible food in inventory
const edible = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
if (edible) {
  console.log(`Eating ${edible.name}...`);
  await bot.equip(edible, 'hand');
  await bot.consume();
}

// Equip armor & shield
try { await lib.equipArmor(); } catch (e) {}
try {
  const s = bot.inventory.items().find(i => i.name === 'shield');
  if (s) await bot.equip(s, 'off-hand');
} catch (e) {}

return { inv: lib.inv(), food: bot.food, hp: bot.health };
