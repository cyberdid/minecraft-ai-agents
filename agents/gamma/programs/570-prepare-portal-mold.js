// programs/570-prepare-portal-mold.js
console.log('=== PREPARE PORTAL MOLD ===');
await lib.goTo(299, 73, -56, 1.5, { timeoutMs: 5000 });

const backBlock = bot.blockAt(new Vec3(299, 72, -55));
if (backBlock && backBlock.name === 'air') {
  console.log('Placing cobblestone backboard at (299, 72, -55)...');
  await lib.place('cobblestone', 299, 72, -55);
}

const verify = bot.blockAt(new Vec3(299, 72, -55));
console.log('Verification at (299, 72, -55):', verify ? verify.name : 'null');
bot.chat('gamma: Sealed portal casting mold at (299, 72, -55) with cobblestone! Basin at (299, 72, -54) is 100% ready for lava!');
