// programs/338-re-equip-and-climb.js
console.log('=== Step: Re-equip and climb to base ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// 1. Check for any dropped items within 16 blocks
const items = await lib.pickup(16);
console.log('Picked up items:', JSON.stringify(lib.inv()));

// 2. Chat with team
bot.chat('beta: Great work team on lighting Milestone 7 Nether portal! I am at (299, 16, -31). Please toss a pickaxe or cobblestone down so I can climb up!');

// 3. Check for nearby teammates
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.type === 'player' && e.username !== bot.username) {
    const dist = bot.entity.position.distanceTo(e.position);
    console.log(`Teammate ${e.username} at ${lib.fmt(e.position)}, dist: ${dist.toFixed(1)}m`);
  }
}

// 4. If we have any blocks, tower up 4 blocks towards y=20
const scaffold = ['cobblestone', 'dirt', 'stone', 'andesite', 'diorite', 'granite'];
let placeItem = null;
for (const s of scaffold) {
  if (lib.count(s) > 0) {
    placeItem = s;
    break;
  }
}

if (placeItem && lib.count(placeItem) >= 4) {
  console.log(`Towering up with ${placeItem}...`);
  for (let step = 0; step < 4; step++) {
    const p = bot.entity.position.floored();
    bot.setControlState('jump', true);
    await sleep(250);
    await lib.place(placeItem, p.x, p.y, p.z);
    bot.setControlState('jump', false);
    await sleep(200);
  }
  console.log('Towered up! New pos:', lib.fmt(bot.entity.position));
}

console.log('Beta status: health =', bot.health, 'food =', bot.food, 'pos =', lib.fmt(bot.entity.position));
