define([
    'order!jquery',
    'order!underscore',
    'order!e_note',
    'order!collections/notes'
], function($, _, ENote, Notes){
    return ENote.View.extend({
        el: 'body',
        initialize: function(){
            _.bindAll(this, 'render');
            this.event_obj = {};
        },
        events: {
        },
        render: function(){
            console.log("Initialized the app . . . Yoo HOOOOOO!!")
        }
    });
});