define([
    'jquery',
    'underscore',
    'e_note',
    ], function($, _, ENote) {
        return ENote.Model.extend({
            initialize: function(){
                this.urlRoot = 'evernote/note/';
            },
            title: function(){

            }
        });
    });


