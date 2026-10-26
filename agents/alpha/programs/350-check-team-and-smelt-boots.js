// programs/350-check-team-and-smelt-boots.js
console.log('=== Program 350: Check Team & Smelt Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} not nearby`);
  }
}

// 2. Check base chest for iron_ingot and food
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest items:', JSON.stringify(contents));
  
  if (contents.iron_ingot >= 4) {
    console.log(`Withdrawing 4 iron_ingot from chest to craft iron_boots...`);
    await lib.withdraw({ iron_ingot: 4 }, chestPos.x, chestPos.y, chestPos.z);
    await lib.craft('iron_boots', 1);
    await lib.equipArmor();
    console.log('CRAFTED AND EQUIPPED IRON_BOOTS!');
  }
  
  // If any food in chest, withdraw and eat
  const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
  for (const f of foods) {
    if (contents[f] > 0) {
      console.log(`Withdrawing 3 ${f} to eat...`);
      await lib.withdraw({ [f]: Math.min(3, contents[f]) }, chestPos.x, chestPos.y, chestPos.z);
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
      console.log(`Food now: ${bot.food}/20`);
      break;
    }
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

// 3. Check status
const armor = bot.inventory.items().filter(i => i.name.startsWith('iron_') && (i.name.includes('helmet') || i.name.includes('chestplate') || i.name.includes('leggings') || i.name.includes('boots'))).map(i => i.name);
console.log('Alpha armor pieces:', JSON.stringify(armor));
bot.chat(`team: Alpha status: Food ${bot.food}/20, Health ${bot.health}/20. Armor pieces: ${armor.join(', ')}.`);
