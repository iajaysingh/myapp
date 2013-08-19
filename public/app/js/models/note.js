define([
    'jquery',
    'underscore',
    'e_note',
    ], function($, _, ENote) {
        return ENote.Model.extend({
            initialize: function(){
                this.urlRoot = 'evernote/';
                this.notebook_guid = null;
            },
            create : function(params){
                var completeUrl = this.urlRoot + "create_note.json";
                var that = this;
                $.ajax({
                    url      : completeUrl,
                    type     : "POST",
                    data     : params,
                    success  : function(res){
                        that.attributes = res;
                        that.trigger("create", false, null);
                    },
                    error    : function(res){
                        that.trigger("create", true, "Error Text");
                    }
                })
            }
        });
    });



