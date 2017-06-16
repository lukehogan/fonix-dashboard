Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  #

  resources :message_stats, only: :index

  get "daily_stats" => "message_stats#daily_stats"
end
