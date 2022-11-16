module.exports = {
    evaluate: function(client, fun, args) {
        var argsString = args.map(x => JSON.stringify(x)).join(',');
        var code = `(${fun.toString()})(${argsString})`;

        return client.send('Runtime.evaluate', {
            expression: code,
            returnByValue: true
        });
    },
}
