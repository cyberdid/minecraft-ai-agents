console.log('Testing lib.goTo to (63, 65, -8) with dig: true...');
try {
  await lib.goTo(63, 65, -8, 2, { dig: true });
  console.log('Reached near (63, 65, -8)! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('lib.goTo error:', e.message);
}
console.log('Bot pos now:', lib.fmt(bot.entity.position));
