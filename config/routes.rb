ActionController::Routing::Routes.draw do |map|
  map.resources :images
  map.root :controller => "images", :action => "new"
  
  map.terms_of_use "terms_of_use", :controller => "pages", :action => "terms_of_use"
  map.privacy_policy "privacy_policy", :controller => "pages", :action => "privacy_policy"
  map.report_bug "report_bug", :controller => "pages", :action => "report_bug"

end