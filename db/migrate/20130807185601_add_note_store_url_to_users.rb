class AddNoteStoreUrlToUsers < ActiveRecord::Migration
  def up
    add_column :users, :note_store_url, :string
  end

  def down
    remove_column :users, :note_store_url
  end
end
