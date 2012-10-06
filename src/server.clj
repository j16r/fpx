(ns server
  (:use aleph.http
        compojure.core
        lamina.core)
  (:require [compojure.route :as route]
            [slideshow]))

(defn on-create [channel]
  (receive-all channel #(println "message: " %)))

(defn command-handler [response-channel]
  (let [commands (named-channel "commands" on-create)]
    (siphon commands response-channel)
    (siphon response-channel commands)))

(defn main-page [request]
  {:status 200
   :headers {"Content-type" "text/html"}
   :body slideshow/page})

(defn render [response-channel request]
  (if (:websocket request)
    (command-handler response-channel)
    (enqueue response-channel (main-page request))))

(defroutes app-routes
  (GET ["/"] {} (wrap-aleph-handler render))
  (route/resources "/")
  (route/not-found "Page not found"))

(defn -main [& args]
  (let [port (-> (first args) (or 8080) (Integer.))]
    (start-http-server (wrap-ring-handler app-routes)
                       {:host "localhost"
                        :port port
                        :websocket true})))
