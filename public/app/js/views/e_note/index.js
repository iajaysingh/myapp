define([
    'order!jquery',
    'order!underscore',
    'order!e_note',
    'order!collections/notes',
    'order!collections/notebooks',
    'text!templates/notebook_list_item.html',
    'text!templates/note_list_item.html'
], function($, _, ENote, Notes, Notebooks, NotebookItemTempl, NoteItemTempl){
    return ENote.View.extend({
        el: '.main-container',
        initialize: function(){
            this.notes = new Notes();
            this.notebooks = new Notebooks();
            _.bindAll(this, 'render', 'renderNotebooks', 'renderNotes');
            this.notebooks.bind("fetchAll", this.renderNotebooks);
            this.notes.bind("fetchAll", this.renderNotes);
        },
        events: {
            "click .notebook-name" : "fetchNotes"
        },
        render: function(){
            this.notebooks.fetchAll();
        },
        renderNotebooks : function(is_error, message){
            if(!is_error){
                for(var i in this.notebooks.models){
                    this.$el.find("ul.nav-list").append(_.template(NotebookItemTempl, {notebook : this.notebooks.models[i], notebook_facets : enote_init["nb_facets"]}))
                }
                $("div.loader-container").addClass("hidden");
                $("div.main-container").removeClass("hidden");
            }else{
                console.error("Error :: ", message);
            }
        },
        fetchNotes : function(event){
            $("div.loader-container-span").removeClass("hidden");
            var guid = $(event.currentTarget).attr("id").split("_")[1]
            this.notes.fetchAll(guid);
        },
        renderNotes : function(is_error, message){
           if(!is_error){
                $(".span9 table tbody").empty();
                for(var i in this.notes.models){
                    this.$el.find("table tbody").append(_.template(NoteItemTempl, {note : this.notes.models[i], index : (parseInt(i) + 1)}))
                }
                $("div.loader-container-span").addClass("hidden");
                $("table.note-list").removeClass("hidden");
            }else{
                console.error("Error :: ", message);
            }
        }
    });
});