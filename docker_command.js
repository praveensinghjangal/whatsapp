// docker build -t git.vivaconnect.co/helo-one/angular-web/vb-portal .
// docker push git.vivaconnect.co/helo-one/angular-web/vb-portal
// docker run -p 8080:80 --restart=always -d --name vb-portal git.vivaconnect.co/helo-one/angular-web/vb-portal:latest
//
// docker build -t git.vivaconnect.co/helo-one/node-ms/otp-api .
// docker push git.vivaconnect.co/helo-one/node-ms/otp-api
// docker run --net host -e NODE_ENV=staging_to_pr -e PORT=4000 -e WORKER_TYPE=download_worker --restart=always -v /var/docker_volumes/otp-api/:/var/log/ -v /var/docker_volumes/otp-api-csv/:/var/log/csv_files -d --name otp-api-download-worker git.vivaconnect.co/helo-one/node-ms/otp-api
// docker run --net host -e NODE_ENV=staging_to_pr -e PORT=4000 -e WORKER_TYPE=http_api --restart=always -v /var/docker_volumes/otp-api/:/var/log/ -v /var/docker_volumes/otp-api-csv/:/var/log/csv_files -d --name otp-api git.vivaconnect.co/helo-one/node-ms/otp-api


const netstat = require('node-netstat');
const find = require('find-process');
var __logger = require('./lib/logger');

find('name', 'node').then(function (process_list) {
    for(var i in process_list) {
        idata = process_list[i];
        // console.log(idata)
        if(idata['cmd'].indexOf('server.js') !== -1) {
            netstat({
                filter: {
                    pid: idata['pid'],
                    // protocol: 'tcp'
                },
                // limit: 5,
                watch: true
            }, function (data) {
                if(data['remote']['port'] === 5672) {
                    __logger.debug(data['state'])
                }
            });
        }

    }

}, function (err) {
    console.log(err.stack || err);
})

