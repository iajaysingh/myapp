class  Tenant < ActiveRecord::Base
    has_many    :app_configs
    has_many    :users, :dependent => :destroy
    
    def config_get name
        o = app_configs.find_by_name(name)
        o.blank? ? nil : o.value
    end

    def config_set name, value
        o = app_configs.find_by_name(name)
        if o.blank?
            app_configs << AppConfig.create(:name => name, :value => value)
            save
        else
            o.value = value
            o.save
        end
    end
    #added to update user profiles in background
    def synchronize_users (access_token)
      Tibbr::User.access_token = access_token
      User.find_in_batches(:batch_size => 10, :conditions => ["tenant_name = ?", name]) do |ideation_users|
        ideation_users.each do |user|
          tibbr_user = Tibbr::User.find(user.tibbr_user_id)
          user.update_attributes({:display_name => tibbr_user.display_name, :login => tibbr_user.login, 
                                  :profile_image_url => tibbr_user.profile_image_url, :locale => tibbr_user.locale, 
                                  :time_zone => tibbr_user.time_zone
                                })
          Rails.logger.debug "User #{user.display_name}'s profile details updated."
        end
      end
    end
#    handle_asynchronously :synchronize_users, :priority => 90
    
end
