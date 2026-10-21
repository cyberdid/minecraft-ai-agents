// programs/093-smelt-in-empty-furnace.js
// Clear furnace 1 fuel or use furnace 2 (295, 72, -57)

const f1 = bot.blockAt(new Vec3(295, 72, -55));
const furnace1 = await bot.openFurnace(f1);
if (furnace1.fuelItem()) {
  console.log('Taking fuel from furnace 1:', furnace1.fuelItem().name);
  await furnace1.takeFuel();
}
furnace1.close();

// Now smelt beef in furnace 1 (now empty!)
console.log('Smelting beef in now-empty furnace 1...');
await lib.smelt('beef', 'oak_planks', 1);
console.log('Beef cooked successfully!');

// Smelt chicken in furnace 2 (295, 72, -57)
console.log('Smelting chicken in furnace 2...');
await lib.smelt('chicken', 'oak_planks', 1);
console.log('Chicken cooked successfully!');

// Eat!
console.log('Eating cooked steak and chicken...');
await lib.eat();
await sleep(1000);
if (lib.count('cooked_beef') > 0 || lib.count('cooked_chicken') > 0) {
  await lib.eat();
}

console.log('Final health:', bot.health, '| food:', bot.food);
bot.chat(`alpha: Cooked food and ate! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20.`);
