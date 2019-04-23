const fs = require('fs');
const hljs = require('highlight.js');
const sass = require('sass');
const axios = require('axios');
const chalk = require('chalk');

// primer css
const cssBase = sass.renderSync({ file: './node_modules/@primer/css/base/index.scss' }).css.toString();
const cssMarkdown = sass.renderSync({ file: './node_modules/@primer/css/markdown/index.scss' }).css.toString();

// highlight.js theme
const cssHljs = fs.readFileSync('./node_modules/highlight.js/styles/github.css').toString();

// github highlight style
const cssGithub = fs.readFileSync('./node_modules/github-syntax-light/lib/github-light.css').toString();

module.exports = {
    markdownIt(markdown) {
        const mdIt = require('markdown-it')({
            highlight(str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
                    } catch (_) { }
                }

                return `<pre class="hljs"><code>${mdIt.utils.escapeHtml(str)}</code></pre>`;
            },
        });

        return {
            html: mdIt.render(markdown),
            styles: [
                cssBase,
                cssMarkdown,
                cssHljs,
            ],
        };
    },

    github(markdown) {
        console.log(`fetching ${chalk.cyan('https://api.github.com/markdown')}`);

        return axios({
            method: 'post',
            url: 'https://api.github.com/markdown',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                text: markdown,
            }
        }).then(res => {
            return {
                html: res.data,
                styles: [
                    cssBase,
                    cssMarkdown,
                    cssGithub,
                ]
            }
        });
    },
};
