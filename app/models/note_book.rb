# To change this template, choose Tools | Templates
# and open the template in the editor.

class NoteBook
  def initialize
    
  end

  class << self
    def serialize notebook, time_zone
      {
        :notebook_guid => notebook.guid,
        :name          => notebook.name,
        :is_default    => notebook.defaultNotebook,
        :created       => EvernoteUtils.humanize_date(Time.at(notebook.serviceCreated/1000).in_time_zone(time_zone)),
        :updated       => EvernoteUtils.humanize_date(Time.at(notebook.serviceUpdated/1000).in_time_zone(time_zone))
      }
    end
  end
end
