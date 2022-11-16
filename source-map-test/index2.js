const { SourceMapConsumer } = require('source-map');

const rawSourceMap = {
    version: 3,
    file: "min.js",
    names: ["bar", "baz", "n"],
    sources: ["one.js", "two.js"],
    sourceRoot: "http://example.com/www/js/",
    mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA"
};

(async function() {
    await SourceMapConsumer.with(rawSourceMap, null, consumer => {
        // 目标代码位置查询源码位置
        consumer.originalPositionFor({
            line: 2,
            column: 28
        })
        // { source: 'http://example.com/www/js/two.js',
        //   line: 2,
        //   column: 10,
        //   name: 'n' }
    
        // 源码位置查询目标代码位置
        consumer.generatedPositionFor({
            source: "http://example.com/www/js/two.js",
            line: 2,
            column: 10
        })
        // { line: 2, column: 28 }
    
        // 遍历 mapping
        consumer.eachMapping(function(m) {
            console.log(m);
        });    
    });
})();