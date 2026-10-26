// programs/440-request-pickaxe-and-check-chest.js
console.log('=== Step: Inspect bunker chest and coordinate gold mining gear ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Check bunker chest at (39, 65, -8)
const cb = bot.blockAt(new Vec3(39, 65, -8));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Bunker chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    // Take pickaxes, swords, stone, food
    for (const item of items) {
      if (item.name.endsWith('_pickaxe') || item.name.endsWith('_sword') || item.name.includes('cobble') || item.name.includes('ingot') || item.name.includes('cooked')) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from bunker chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Scan for dropped items nearby inside bunker
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
console.log(`Found ${drops.length} item drops in bunker`);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
    console.log(`Collected drop at ${lib.fmt(d.position)}!`);
  } catch (e) {}
}

// 3. Scan for teammates inside or near bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, dist=${dist}m, held=${p.entity.heldItem?.name}`);
  }
}

// 4. Send chat request
bot.chat('beta: At Nether bunker (40, 65, -7). Delta/Alpha, please deposit or toss a spare pickaxe so Beta can mine gold for golden boots!');

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
