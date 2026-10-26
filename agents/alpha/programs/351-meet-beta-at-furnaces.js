// programs/351-meet-beta-at-furnaces.js
console.log('=== Program 351: Meet Beta at Furnaces & Smelt Boots ===');

bot.chat('beta: Beta, welcome back! Put the raw iron into base furnace at (295, 72, -55) with coal! 4 iron ingots will craft iron_boots!');

// Monitor Beta and furnaces for 20s
for (let i = 0; i < 10; i++) {
  if (isCancelled()) break;
  
  const b = bot.players.beta?.entity;
  if (b) {
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(b.position)}, held=${b.heldItem?.name}`);
  }
  
  // Check if any iron_ingot appeared in chest or inventory
  if (lib.count('iron_ingot') >= 4) {
    console.log('Crafting iron_boots!');
    try {
      await lib.craft('iron_boots', 1);
      await lib.equipArmor();
      console.log('IRON BOOTS EQUIPPED! Full iron armor complete!');
      break;
    } catch (e) {}
  }
  
  await sleep(2000);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
