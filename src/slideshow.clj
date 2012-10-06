(ns slideshow
  (:use hiccup.core hiccup.page))

(def page
  (html5
    [:head
      [:meta {:charset "utf-8"}]
      [:meta {:http-equiv "X-UA-Compatible" :content "IE=edge,chrome=1"}]
      [:meta {:name "viewport" :content "width=device-width, initial-scale=1, maximum-scale=1"}]
      (include-js "//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery.min.js")
      (include-js "//cachedcommons.org/cache/jquery-bbq/1.2.1/javascripts/jquery-bbq.js")
      (include-js "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.1/underscore-min.js")
      (include-js "//cdnjs.cloudflare.com/ajax/libs/processing.js/1.3.6/processing-api.min.js")
      (include-js "/javascript/web_socket.js")
      (include-js "/javascript/slides.js")
      (include-css "http://openfontlibrary.org/face/douar-outline")
      (include-css "http://fonts.googleapis.com/css?family=Quicksand")
      [:title "fp(x)"]]
   [:body
     {:style "margin: 0; padding: 0; border: 0; overflow: hidden; width: 100%; height: 100%;"}
     [:canvas]]))
