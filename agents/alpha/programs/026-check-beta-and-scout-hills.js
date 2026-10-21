// programs/026-check-beta-and-scout-hills.js
// Leave spare stone pickaxe in chest for beta, then scout southeast hills for dry iron ore

const chestPos = { x: 293, y: 72, z: -57 };

// 1. Check beta presence / respawn
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position));
} else {
  console.log('beta respawning...');
}

// 2. Deposit 1 stone pickaxe into chest for beta
if (lib.count('stone_pickaxe') > 1) {
  try {
    await lib.deposit({ stone_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited spare stone_pickaxe into chest for beta');
  } catch (e) {
    console.log('Deposit note:', e.message);
  }
}

bot.chat('alpha: Beta, left a stone pickaxe in base chest for you. I am heading southeast (330, -30) to hills to find dry iron.');

// 3. Step outside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside...');
await lib.walkTo(294, -51);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 4. Travel southeast towards (330, 75, -30)
console.log('Travelling to southeast hills (330, -30)...');
try {
  await lib.goToXZ(330, -30);
  console.log('Arrived at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
}

// 5. Scan for iron ore from here
const ironNearHills = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 48, count: 20 });
console.log(`Iron ores found near southeast hills: ${ironNearHills.length}`);
ironNearHills.forEach(i => console.log(`  iron at ${lib.fmt(i.position)} dist ${bot.entity.position.distanceTo(i.position).toFixed(1)}`));

// 6. If iron found at y >= 60, mine it!
const safeIron = ironNearHills.filter(i => i.position.y >= 60);
console.log(`Safe iron ores (y >= 60): ${safeIron.length}`);
for (const ore of safeIron) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  try {
    console.log(`Mining safe iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2);
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Mine error at ${lib.fmt(ore.position)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 15) break;
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

const time = lib.time();
console.log('Time left until night:', time.secondsUntilNight, 's');

return {
  pos: bot.entity.position,
  rawIron: lib.count('raw_iron'),
  time: time.secondsUntilNight
};
