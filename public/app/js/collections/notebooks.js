define([
    'jquery',
    'underscore',
    'e_note',
    'models/notebook'
    ], function($, _, ENote, Notebook){
        return ENote.Collection.extend({
            initialize: function(){
                this.urlRoot = 'evernote/notebooks';
            },
            model: Notebook,
            fetchAll: function(){
                var that = this;
                $.ajax({
                    url      : "evernote/notebooks.json",
                    type     : "GET",
                    success  : function(res){
                        that.add(res.notebooks);
                        that.trigger("fetchAll", false, null);
                    },
                    error    : function(res){
                        that.trigger("fetchAll", true, "Error Text");
                    }
                })
            }
        });
    });


