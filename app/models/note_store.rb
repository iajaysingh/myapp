# To change this template, choose Tools | Templates
# and open the template in the editor.

class NoteStore
  def initialize
    
  end
  
  class << self
    def get_notes note_store, evernote_access_token, note_list, time_zone
      return {:total_count => 0, :notes => []} if note_list.notes.blank?
      notes = Array.new()
      note_list.notes.each do |note|
        note_obj = note_store.getNote(evernote_access_token, note.guid, true, true, false, false)
        notes << Note.serialize(note_obj, time_zone)
      end
      {:total_count => note_list.totalNotes, :notes => notes}
    end

    def get_notebooks note_store, evernote_access_token, time_zone
      notebooks = note_store.listNotebooks(evernote_access_token)
      serialiazed_notebooks = Array.new()
      notebooks.each do |notebook|
        serialized_notebook = NoteBook.serialize(notebook, time_zone)
        if APP_CONFIG[:notebook_facets]
          filter = Evernote::EDAM::NoteStore::NoteFilter.new()
          filter.notebookGuid = notebook.guid
          note_count = note_store.findNoteCounts(evernote_access_token, filter, false)
          serialized_notebook.merge!(:note_count => note_count.notebookCounts[notebook.guid])
        end
        serialiazed_notebooks << serialized_notebook
      end
      {:total_count => notebooks.count, :notebooks => serialiazed_notebooks}
    end
  end
end
