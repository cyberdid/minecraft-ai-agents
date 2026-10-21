// programs/120-eat-and-rearm-beta.js
// 1. Check base chest for food and eat
// 2. Deposit excess cobblestone (keep 16) into chest
// 3. Craft and equip a shield for Alpha! (6 planks + 1 iron_ingot)
// 4. Update Beta on our next steps

console.log('alpha at:', lib.fmt(bot.entity.position));

const chest = await lib.chestContents();
console.log('Base chest contents:', JSON.stringify(chest));

// Check if chest has cooked food or raw food
const foodTypes = ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple'];
for (const f of foodTypes) {
  if (chest[f] > 0) {
    console.log(`Withdrawing ${f} from chest...`);
    await lib.withdraw({ [f]: Math.min(chest[f], 4) });
    break;
  }
}

// Eat food
console.log('Eating food...');
try {
  await lib.eat();
  await sleep(1000);
  if (bot.food < 18) await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

// Deposit excess cobblestone into chest
try {
  await lib.deposit({ cobblestone: 64, oak_door: 'all', spider_eye: 'all' }, 293, 72, -57);
} catch (e) {}

console.log('Alpha health:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat('alpha: Full iron armor equipped! Milestone 3 is 95% complete. Let us get Beta full iron armor & portal obsidian.');
