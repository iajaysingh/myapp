# To change this template, choose Tools | Templates
# and open the template in the editor.

class NoteStore
  def initialize
    
  end
  
  class << self
    def get_notes note_store, evernote_access_token, note_list
      return {:total_count => 0, :notes => []} if note_list.notes.blank?
      notes = Array.new()
      note_list.notes.each do |note|
        note_obj = note_store.getNote(evernote_access_token, note.guid, true, true, false, false)
        notes << Note.serialize_note(note_obj)
      end
      {:total_count => note_list.totalCount, :notes => notes}
    end
  end
end
