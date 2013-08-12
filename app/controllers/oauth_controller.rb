
require 'net/http'
class OauthController < ApplicationController
  before_filter :current_user, :only => :authorize_application
  before_filter :set_user_and_tenant, :excpet => :authorize_application
  
  def authorize_application
    return redirect_to :controller => "evernote", :action => "index" unless @current_user.evernote_access_token.blank?
    uri = authorization_uri
    response = authorization_call(uri)
    if response.is_a?(Net::HTTPSuccess)
      auth_token = fetch_auth_token(response.body)
      @current_user.update_attributes(:evernote_auth_token => auth_token)
      session[:auth_token] = auth_token
      return redirect_to :action => "request_token"
    else
      return render 'oauth/error', :locals => {:error => "Authorization failed. Please try again later."}
    end
  end

  def callback
    return render 'oauth/error', :locals => {:error => "Oauth verification failed. Please try again later"} unless params['oauth_verifier'] || session['request_token']
    session[:oauth_verifier] = params['oauth_verifier']
    begin
      oauth_object = session[:request_token].get_access_token(:oauth_verifier => session[:oauth_verifier])
      @current_user.update_attributes(:evernote_access_token => oauth_object.token)
      @redirect_url = evernote_url + "evernote/index"
      return render "oauth/authorize"
    rescue => e
      Rails.logger.error "Error :: #{e.message}"
      Rails.logger.error "Backtrace :: #{e.backtrace.join("\n")}"
      return render "oauth/error", :locals => {:error => "Something went wrong. Please try again later."}
    end
  end

  def request_token
    client = evernote_client
    session[:request_token] = client.request_token(:oauth_callback => request.url.chomp("request_token").concat("callback"))
    redirect_to :action => "authorize"
  end

  def authorize
    if session[:request_token]
      @authorize_url = session[:request_token].authorize_url
      return render "oauth/authorize"
    else
      return render "oauth/error", :locals => {:error => "Request token missing."}
    end
  end

  protected
  
  def authorization_call uri
    uri_obj = URI(uri)
    http_obj = Net::HTTP.new(uri_obj.host, uri_obj.port)
    http_obj.use_ssl = true
    http_obj.verify_mode = OpenSSL::SSL::VERIFY_NONE
    response = http_obj.get(uri_obj.request_uri)
    response
  end

  def authorization_uri
    evernote_app_url = @current_tenant.app_configs.find_by_name("evernote_app_url").value
    consumer_key     = @current_tenant.app_configs.find_by_name("consumer_key").value
    consumer_secret  = @current_tenant.app_configs.find_by_name("consumer_secret").value
    uri = "#{evernote_app_url}/oauth?oauth_consumer_key=#{consumer_key}&oauth_signature=#{consumer_secret}&oauth_signature_method=PLAINTEXT&oauth_callback="
    uri += CGI::escape('http://localhost:4000/evernote/callback')
    uri
  end

  def fetch_auth_token response
    return "" if response.blank?
    auth_token = response.split("&").first.split("=").last rescue ""
    auth_token
  end

  def evernote_client
    client = EvernoteOAuth::Client.new(:token => session[:auth_token], :consumer_key => @current_tenant.config_get("consumer_key"), :consumer_secret => @current_tenant.config_get("consumer_secret"), :sandbox => true)
    client
  end

  def set_user_and_tenant
    @current_tenant ||= Tenant.find_by_name("#{session[:tibbr_server_url]}###{session[:tenant_name]}")
    @current_user   ||= User.find_by_tenant_id_and_tibbr_user_id(@current_tenant.id, session[:user_id])
  end
end
