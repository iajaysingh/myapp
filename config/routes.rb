Evernote::Application.routes.draw do
  resources :oauth do
    collection do
      get :authorize_application
      get :callback
      get :request_token
      get :authorize
    end
  end

  resources :evernote do
    collection do
      get :notes
      get :notebooks
      get :index
    end
  end
end
