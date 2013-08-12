module ApplicationHelper
  def generate_shared_url(note_guid, shared_key)
    url = @current_user.note_store_url
    prelim_url = url.gsub("/notestore", "/")
    return prelim_url + "sh/#{note_guid}/#{shared_key}"
  end

  def tenant_guid server_url, tenant_name
    "#{server_url}###{tenant_name}"
  end

  def current_tenant
    @current_tenant ||= Tenant.find_by_name("#{session[:tibbr_server_url]}###{session[:tenant_name]}")
  end

  def tibbr_url
    tenant = @current_tenant || current_tenant
    url = tenant.config_get("server_url")
    return url unless session.has_key?(:ssl)
    if session[:ssl] == "1"
        url.gsub(/^http:\/\//, "https://")
    else
        url.gsub(/^https:\/\//, "http://")
    end
    url = url + "/" unless url.ends_with?("/")
    url
  end

  def tibbr_host
    host = tibbr_url
    host.gsub(/https?:\/\//, "")
  end

  def tibbr_prefix
    current_tenant.config_get("tibbr_prefix")
  end

  def tib_js_url
    url = tibbr_url
    url += "/" unless url.end_with?("/")
    url += "connect/js/TIB.js"
  end

  def evernote_url
    url = tibbr_url
    if url.match(/\/a\/?$/)
       url.gsub(/\/a\/?$/, "/en/")
    elsif url.match(/\/tibbr\/?$/)
       url.gsub(/\/tibbr\/?$/, "/en/")
    else
       request.protocol + request.raw_host_with_port + "/"
    end
  end

  def tibbr_admin_id
    (@current_tenant || current_tenant).config_get("system_admin_id").to_i
  end

  def ie_browser_detection
    result  = request.env['HTTP_USER_AGENT']
    return true if result =~ /MSIE/
    return false
  end

  def ie_browser_version
    result = false
    result = true if request.env["HTTP_USER_AGENT"] =~ /MSIE 8.0/
    result
  end

  def safari_browser_detection
    result  = request.env['HTTP_USER_AGENT']
    return true if result =~ /Safari/
    return false
  end

  def fetch_auth_token response
    return "" if response.blank?
    auth_token = response.split("&").first.split("=").last rescue ""
    auth_token
  end
end
