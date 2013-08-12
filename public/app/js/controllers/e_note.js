define([
    'order!jquery',
    'order!underscore',
    'order!e_note',
    'order!views/e_note/index'
    ], function($, _, ENote, noteView) {
        var enoteController = ENote.Router.extend({
            routes : {
                "" : "renderNotesView"
            },
            initialize: function(){
                this.note_view = new noteView();
            },
            renderNotesView: function(){
                this.note_view.render();
            }
        });
        var initialize = function(){
            new enoteController;
            Backbone.history.start();
        };
        return {
            initialize: initialize
        };
    });


