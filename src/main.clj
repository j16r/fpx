(ns main
  (:use aleph.http
        compojure.core)
  (:require [compojure.route :as route]))

(defroutes app-routes
  (route/files "/" {:root (str (System/getProperty "user.dir") "/resources")})
  (route/resources "/")
  (route/not-found "Page not found"))

(defn -main [& args]
  (start-http-server (wrap-ring-handler app-routes)
                     {:host "localhost"
                      :port 8080
                      :websocket true}))
