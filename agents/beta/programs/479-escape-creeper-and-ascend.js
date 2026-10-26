// programs/479-escape-creeper-and-ascend.js
console.log('=== Step: Escape Creeper & Ascend to Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Check hostiles
const hostiles = lib.hostiles(16);
console.log('Hostiles:', JSON.stringify(hostiles));

for (const h of hostiles) {
  if (h.dist < 5) {
    console.log(`EMERGENCY: ${h.name} is ${h.dist.toFixed(1)}m away!`);
    // Equip sword and strike or knock back
    try {
      await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
      const target = bot.entities[h.id];
      if (target) {
        await bot.attack(target);
        console.log(`Struck ${h.name}!`);
      }
    } catch (e) {}
  }
}

// 2. Ascend to surface base entrance (302, 71, -44) then base (294, 72, -55)
console.log('Navigating up the mine shaft...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true });
  console.log('Reached mine entrance at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Mine entrance path error:', e.message);
}

try {
  await lib.goTo(294.5, 72.0, -55.5, 0.5, { dig: true });
  console.log('Reached base interior at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base interior path error:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base y=${bot.entity.position.y.toFixed(0)}. Inv: cobble=${lib.count('cobblestone')}, iron=${lib.count('raw_iron')}`);
