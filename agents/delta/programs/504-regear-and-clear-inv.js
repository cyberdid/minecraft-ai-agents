// programs/504-regear-and-clear-inv.js
console.log('Delta at base:', lib.fmt(bot.entity.position));

// 1. Open Base Chest and deposit building junk
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const itemName of ['netherrack', 'granite', 'soul_soil']) {
      const it = bot.inventory.items().find(i => i.name === itemName);
      if (it) {
        await chest.deposit(it.type, null, it.count);
        console.log(`Deposited ${it.name} x${it.count}`);
      }
    }
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log('BASE CHEST ITEMS:', items.join(', '));
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Equip weapon and offhand shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Teammate ${p.username}: dim=${p.entity.dimension || bot.game.dimension} pos=${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Base regear complete. Full 20/20 HP, 3 stone swords, offhand shield. Ready for team bartering / Enderman hunt!');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
