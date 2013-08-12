class CreateTenants < ActiveRecord::Migration
  def up
    create_table :tenants do |t|
      t.string :name
    end
    add_index :tenants, :name
  end

  def down
    remove_index :tenants, :name
    drop_table :tenants
  end
end
