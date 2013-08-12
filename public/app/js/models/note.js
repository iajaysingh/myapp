define([
    'jquery',
    'underscore',
    'e_note',
//    'order!require/moment'
    ], function($, _, ENote) {
        return ENote.Model.extend({
            initialize: function(){
                this.urlRoot = 'evernote/note/';
            },
            title: function(){
                
            },
            download_url: function(){
                
            },
            preview_url: function(){
                
            },
            note_size: function(){
                
            },
            getNoteSizeString: function(size) {
                var i = -1;
                var byteUnits = [' KB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
                do {
                    size = size / 1024;
                    i++;
                } while (size > 1024);

                return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
            },
            displayDate:function (moment, dateField, date_format) {
                var tDate = this.get(dateField)
                if (_.isEmpty(tDate)) return  "";
                var time_zone_offset = (TIBR.currentUser ? TIBR.currentUser.time_zone_offset : 0);
                var date = moment(tDate).utc().add("minutes", time_zone_offset),
                    now = moment().utc().add("minutes", time_zone_offset);
                return date.format(date_format);
            },
            createdAt:function () {
//                return this.displayDate(moment,'createdDate', ENote.dateFormat.MMMMD);
            },
            lastUpdated: function(){
//                return this.displayDate(moment,'modifiedDate', ENote.dateFormat.MMMMD);
            },
            updatedAt:function () {
//                return this.displayDate(moment,'modifiedDate', ENote.dateFormat.LLLLLLL);
            },
            getFile: function(file_id, callback){
                this.url = this.urlRoot + file_id;
                var that = this;
                this.fetch({
                    success: function(res){
                        callback(that);
                    },
                    error: function(error){
                        console.log("error", error)
                    }
                })
            }
        });
    });



