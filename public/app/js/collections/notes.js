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
                this.current_guid = null;
            },
            model: Note,
            fetchAll: function(guid){
                if(this.current_guid == null)
                    this.current_guid = guid;
                var that = this;
                $.ajax({
                    url      : "evernote/notes.json",
                    type     : "GET",
                    data     : "filters[notebook_guid]=" + guid,
                    success  : function(res){
                        if(this.current_guid == guid)
                            that.add(res.notes);
                        else{
                            that.models = new Array();
                            that.add(res.notes);
                            that.current_guid = guid;
                        }
                        that.trigger("fetchAll", false, null);
                    },
                    error    : function(res){
                        that.trigger("fetchAll", true, "Error Text");
                    }
                })
            }
        });
    });