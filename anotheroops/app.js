const ejs = require('ejs');
const path = require('path');
const express = require('express');
const body_parser = require('body-parser');
const compression = require('compression');

const AppConfigs = require('./components/settings/configs');

let app = express();
app.listen(3000);

//app.use(compression()); // if NGINX - http://nginx.org/en/docs/http/ngx_http_gzip_module.html
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

 app.use('/', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.engine('.ejs', ejs.__express);

let api = require('./controllers/api');
api.initialize(app);

Object.defineProperty(Object.prototype, 'getOnly', {
    value: function () {
        if (Array.isArray(this)) {
            var arr = [], args = arguments;

            this.forEach(function (el) {
                var obj = {};

                [].filter.call(args, function (k) {
                    if (typeof k == 'function') {
                        obj[k.name] = k.call(el);
                    } else {
                        obj[k] = el[k];
                    }
                });

                arr.push(obj);
            });

            return arr;
        } else if (this) {
            var obj = {}, el = this;

            [].filter.call(arguments, function (k) {
                if (typeof k == 'function') {
                    obj[k.name] = k.call(el);
                } else {
                    obj[k] = el[k];
                }
            });

            return obj;
        }

        return this;
    },
    writable: true,
    configurable: true,
    enumerable: false
});

/*
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-98360900-1', 'auto');
  ga('send', 'pageview');

</script>
*/
