(ns main
  (:use aleph.http
        compojure.core)
  (:require [compojure.route :as route]))

(defroutes app-routes
  (route/files "/" {:root (str (System/getProperty "user.dir") "/resources")})
  (route/resources "/")
  (route/not-found "Page not found"))

(defn -main [& args]
  (let [port (-> (first args) (or 8080) (Integer.))]
    (start-http-server (wrap-ring-handler app-routes)
                       {:host "localhost"
                        :port port
                        :websocket true})))
