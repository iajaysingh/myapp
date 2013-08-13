# To change this template, choose Tools | Templates
# and open the template in the editor.

require 'nokogiri'
class Note
  def initialize
    
  end
  
  class << self
    def serialize note
      {
         :note_guid    => note.guid,
         :text_content => text_content(note.content),
         :html_content => html_content(note.content),
         :title        => note.title,
         :created      => Time.at(note.created/1000),
         :updated      => Time.at(note.updated/1000),
         :active       => note.active
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
  end
end
