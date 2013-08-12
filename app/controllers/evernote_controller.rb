class EvernoteController < ApplicationController

  before_filter :logged_in_user, :only =>[:index]
  before_filter :client_init, :only => [:notebooks, :notes, :create_notebook, :create_note, :index]

  def index
    if @current_user.note_store_url.blank?
      user_store = @client.user_store
      note_store_url = user_store.getNoteStoreUrl(@current_user.evernote_access_token)
      @current_user.update_attributes(:note_store_url => note_store_url)
    end
  end

  def notebooks
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    note_books = note_store.listNotebooks(@current_user.evernote_access_token)
    render_payload(note_books)
  end

  def notes
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    filter = enable_filters filter, params[:filters]
    result_spec = Evernote::EDAM::NoteStore::NotesMetadataResultSpec.new()
    note_list   = note_store.findNotesMetadata(@current_user.evernote_access_token, filter, 0, 10, result_spec)
    render_payload(NoteStore.get_notes(note_store, @current_user.evernote_access_token, note_list))
  end
  
  def create_notebook
    notebook = Evernote::EDAM::Type::Notebook.new(:name => params[:notebook][:name], :defaultNotebook => params[:notebook][:is_default])
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    created_notebook = note_store.createNotebook(@current_user.evernote_access_token, notebook)
    render_payload(NoteBook.serialize_notebook(created_notebook))
  end

  def create_note
    #Pending
    #================================
    #Implementation for Resources
    #sanitizing the contents
    #================================
    note = Evernote::EDAM::Type::Note.new()
    note.title = params[:note][:title]
    note.content = '<?xml version="1.0" encoding="UTF-8"?>' +
      '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">' +
      '<en-note>' + params[:note][:content]  + '</en-note>'
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    created_note = note_store.createNote(@current_user.evernote_access_token, note)
    render_payload(Note.serialize_note(created_note))
  end

  #generally not available for third party applications
  def email_note
    email_params = Evernote::EDAM::NoteStore::NoteEmailParameters.new()
    email_params.guid = params[:note][:guid]
    email_params.toAddresses = params[:note][:to_addresses].spilt(",")
    email_params.ccAddresses = params[:note][:cc_addresses].spilt(",")
    email_params.subject     = params[:note][:subject]
    email_params.message     = params[:note][:message]
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    begin
      response = note_store.emailNote(@current_user.evernote_access_token, email_params)
      render_okay
    rescue => ex
      render_error("Unable to email the note at this moment. Please try again later.")
    end
  end

  def share_note
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    begin
      secret_note_key = note_store.shareNote(@current_user.evernote_access_token, params[:note][:guid])
      render_payload({:shared_url => generate_shared_url(params[:note][:guid], secret_note_key)})
    rescue => ex
      Rails.logger.error "Error :: #{ex.message}"
      Rails.logger.error "Trace :: #{ex.backtrace}"
      render_error("Unable to share at this moment. Please try again later.")
    end
  end

  def copy_note
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    begin
      note = note_store.copyNote(@current_user.evernote_access_token, params[:note_guid], params[:notebook_guid])
      note = Note.serialize_note(note)
      render_payload(note)
    rescue => ex
      Rails.logger.error "Error :: #{ex.message}"
      Rails.logger.error "Trace :: #{ex.backtrace}"
      render_error("Unable to copy the note at this moment. Please try again later.")
    end
  end

  def delete_note
    note_store = @client.note_store(:note_store_url => @current_user.note_store_url)
    begin
      note_store.deleteNote(@current.evernote_access_token, params[:note][:guid])
      render_okay
    rescue => ex
      Rails.logger.error "Error :: #{ex.message}"
      Rails.logger.error "Trace :: #{ex.backtrace}"
      render_error("Unable to expunge the note at this moment. Please try again later.")
    end
  end

  protected

  def client_init
    @client = EvernoteOAuth::Client.new(:token => @current_user.evernote_access_token)
  end

  def enable_filters options
    filter = Evernote::EDAM::NoteStore::NoteFilter.new()
    return filter if options.blank?
    filter.notebookGuid = options[:notebook_guid] unless options[:notebook_guid].blank?
    filter.words = options[:words].split(",").join(" ") unless options[:words].blank?
    filter
  end
end
