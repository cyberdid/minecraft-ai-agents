// programs/555-inspect-base-chest.js
console.log('=== INSPECT BASE CHEST ===');
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
console.log('Chest block:', chestBlock ? chestBlock.name : 'null');

await bot.lookAt(new Vec3(293.5, 72.5, -56.5), true);
try {
  await lib.goTo(294, 72, -56, 1.5, { timeoutMs: 5000 });
} catch (e) {}

const chest = await bot.openContainer(chestBlock);
console.log('Chest contents:');
for (const item of chest.containerItems()) {
  console.log(`- ${item.name} x${item.count}`);
}
await chest.close();
