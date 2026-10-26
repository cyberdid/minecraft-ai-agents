// programs/291-listen-beta-chat.js
console.log('=== Program 291: Listen for Beta Response ===');
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}

for (let i = 0; i < 6; i++) {
  if (isCancelled()) break;
  await sleep(1000);
}

if (bot.players.beta?.entity) {
  console.log('Beta pos after wait:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
