# To change this template, choose Tools | Templates
# and open the template in the editor.

require 'nokogiri'
class Note
  def initialize
    
  end
  
  class << self
    def serialize_note note
      {
         :note_guid    => note.guid,
         :text_content => text_content(note.content),
         :html_content => html_content(note.content),
         :title        => note.title,
         :created      => Time.at(note.created/1000),
         :updated      => Time.at(note.updated/1000)
      }
    end

    def html_content content
      content = Nokogiri::XML(content)
      content.first.to_s
    end

    def text_content content
      content = Nokogiri::XML(content)
      content.first.content
    end
  end
end
