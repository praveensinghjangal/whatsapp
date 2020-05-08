const _ = require('lodash');
const check_type = require("./check_datatype");

let helper = {};

helper.get_set_command_for_update = (req_data, restrict_field_update=[]) => {
    let set_command = [];
    for(d in req_data) {
        if(!(restrict_field_update.includes(d))) {
            if(check_type.isString(req_data[d]) === true) {
                data = "'"+ req_data[d] +"'";
            } else {
                data = req_data[d];
            }
            set_command.push(d + '=' + data);
        }
    }
    return set_command.join(', ');
};

module.exports = helper;
