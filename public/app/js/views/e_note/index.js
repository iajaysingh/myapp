define([
    'order!jquery',
    'order!underscore',
    'order!e_note',
    'order!collections/notes',
    'order!collections/notebooks',
    'order!models/note',
    'order!require/dialog_box',
    'text!templates/notebook_list_item.html',
    'text!templates/note_list_item.html',
    'text!templates/note.html',
    'text!templates/create_note_btn.html',
    'text!templates/create_note.html'
], function($, _, ENote, Notes, Notebooks, Note, DialogBox,
            NotebookItemTempl, NoteItemTempl, NoteTempl, CreateNoteBtn, CreateNoteTempl){
    return ENote.View.extend({
        el: 'body',
        initialize: function(){
            this.notes = new Notes();
            this.notebooks = new Notebooks();
            this.note = new Note();
            _.bindAll(this, 'render', 'renderNotebooks', 'renderNotes', 'updateNotes');
            this.notebooks.bind("fetchAll", this.renderNotebooks);
            this.notes.bind("fetchAll", this.renderNotes);
            this.note.bind("create", this.updateNotes);
        },
        events: {
            "click .notebook-name"    : "fetchNotes",
            "click .note-list-item"   : "displayCompleteNote",
            "click .create-note"      : "renderCreateNote",
            "click .cancel"           : "closeDialog",
            "click .save-note"        : "createNote"
        },
        render: function(){
            this.notebooks.fetchAll();
        },
        renderNotebooks : function(is_error, message){
            if(!is_error){
                for(var i in this.notebooks.models){
                    this.$el.find("ul.nav-list").append(_.template(NotebookItemTempl, {notebook : this.notebooks.models[i], notebook_facets : enote_init["nb_facets"]}))
                }
                this.$el.find(".create-btn").html(_.template(CreateNoteBtn));
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
        },
        updateNotes : function(is_error, message){
            if(!is_error){
                ENote.closeDialog();
                if(this.notes.current_guid === this.note.notebook_guid){
                    this.notes.add(this.note);
                    this.renderNotes(false, null);
                }
            }else{
                console.error("Error :: ", message);
            }
        },
        displayCompleteNote: function(event){
            event.preventDefault();
            var cid = $(event.currentTarget).attr("id").split("-")[2];
            var note = this.notes.getByCid(cid);
            DialogBox.view(_.template(NoteTempl, {note : note}), {
                    width: 520,
                    modal: false,
                    className: '',
                    "position": {
                        my: "center",
                        at: "center",
                        of: $(".span9")
                        }
                });
        },
        renderCreateNote: function(event){
            event.preventDefault();
            DialogBox.view(_.template(CreateNoteTempl, {notebooks : this.notebooks.models}), {
                    width: 630,
                    modal: false,
                    className: '',
                    "position": {
                        my: "center",
                        at: "center",
                        of: $(".span9")
                        }
                });
        },
        closeDialog: function(event){
            event.preventDefault();
            ENote.closeDialog();
        },
        createNote: function(event){
            event.preventDefault();
            var contents = $('#note_creation').serialize();
            this.note.notebook_guid = $(".selectpicker").val();
            this.note.create(contents);
        }
    });
});