const proxy = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/okc',
        proxy({
            target: 'https://www.okcupid.com',
            changeOrigin: true,
            pathRewrite: {
                '^/okc': '/'
            },
        }),
    )

    app.use(
        '/mock',
        proxy({
            target: 'http://localhost:5000',
            changeOrigin: true,
            pathRewrite: {
                '^/mock': '/'
            },
        }),
    )
}
