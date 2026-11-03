// programs/620-check-chest-clearance.js
console.log('=== Program 620: Check Chest Clearance ===');
const chestPos = new Vec3(293, 72, -57);
const blockAbove = bot.blockAt(new Vec3(293, 73, -57));
console.log('Chest block at', lib.fmt(chestPos), 'type:', bot.blockAt(chestPos)?.name);
console.log('Block above chest at (293, 73, -57):', blockAbove?.name, 'boundingBox:', blockAbove?.boundingBox);

// If block above is solid, dig it out so chest can open!
if (blockAbove && blockAbove.name !== 'air' && blockAbove.boundingBox === 'block') {
  console.log(`Block above chest is solid (${blockAbove.name})! Clearing it...`);
  try {
    await bot.dig(blockAbove);
    console.log('Cleared block above chest!');
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}

// Now attempt to open chest
const cBlock = bot.blockAt(chestPos);
if (cBlock && cBlock.name.includes('chest')) {
  try {
    await lib.goTo(293, 72, -56, 1, { timeoutMs: 3000 });
    const chest = await bot.openContainer(cBlock);
    console.log('=== CHEST CONTENTS ===');
    const items = chest.containerItems();
    for (const it of items) {
      console.log(`- ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (err) {
    console.log('Open chest failed:', err.message);
  }
}
