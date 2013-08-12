define([
    'jquery',
    'underscore',
    'e_note',
    'models/note'
    ], function($, _, ENote, Note){
        return ENote.Collection.extend({
            initialize: function(){
                this.urlRoot = 'evernote/';
                this.filter_applied = {};
                this.page = 1;
                this.per_page = 10;
            },
            model: Note,
            completeURL: function(method_name){
                if (window["enote_config"]){
                    return this.urlRoot + method_name;
                }else{
                    return this.urlRoot + method_name;
                }
            }
        });
    });