// programs/506-check-door.js
const door = lib.blockAt(294, 72, -54);
console.log('Door at (294, 72, -54):', door ? door.name : 'null');
const botPos = bot.entity.position;
console.log('Bot pos:', lib.fmt(botPos));
