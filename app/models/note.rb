# To change this template, choose Tools | Templates
# and open the template in the editor.

require 'nokogiri'
class Note
  def initialize
    
  end
  
  class << self
    def serialize note, time_zone
      {
         :note_guid    => note.guid,
         :text_content => text_content(note.content),
         :html_content => html_content(note.content),
         :title        => note.title,
         :created      => EvernoteUtils.humanize_date(Time.at(note.created/1000).in_time_zone(time_zone)),
         :updated      => EvernoteUtils.humanize_date(Time.at(note.updated/1000).in_time_zone(time_zone)),
         :active       => note.active,
         :tags         => Array.new()
      }
    end

    def html_content content
      content = Nokogiri::XML(content)
      html_content = content.xpath("//en-note").children.to_s
      html_content
    end

    def text_content content
      content = Nokogiri::XML(content)
      content.text
    end

    def fetch_and_serialize note_store, note, evernote_access_token, time_zone
      complete_note = note_store.getNote(evernote_access_token, note.guid, true, true, false, false)
      return serialize(complete_note, time_zone)
    end

    def get_notes options = {}
      note_store  = client.note_store(:note_store_url => options[:note_store_url])
      result_spec = Evernote::EDAM::NoteStore::NotesMetadataResultSpec.new()
      note_list   = note_store.findNotesMetadata(options[:evernote_access_token], options[:filter], options[:page], options[:per_page], result_spec)
    end
  end
end
