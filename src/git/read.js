const EventEmitter = require('events');

function stdinLineByLine(stdin) {
  const emitter = new EventEmitter();
  let buff = '';

  stdin
    .on('data', (data) => {
      buff += data;
      const lines = buff.split(/[\r\n|\n]/);
      buff = lines.pop();
      lines.forEach((line) => stdin.emit('line', line));
    })
    .on('end', () => {
      if (buff.length > 0) stdin.emit('line', buff);
    });

  return emitter;
}
