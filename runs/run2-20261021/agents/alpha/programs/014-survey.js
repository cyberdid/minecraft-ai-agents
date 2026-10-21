const st = lib.status();
console.log('Pos:', lib.fmt(st.pos), 'Health:', st.health, 'Food:', st.food);
console.log('Time until night:', st.secondsUntilNight, 's');
console.log('Inv:', JSON.stringify(lib.inv()));

// Let's see what's nearby
const trees = lib.find('*_log', { maxDistance: 64, count: 3 });
console.log('Nearby trees/logs:', trees.length ? trees.map(t => `${t.name} at ${lib.fmt(t.position)}`).join(', ') : 'none within 64');

bot.chat('Checking status: starting resource run for wood & coal.');
return { st, trees: trees.map(t => ({ name: t.name, pos: t.position })) };
