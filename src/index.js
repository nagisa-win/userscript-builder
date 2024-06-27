const fs = require('fs');
const uglifyJS = require('uglify-js');


fs.readdirSync('output/').forEach(file => {
    if (file.endsWith('.min.js')) return;

    const filename = file.split('.').slice(0, -1).join('.');
    const inputFile = `output/${filename}.js`;
    const outputFile = `output/${filename}.min.js`;
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) throw err;
        const minifiedCode = uglifyJS.minify(data).code;
        fs.writeFile(outputFile, minifiedCode, 'utf8', err => {
            if (err) throw err;
            console.log(`Minified ${filename}.js to ${filename}.min.js`);
        });
    });
});