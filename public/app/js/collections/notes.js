define([
    'jquery',
    'underscore',
    'e_note',
    'models/note'
    ], function($, _, ENote, Note){
        return ENote.Collection.extend({
            initialize: function(){
                this.urlRoot = 'evernote/notes';
                this.filter_applied = {};
                this.page = 1;
                this.per_page = 10;
            },
            model: Note,
            fetchAll: function(guid){
                var that = this;
                $.ajax({
                    url      : "evernote/notes.json",
                    type     : "GET",
                    data     : "filters[notebook_guid]=" + guid,
                    success  : function(res){
                        that.add(res.notes);
                        that.trigger("fetchAll", false, null);
                    },
                    error    : function(res){
                        that.trigger("fetchAll", true, "Error Text");
                    }
                })
            }
        });
    });