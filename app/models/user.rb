class User < ActiveRecord::Base
  has_many :meetings, :dependent => :destroy
  has_many :attendees
  belongs_to :tenant

  class << self
    def current_tenant
      Thread.current[:tenant]
    end
    
    def current_tenant=(tenant)
      Thread.current[:tenant] = tenant
    end
  end
end
