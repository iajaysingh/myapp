define([
    'order!jquery',
    'order!underscore',
    'order!e_note',
    'order!collections/notes',
    'order!collections/notebooks',
    'order!models/note',
    'order!models/notebook',
    'order!require/dialog_box',
    'text!templates/notebook_list_item.html',
    'text!templates/note_list_item.html',
    'text!templates/note.html',
    'text!templates/create_note_btn.html',
    'text!templates/create_note.html',
    'text!templates/create_notebook.html',
    'text!templates/heads_up.html'
], function($, _, ENote, Notes, Notebooks, Note, Notebook, DialogBox,
            NotebookItemTempl, NoteItemTempl, NoteTempl, 
            CreateNoteBtn, CreateNoteTempl, CreateNotebookTempl, HeadsUpTempl){
    return ENote.View.extend({
        el: 'body',
        initialize: function(){
            this.notes = new Notes();
            this.notebooks = new Notebooks();
            this.note = new Note();
            this.notebook = new Notebook();
            _.bindAll(this, 'render', 'renderNotebooks', 'renderNotes', 'updateNotes', 'updateNotebooks');
            this.notebooks.bind("fetchAll", this.renderNotebooks);
            this.notes.bind("fetchAll", this.renderNotes);
            this.note.bind("create", this.updateNotes);
            this.notebook.bind("create", this.updateNotebooks);
        },
        events: {
            "click .notebook-name"    : "fetchNotes",
            "click .note-list-item"   : "displayCompleteNote",
            "click .create-note"      : "renderCreateNote",
            "click .cancel"           : "closeDialog",
            "click .save-note"        : "createNote",
            "click .create-notebook"  : "renderCreateNotebook",
            "click .save-notebook"    : "createNotebook"
        },
        render: function(){
            this.notebooks.fetchAll();
//            this.setQtips();
        },
        renderNotebooks : function(is_error, message){
            if(!is_error){
                $(".span3 .nav-list .notebook-list-item").remove();
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
            $(".notebook-list-item").removeClass("active")
            $(event.currentTarget).parent().addClass("active");
            $("div.loader-container-span").removeClass("hidden");
            var guid = $(event.currentTarget).attr("id").split("_")[1]
            this.notes.fetchAll(guid);
            $(".current_notebook").text($(event.currentTarget).parent().text());
        },
        renderNotes : function(is_error, message){
           $("div.loader-container-span").addClass("hidden");
           if(!is_error){
                $(".span9 table tbody").empty();
                if(this.notes.models.length > 0){
                    for(var i in this.notes.models){
                        this.$el.find("table tbody").append(_.template(NoteItemTempl, {note : this.notes.models[i], index : (parseInt(i) + 1)}))
                    }
                    $("table.note-list").removeClass("hidden");
                    $("div.alert").remove();
                }else{
                    $("table.note-list").addClass("hidden");
                    $("div.alert").remove();
                    $("div.loader-container-span").after(_.template(HeadsUpTempl, {message : "Oops!! This notebook is empty.", msg_class : 'alert-info'}));
                }
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
        updateNotebooks: function(is_error, message){
            if(!is_error){
                ENote.closeDialog();
                this.notebooks.add(this.notebook);
                this.renderNotebooks(false, null);
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
        renderCreateNotebook: function(event){
            event.preventDefault();
            DialogBox.view(_.template(CreateNotebookTempl), {
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
        },
        createNotebook: function(event){
            event.preventDefault();
            var contents = $('#notebook_creation').serialize();
            this.notebook.create(contents);
        },
        setQtips: function(){
            $('.create-notebook').each(function() {
                var me = this;
                $(this).qtip({
                    style: {
                        tip: true
                    },
                    position:{
                        at: 'bottom left', // Position the tooltip above the link
                        my: 'top left',
                        adjust: {
                            x: 1,
                            y: -33
                        }
                    },
                    show: {
                        event: 'click',
                        modal: {
                                on: false,
                                effect: true,
                                blur: true,
                                keyboard: true
                            }
                    },
                    hide: 'unfocus',
                    content: {
                        text: $('.nb-create').clone().show()
                    },
                    events : {
                        render: function(event, api){
                        }
                    }
                });
            }).click(function (event) {
                event.preventDefault();
            });
        }
    });
});