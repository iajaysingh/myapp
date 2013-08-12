class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users, :force => true do |t|
      t.integer    :tibbr_user_id, :null => false
      t.string     :tenant_name
      t.string     :access_token
      t.string     :display_name
      t.string     :email
      t.text       :profile_image_url
      t.string     :locale
      t.string     :time_zone
      t.text       :evernote_auth_token
      t.text       :evernote_access_token
      t.references :tenant
      t.timestamps
    end
    add_index :users, :tibbr_user_id
    add_index :users, :tenant_name
    add_index :users, :access_token
    add_index :users, :email
    add_index :users, :tenant_id
  end

  def self.down
    remove_index :users, :tibbr_user_id
    remove_index :users, :tenant_name
    remove_index :users, :access_token
    remove_index :users, :email
    remove_index :users, :tenant_id
    drop_table   :users
  end

end
