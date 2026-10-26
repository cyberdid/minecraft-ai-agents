// programs/390-prepare-for-mining.js
console.log('=== Step: Restock cobblestone & check team before mining ===');

// 1. Withdraw cobblestone and sticks from chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const cobble = chest.containerItems().find(i => i.name === 'cobblestone');
    if (cobble && lib.count('cobblestone') < 32) {
      const takeCount = Math.min(cobble.count, 32 - lib.count('cobblestone'));
      await chest.withdraw(cobble.type, null, takeCount);
      console.log(`Withdrew ${takeCount} cobblestone from chest.`);
    }
    // Check if any food or raw iron was left in chest
    const food = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    if (food) {
      await chest.withdraw(food.type, null, Math.min(food.count, 4));
      console.log(`Withdrew ${food.name}x${Math.min(food.count, 4)} from chest.`);
    }
    const iron = chest.containerItems().find(i => i.name === 'raw_iron' || i.name === 'iron_ingot');
    if (iron) {
      await chest.withdraw(iron.type, null, iron.count);
      console.log(`Withdrew ${iron.name}x${iron.count} from chest.`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Report status and chat
console.log('Beta inv:', JSON.stringify(lib.inv()));
console.log(`Beta pos: ${lib.fmt(bot.entity.position)}, health: ${bot.health}/20, food: ${bot.food}/20`);
bot.chat('beta: Restocked cobblestone. Stepping out through base door to East hill (350, 60, -35) to mine iron for full armor!');
