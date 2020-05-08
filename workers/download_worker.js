var async = require('async');

var __define = require('../config/define');
var __logger = require('../lib/logger');
var __db = require('../lib/db');
var config = require('../config');
const json2csv = require('json2csv');
const moment = require('moment');
const fs = require('fs');


class downloadWorker {
    constructor() {
        this.app = {};
    }
    startServer() {
        __logger.info('loaded application with "' + process.env.NODE_ENV + '" environment, PID: ' + process.pid);
        var self = this;

        __db.init().then(result => {
            const rmq_object = __db.rabbitmq_vb.fetchFromQueue();
            let queue = __define.MQ.cdr_download_request.q_name;
            __logger.info("Waiting for message...")
            rmq_object.channel[queue].consume(queue, (mq_message) => {
                __logger.debug('received:', {mq_message: mq_message});
                let query_data = JSON.parse(mq_message.content.toString());

                let campaign_id = query_data.data['campaign_id'] || null;
                let sql_query = "select cm.destination, cm.circle, cm.operator, \n" +
                    "if (cm.start_epoch = 0, cm.start_epoch, DATE_FORMAT(CONVERT_TZ(from_unixtime(floor(cm.start_epoch)),'+00:00','+05:30'), '%Y-%m-%d %H:%i:%S')) as start_epoch, \n" +
                    "if (cm.end_epoch = 0, cm.end_epoch, DATE_FORMAT(CONVERT_TZ(from_unixtime(floor(cm.end_epoch)),'+00:00','+05:30'), '%Y-%m-%d %H:%i:%S')) as end_epoch, \n" +
                    "if (cm.answer_epoch = 0, cm.answer_epoch, DATE_FORMAT(CONVERT_TZ(from_unixtime(floor(cm.answer_epoch)),'+00:00','+05:30'), '%Y-%m-%d %H:%i:%S')) as answer_epoch, \n" +
                    "cm.billsec, " + __define.MYSQL_QUERY.cdr_reason + ", cm.hangup_cause, if(cm.reason='SUCCESS',dp.dtmf,'') as dtmf \n" +
                    "from cdr_master cm left join dtmf_pressed dp on cm.call_uuid=dp.vcall_id where cm.campaign_id like ? order by cm.id desc;"
                // let sql_query = "select cm.destination, cm.circle, cm.operator, from_unixtime(floor(cm.start_epoch)) as start_epoch, from_unixtime(floor(cm.end_epoch)) as end_epoch, from_unixtime(floor(cm.answer_epoch)) as answer_epoch, cm.billsec, " + __define.MYSQL_QUERY.cdr_reason + ", cm.hangup_cause, if(cm.reason='SUCCESS',dp.dtmf,'') as dtmf from cdr_master cm left join dtmf_pressed dp on cm.call_uuid=dp.vcall_id where cm.campaign_id like ? order by cm.id desc;";
                let query_param = [campaign_id];

                __db.mysql.query("mysql_call_db", sql_query, query_param).then((results) => {
                    const filename = '/var/log/csv_files/vb_' + moment().format('X') + '.csv';
                    const fields = ["destination", "circle", "operator", "start_epoch", "end_epoch", "answer_epoch", "billsec", "reason", "hangup_cause", "dtmf"];
                    const fieldNames = ["Destination", "Circle", "Operator", "Start Epoch", "End Epoch", "Answer Epoch", "Bill Sec", "Reason", "Hangup Cause", "DTMF"];
                    const csv = json2csv({ data: results, fields: fields, fieldNames: fieldNames});
                    fs.writeFile(filename, csv, function(err) {
                        if (err) throw err;
                        let data = {"campaign_id": campaign_id, "filename": filename, "download_status": "finished"};
                        __db.mongo.__update("vb", "download_status", {"campaign_id": campaign_id}, data).then((results) => {
                            __logger.debug("Download Status successfully saved");
                            rmq_object.channel[queue].ack(mq_message);
                        }).catch(err => {
                            __logger.error("error: ", err);
                        });
                    });
                }).catch(err => {
                    __logger.error("error: ", err);
                });
            }, { noAck: false });
            //
            // const xlsx_file = '/tmp/' + req.query.camp_id + '_' + moment().format('X') + '.csv';
            // const zip_file = __config.export_zip_directory + req.query.camp_id + '_' + moment().format('X') + '.zip';
            // // util.make_xlsx_file(final_data, xlsx_file);
            // //Archive xlsx file to zip
            // var archive = archiver('zip');
            // var output = fs.createWriteStream(zip_file);
            // output.on('close', function () {
            //     res.download(zip_file);
            // });
            // archive.on('error', function(err) {
            //     throw err;
            // });
            // archive.file(xlsx_file, { name: req.query.camp_id + '_' + moment().format('X') + '.xlsx' });
            // archive.pipe(output);
            // archive.finalize();
            // }
        }).catch(err => {
            __logger.error("error: ", err);
            process.exit(1);
        });

        self.stop_gracefully = function () {
            __logger.info('stopping all resources gracefully');
            __db.close(function () {
                process.exit(0);
            });
        };
        process.on('SIGINT', self.stop_gracefully);
        process.on('SIGTERM', self.stop_gracefully);
    }
}

class worker extends downloadWorker {
    start() {
        console.log((new Date()).toLocaleString() + '   >> Worker PID:', process.pid);
        super.startServer();
    }
}

module.exports.worker = new worker();
