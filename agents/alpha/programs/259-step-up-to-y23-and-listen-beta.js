// programs/259-step-up-to-y23-and-listen-beta.js
console.log('=== Program 259: Step to y=23 & Monitor Beta Obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. One more jump step forward to reach y=23
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(400);
bot.setControlState('jump', false);
await sleep(500);
bot.setControlState('forward', false);

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// 2. Monitor Beta and chat for 15s
for (let i = 0; i < 7; i++) {
  if (isCancelled()) break;
  const b = bot.players.beta?.entity;
  if (b) {
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(b.position)}, held: ${b.heldItem?.name}`);
  }
  await sleep(2000);
}

// 3. Check portal frame
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame missing:', JSON.stringify(mat.missing));

bot.chat(`beta: Alpha standing by at ${lib.fmt(bot.entity.position)}. Beta holding ${bot.players.beta?.entity?.heldItem?.name}. What is current obsidian count?`);
console.log('Alpha status:', JSON.stringify(lib.status()));
