# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Evernote::Application.initialize!
begin
  Java::org.jruby.rack.RackFilter
  ENOTE_CONTEXT = "/enote/"
rescue
  ENOTE_CONTEXT = "/"
end