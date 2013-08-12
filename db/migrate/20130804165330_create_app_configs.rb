class CreateAppConfigs < ActiveRecord::Migration
  def self.up
    create_table :app_configs, :force => true do |t|
      t.string     :name
      t.string     :value
      t.references :tenant
      t.timestamps
    end
    add_index :app_configs, :name
  end

  def self.down
    remove_index :app_configs, :name
    drop_table :app_configs
  end

end
