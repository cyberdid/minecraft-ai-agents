// programs/724-deposit-junk.js
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  const chest = await bot.openChest(chestBlock);
  const junk = [
    'soul_sand', 'oak_sapling', 'birch_sapling', 'raw_iron', 'bone',
    'arrow', 'dirt', 'oak_log', 'birch_log', 'crafting_table'
  ];
  for (const name of junk) {
    const item = bot.inventory.items().find(i => i.name === name);
    if (item) {
      try {
        await chest.deposit(item.type, null, item.count);
        console.log(`Deposited ${item.count} ${name}`);
      } catch (e) {
        console.log(`Failed to deposit ${name}:`, e.message);
      }
    }
  }
  await chest.close();
}
console.log('Cleaned inventory:', lib.inv());
return { inv: lib.inv() };
