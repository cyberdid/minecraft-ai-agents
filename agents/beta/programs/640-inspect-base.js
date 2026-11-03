const door = bot.findBlock({ matching: b => b.name.includes('door'), maxDistance: 10 });
console.log('Door nearby:', door ? `${door.name} at ${door.position}` : 'none');

const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 10 });
console.log('Chests nearby:', chests);

console.log('Players:');
for (const [name, entity] of Object.entries(bot.players)) {
  if (entity.entity) {
    console.log(`- ${name}: pos ${entity.entity.position}, hp ${entity.entity.health || '?'}`);
  } else {
    console.log(`- ${name}: no entity`);
  }
}

if (chests.length > 0) {
  const chestPos = chests[0];
  const chestBlock = bot.blockAt(chestPos);
  try {
    const c = await bot.openChest(chestBlock);
    console.log('Chest items:');
    for (const item of c.containerItems()) {
      console.log(`  ${item.name} x${item.count}`);
    }
    await c.close();
  } catch (e) {
    console.log('Could not open chest:', e.message);
  }
}
