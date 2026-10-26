// programs/468-obtain-stone-pickaxe.js
console.log('=== Step: Obtain Stone Pickaxe via lib.obtain ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

try {
  const r = await lib.obtain('stone_pickaxe', 1);
  console.log('Obtain result:', r.have);
  if (r.steps) console.log('Steps:\n' + r.steps.join('\n'));
} catch (e) {
  console.log('lib.obtain error:', e.message);
}

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Pickaxe status: inv=${JSON.stringify(lib.inv())}`);
