// programs/328-east-hill-iron-run.js
console.log('=== Program 328: East Hill Iron & Coal Expedition ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Exit base through door
console.log('Exiting base...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Travel to East hill (350, 55, -35)
console.log('Traveling to East hill (350, 55, -35)...');
bot.chat('team: Alpha heading to East hill (350, 55, -35) to mine iron and coal for full armor!');

try {
  await lib.goTo(350, 55, -35, 3, { timeoutMs: 30000 });
  console.log('Reached East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
}

// 3. Find and mine surface iron ore (filtering for surface |dy| <= 6)
console.log('Searching for exposed iron ore...');
const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
console.log(`Found ${ores.length} iron ore blocks in reach`);

let minedIron = 0;
for (const ore of ores) {
  if (isCancelled()) break;
  // Make sure it's surface-level (not in deep cave)
  if (Math.abs(ore.position.y - bot.entity.position.y) > 6) continue;
  
  console.log(`Mining iron ore at ${lib.fmt(ore.position)}...`);
  try {
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    minedIron++;
    await sleep(200);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig ore note:', e.message);
  }
  if (minedIron >= 12) break;
}

// 4. Find and mine coal ore for fuel
console.log('Searching for exposed coal ore...');
const coalOres = lib.find(['coal_ore'], { maxDistance: 24, count: 10 });
let minedCoal = 0;
for (const c of coalOres) {
  if (isCancelled()) break;
  if (Math.abs(c.position.y - bot.entity.position.y) > 6) continue;
  try {
    await lib.dig(c.position.x, c.position.y, c.position.z);
    minedCoal++;
    await sleep(200);
    await lib.pickup(4);
  } catch (e) {}
  if (minedCoal >= 6) break;
}

console.log('Expedition result! Inv:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha mined ${minedIron} iron ore and ${minedCoal} coal! Total inv: ${JSON.stringify(lib.inv())}`);
