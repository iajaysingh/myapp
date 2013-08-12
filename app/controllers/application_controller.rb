require 'pp'

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery
  include ApplicationHelper
  layout 'application'

  def tenant_in_use
    @current_tenant ||= Tenant.find_by_name("#{session[:tibbr_server_url]}###{session[:tenant_name]}")
  end

  def render_payload payload, options = {}
    render_options = {}
    if (status  = options.delete(:status))
      render_options[:status] = status
    end
    if (location  = options.delete(:location))
      render_options[:location] = location
    end
    method_prefix = (options.delete(:method) || "to")
    respond_to do |format|
      format.xml  { render({:xml  =>  payload.send("#{method_prefix}_xml",  options)}.merge(render_options))}
      format.json { render({:json =>  payload.send("#{method_prefix}_json", options)}.merge(render_options))}
      format.rss  { render :layout => false }
    end
  end

  def render_okay options={}
    render_head(:ok, options)
  end

  def render_head code, options={}
    respond_to do |format|
      format.xml  { head code }
      format.json {render :status => code, :text=>""}
    end
  end

  def render_json_payload payload, options ={}
    method_prefix = (options.delete(:method) || "to")
    respond_to do |format|
      format.json { render({:json =>  payload.send("#{method_prefix}_json", options)})}
    end
  end

  def render_error message, status = :unprocessable_entity, options = {}
    render_payload app_error(message), options.merge(:root => :errors, :status => status, :method => "to")
  end

  def render_500(e)
    render_error(e.message, :internal_server_error)
  end

  def render_409(message)
    render_error(message, :conflict)
  end

  def render_404(e)
    render_error(e.message, :not_found)
  end

  def app_error message
    {:error => (message||"")}
  end

  def logged_in_user
    @current_user ||= User.find_by_tenant_id_and_tibbr_user_id(session[:tenant_id], session[:user_id])
  end

  def current_user
    session[:tibbr_server_url] = params[:tibbr_server_url] unless params[:tibbr_server_url].blank?
    session[:client_id]        = params[:client_id]        unless params[:client_id].blank?
    session[:tenant_name]      = params[:tenant_name]      unless params[:tenant_name].blank?
    session[:user_id]          = params[:user_id]          unless params[:user_id].blank?
    session[:ssl]              = params[:ssl]              unless params[:ssl].blank?
    @current_tenant = Tenant.find_by_name(tenant_guid(session[:tibbr_server_url], session[:tenant_name]))
    session[:tenant_id]        = @current_tenant.id
    if params[:access_token]
      @current_user = User.find_by_tenant_id_and_tibbr_user_id(@current_tenant.id, params[:user_id])
      if @current_user.blank?
        @current_user = User.new(:tibbr_user_id     => params[:user_id],
                                 :tenant_id         => @current_tenant.id,
                                 :access_token      => params[:access_token],
                                 :display_name      => params[:display_name],
                                 :profile_image_url => params[:profile_image_url],
                                 :locale            => params[:locale],
                                 :time_zone         => CGI.unescape(params[:time_zone]),
                                 :login             => params[:login]
                                )
        @current_user.save
      else
        @current_user.update_attributes(
                                        {
                                          :access_token      => params[:access_token],
                                          :display_name      => params[:display_name],
                                          :profile_image_url => params[:profile_image_url],
                                          :locale            => params[:locale],
                                          :time_zone         => CGI.unescape(params[:time_zone])
                                        }
                                      )
      end
      raise "User not found" and return false unless @current_user
    else
      @current_user = User.find_by_tenant_id_and_tibbr_user_id(@current_tenant.id, session[:user_id])
    end
    set_locale
    @current_user
  end
  
  protected
  def set_locale
    I18n.locale = @current_user.locale ||  browser_locale
  end

  def browser_locale
    browser_locale_string.present? ? browser_locale_string.scan(/^[a-zA-Z]{2}\-[a-zA-Z]{2}|^[a-zA-Z]{2}/).first.gsub(/\-[a-z]{2}/){|s| s.upcase}.to_sym : nil
  end

  def browser_locale_string
    request.headers['HTTP_ACCEPT_LANGUAGE']   # There was a problem to read browser locale if user has no locale. It was taking default_locale set in default_app_config.yml . It is case sensitive, so it is referred as 'HTTP_ACCEPT_LANGUAGE' in headers in tibbr_resource.rb for webclient.
  end

end
