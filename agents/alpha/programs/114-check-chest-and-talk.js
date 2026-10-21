// programs/114-check-chest-and-talk.js
console.log('alpha at:', lib.fmt(bot.entity.position));

const contents = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(contents));

bot.chat('alpha: Great job making it back beta! Base chest has a stone sword and stone axe for you too. When ready, let us mine east hill iron!');
