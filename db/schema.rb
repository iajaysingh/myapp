# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20130807185601) do

  create_table "app_configs", force: true do |t|
    t.string   "name"
    t.string   "value"
    t.integer  "tenant_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "app_configs", ["name"], name: "index_app_configs_on_name", using: :btree

  create_table "tenants", force: true do |t|
    t.string "name"
  end

  add_index "tenants", ["name"], name: "index_tenants_on_name", using: :btree

  create_table "users", force: true do |t|
    t.integer  "tibbr_user_id",         null: false
    t.string   "tenant_name"
    t.string   "access_token"
    t.string   "display_name"
    t.string   "email"
    t.text     "profile_image_url"
    t.string   "locale"
    t.string   "time_zone"
    t.text     "evernote_auth_token"
    t.text     "evernote_access_token"
    t.integer  "tenant_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "note_store_url"
  end

  add_index "users", ["access_token"], name: "index_users_on_access_token", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["tenant_id"], name: "index_users_on_tenant_id", using: :btree
  add_index "users", ["tenant_name"], name: "index_users_on_tenant_name", using: :btree
  add_index "users", ["tibbr_user_id"], name: "index_users_on_tibbr_user_id", using: :btree

end
