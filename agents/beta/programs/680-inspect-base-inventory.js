console.log('=== Base Chest & Equipment Inspection ===');
console.log('Bot pos:', bot.entity.position);

const chests = bot.findBlocks({ matching: b => b.name.includes('chest'), maxDistance: 10 });
console.log('Chests nearby:', chests);
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    console.log(`Chest at ${cp}:`);
    for (const it of c.containerItems()) {
      console.log(`  ${it.name} x${it.count}`);
    }
    // If there are cobblestone, tools, swords, or food, withdraw them!
    const useful = c.containerItems().filter(it => 
      it.name.includes('sword') || 
      it.name.includes('pickaxe') || 
      it.name.includes('cobblestone') || 
      it.name.includes('planks') || 
      it.name.includes('log') || 
      it.name.includes('bread') || 
      it.name.includes('cooked') || 
      it.name.includes('beef') || 
      it.name.includes('mutton') ||
      it.name.includes('porkchop')
    );
    for (const u of useful) {
      await c.withdraw(u.type, null, u.count);
      console.log(`Withdrew ${u.name} x${u.count}!`);
    }
    await c.close();
  } catch (e) {
    console.log(`Could not open chest at ${cp}:`, e.message);
  }
}

// Check dropped items inside base
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
console.log('Dropped items inside base:', items.length);
if (items.length > 0) {
  await lib.pickup(8);
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Inventory now:', JSON.stringify(lib.inv()));
