// programs/430-inspect-nether-bunker-chest.js
console.log('=== Step: Inspect Nether bunker chest and equip for Fortress raid ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// Scan for chest in bunker within 6m
const chestPos = bot.findBlocks({
  matching: mcData.blocksByName.chest?.id,
  maxDistance: 6,
  count: 1
})[0];

if (chestPos) {
  const cb = bot.blockAt(chestPos);
  console.log(`Found Nether bunker chest at ${lib.fmt(chestPos)}!`);
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Bunker chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Withdraw any spare weapons, tools, wood, or armor
    for (const item of items) {
      if (item.name.endsWith('_sword') || item.name.endsWith('_pickaxe') || item.name.endsWith('_axe') || item.name === 'shield' || item.name.endsWith('_log') || item.name.endsWith('_planks') || item.name === 'stick' || item.name === 'torch') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from bunker chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Bunker chest open error:', e.message);
  }
} else {
  console.log('No chest found in immediate 6m bunker radius.');
}

// Equip best armor and weapons
await lib.equipArmor();

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: In Nether bunker at ${lib.fmt(bot.entity.position)}. Inv: cobble=${lib.count('cobblestone')+lib.count('cobbled_deepslate')}, sword=${lib.count('stone_sword')+lib.count('iron_sword')}. Linking with Gamma/Delta!`);
