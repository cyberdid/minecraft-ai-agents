// programs/347-east-hill-join-team.js
console.log('=== Program 347: Join Team at East Hill & Gather Food/Iron ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Travel towards East hill (350, 58, -35)
console.log('Traveling to East hill...');
bot.chat('team: Alpha joining Beta and Gamma at East hill (350, 58, -35) to mine iron and hunt animals on the way!');

try {
  await lib.goTo(350, 58, -35, 3, { timeoutMs: 30000 });
  console.log('Arrived at East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
}

// 2. Scan for any animals within 32m at East hill
const animals = Object.values(bot.entities).filter(e => 
  (e.name === 'chicken' || e.name === 'cow' || e.name === 'sheep' || e.name === 'pig') &&
  bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Found ${animals.length} animals near East hill:`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
  try {
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { timeoutMs: 10000 });
    await bot.equip(bot.inventory.items().find(it => it.name === 'iron_sword'), 'hand');
    await bot.attack(a);
    await sleep(500);
    await lib.pickup(4);
  } catch (err) {}
}

// 3. Mine 10 iron ore with iron pickaxe
console.log('Mining iron ore at East hill...');
try {
  const got = await lib.collect('iron_ore', 8);
  console.log('Mined iron:', JSON.stringify(got));
} catch (e2) {
  console.log('Mine iron note:', e2.message);
}

console.log('Current inv:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha at East hill. Raw iron: ${lib.count('raw_iron')}. Food items: chicken=${lib.count('chicken')}, beef=${lib.count('beef')}.`);
