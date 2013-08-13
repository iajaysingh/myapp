# To change this template, choose Tools | Templates
# and open the template in the editor.

class NoteBook
  def initialize
    
  end

  class << self
    def serialize notebook
      {
        :notebook_guid => notebook.guid,
        :name          => notebook.name,
        :is_default    => notebook.defaultNotebook,
        :created       => Time.at(notebook.serviceCreated/1000),
        :updated       => Time.at(notebook.serviceUpdated/1000)
      }
    end
  end
end
