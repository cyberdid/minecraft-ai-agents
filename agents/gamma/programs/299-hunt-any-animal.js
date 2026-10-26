// programs/299-hunt-any-animal.js
console.log('=== HUNT FOR FOOD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

await lib.equipWeapon();

// Check if any teammate has food
bot.chat('alpha, beta: low on food (12/20), going hunting for sheep/pigs/cows!');

const animalTypes = ['cow', 'pig', 'sheep', 'chicken'];

function findNearestAnimal() {
  const list = Object.values(bot.entities).filter(e => {
    if (!e || !e.name || !e.position) return false;
    return animalTypes.includes(e.name) && bot.entity.position.distanceTo(e.position) < 64;
  });
  list.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  return list[0];
}

let animal = findNearestAnimal();

// If no animal right here, explore in candidate directions (south, east, west, north)
const directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
let dirIdx = 0;

while (!animal && dirIdx < directions.length && !isCancelled()) {
  const [dx, dz] = directions[dirIdx++];
  console.log(`Exploring in direction (${dx}, ${dz}) for up to 25s...`);
  animal = await lib.explore(dx, dz, 25, findNearestAnimal);
  if (animal) console.log(`Spotted ${animal.name} at ${lib.fmt(animal.position)}!`);
}

if (!animal) {
  console.log('No animals found in exploration. Checking for apples / oak leaves...');
} else {
  // Hunt up to 3 animals
  let hunted = 0;
  while (animal && hunted < 3 && !isCancelled()) {
    console.log(`Hunting ${animal.name} at ${lib.fmt(animal.position)}...`);
    try {
      await lib.goTo(animal.position.x, animal.position.y, animal.position.z, 2, { timeoutMs: 10000 });
      const targetId = animal.id;
      const deadline = Date.now() + 15000;
      bot.pvp.attack(animal);
      while (bot.entities[targetId] && Date.now() < deadline && !isCancelled()) {
        await sleep(300);
      }
      bot.pvp.stop();
      hunted++;
      await sleep(400);
      await lib.pickup(8);
      console.log(`Successfully hunted ${animal.name}!`);
    } catch (e) {
      console.log('Hunt error:', e.message);
      bot.pvp.stop();
    }
    animal = findNearestAnimal();
  }
}

// Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door enter note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Inside base. Inv:', JSON.stringify(lib.inv()));

// Cook any raw meat in base furnace
for (const raw of ['beef', 'mutton', 'porkchop', 'chicken']) {
  const count = lib.count(raw);
  if (count > 0) {
    console.log(`Cooking ${count}x ${raw} in furnace at (295, 72, -55)...`);
    try {
      await lib.goTo(295, 72, -55, 2, { timeoutMs: 6000 });
      await lib.smelt(raw, 'oak_planks', count);
    } catch (e) {
      console.log('Smelt note:', e.message);
    }
  }
}

// Eat cooked food or best food
console.log('Eating food...');
try {
  await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Status after meal:', JSON.stringify(lib.status()));
bot.chat(`gamma status: Food=${bot.food}/20, HP=${bot.health}/20, Inv: ${JSON.stringify(lib.inv())}`);
