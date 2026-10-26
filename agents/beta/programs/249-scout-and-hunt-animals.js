// programs/249-scout-and-hunt-animals.js
console.log('=== Step 7: Scout and Hunt Animals for Food and Wool ===');

// Check time
console.log('Time at start:', lib.time());
if (lib.time().secondsUntilNight < 150) {
  throw new Error('Too close to nightfall to start hunting outdoors!');
}

// 1. Exit base
console.log('Exiting base door at (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

await lib.equipWeapon();

const TARGET_MOBS = ['sheep', 'cow', 'pig', 'chicken'];

function findNearbyAnimal(maxDist = 64) {
  return Object.values(bot.entities)
    .filter(e => e && TARGET_MOBS.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < maxDist)
    .sort((a, b) => {
      // Prioritize sheep if we need wool
      if (lib.count('*_wool') < 3) {
        if (a.name === 'sheep' && b.name !== 'sheep') return -1;
        if (b.name === 'sheep' && a.name !== 'sheep') return 1;
      }
      return a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position);
    })[0];
}

async function killAnimal(target) {
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  const targetId = target.id;
  const deadline = Date.now() + 20000;
  bot.pvp.attack(target);
  while (bot.entities[targetId] && Date.now() < deadline && !isCancelled()) {
    await sleep(250);
  }
  bot.pvp.stop();
  await sleep(400);
  await lib.pickup(8);
}

// Search directions: East (+X), North (-Z), West (-X), South (+Z)
const directions = [
  { dx: 30, dz: 0 },
  { dx: 30, dz: -30 },
  { dx: 0, dz: -40 },
  { dx: -30, dz: -30 },
  { dx: 0, dz: 40 }
];

let totalKilled = 0;
const startInv = { ...lib.inv() };

for (const dir of directions) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  if (lib.count('*_wool') >= 3 && (lib.count('beef') + lib.count('mutton') + lib.count('porkchop') >= 8)) {
    console.log('Gathered enough food and wool!');
    break;
  }

  // Check if any animal already visible
  let animal = findNearbyAnimal(64);
  while (animal && !isCancelled() && lib.time().secondsUntilNight >= 120) {
    await killAnimal(animal);
    totalKilled++;
    animal = findNearbyAnimal(64);
  }

  // Walk in exploration direction
  const targetX = Math.floor(bot.entity.position.x + dir.dx);
  const targetZ = Math.floor(bot.entity.position.z + dir.dz);
  console.log(`Exploring towards (${targetX}, ${targetZ})...`);
  try {
    await lib.goToXZ(targetX, targetZ, { timeoutMs: 25000 });
  } catch (e) {
    console.log('goToXZ note:', e.message);
  }

  animal = findNearbyAnimal(64);
  while (animal && !isCancelled() && lib.time().secondsUntilNight >= 120) {
    await killAnimal(animal);
    totalKilled++;
    animal = findNearbyAnimal(64);
  }
}

// Return to base
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goToXZ(294, -53, { timeoutMs: 35000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Hunting summary:');
console.log(`Total animals killed: ${totalKilled}`);
console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);

bot.chat(`beta: Hunting done. Animals killed: ${totalKilled}. Wool: ${lib.count('*_wool')}, meat: ${lib.count('beef') + lib.count('mutton') + lib.count('porkchop')}.`);
