// programs/107-exit-via-293-and-portal.js
console.log('--- EXIT VIA X=293 & SUPPLY BETA ---');
console.log('Pos before:', lib.fmt(bot.entity.position));

bot.chat('Beta: Gamma exiting via x=293 doorway to gather logs and cobble for the team!');

// 1. Walk along x=293 to bypass Beta at x=294
console.log('Walking along x=293 out to z=-52...');
await lib.walkTo(293, -55);
await lib.walkTo(293, -52);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Gather 8 logs outside
console.log('Gathering 8 logs...');
const logs = await lib.collect('*_log', 8);
const logType = Object.keys(logs)[0] || 'birch_log';
console.log('Logs collected:', JSON.stringify(logs));

// Craft planks, sticks, wooden pickaxe
await lib.craft(logType.replace('_log', '_planks'), 12);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// 3. Mine 24 stone for cobblestone
console.log('Mining 24 stone for team cobblestone...');
await lib.collect('stone', 24);
console.log('Cobblestone count:', lib.count('cobblestone'));

// Craft stone tools for Gamma
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_axe', 1);

// 4. Return to base doorway (293, 72, -54) to toss supplies to Beta
console.log('Returning to base doorway to supply Beta...');
await lib.walkTo(293, -54);
if (bot.players.beta?.entity) {
  await bot.lookAt(bot.players.beta.entity.position);
}

// Toss 10 cobblestone and 4 logs to Beta
const logId = mcData.itemsByName[logType]?.id;
const cobbleId = mcData.itemsByName.cobblestone.id;

try {
  if (lib.count('cobblestone') >= 10) {
    await bot.toss(cobbleId, null, 10);
    console.log('Tossed 10 cobblestone to Beta!');
  }
  if (lib.count(logType) >= 4) {
    await bot.toss(logId, null, 4);
    console.log(`Tossed 4 ${logType} to Beta!`);
  }
} catch (e) {
  console.log('Toss note:', e.message);
}

bot.chat('Beta: tossed 10 cobblestone & 4 logs! Follow me through the Nether portal to join Delta at (44, 65, -129).');

// 5. Walk along z=-53 to x=299 and step into Nether portal
console.log('Walking along z=-53 to portal at (299, 73, -54)...');
await lib.walkTo(299, -53);
await lib.walkTo(299, -54);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('IN THE NETHER AT:', lib.fmt(bot.entity.position));
bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Advancing along East ridge to Fortress Workshop.`);
