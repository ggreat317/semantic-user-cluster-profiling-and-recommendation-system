# machine-learning-chat-application
A chat application with front end, back end, and ML properties. 

Meant to create user profiles based on clustered message embeddings and promote user interaction with the most similar users.

Fourth Week of January 2026 Updates

Already completed:
- most of frontend
- embedding messages, creating clusters, and presenting 3d profile maps
- data wiring and schemas in mongo and firebase
- deploying dockerized local and hosting frontend on public firebase 
- centroid aggregation and fun cluster maintenance
- aws lighthouse backend API hosting and https

Currently working on (from most to least focused):
- finding bugs
- user to user matching via FAISS
- making umap more accurate < --- would like more user chat messages (not from me) to train on for purely visual aspects
- using a dataset of genres for reverse embedding cluster centroids (would replace default {Cluster 0, Cluster 1, ... , Cluster n} names and likely lead to improved FAISS implementation)
- few other nuances

Planning to work on:
- vectorized or hot c functions
- theme change and custom background stickers
- model for user interactions < --- needs more user interactions to train on

The old frontend is under another repo titled "murmur"

To run the latest push locally:
 - get your own mongo URI and firebase server SDK
 - change the frontend api url in /frontend/src/app/components/main/api/token to "http://localhost:5000" 
 - change port stuff at bottom of /api/backend/index.js
 - run "docker compose up --build" in /api directory
 - wait for two locked and loaded messages, the ML takes about a minute to load up ( 2 UMAPS )
 - run "npm run dev" in /frontend directory
 - go to "localhost:3000" (or whatever port npm run dev finds available)

To use the latest push online:
 - go to "https://murmurs.web.app"
 - tell your friends, and their friends/family, to join you
 - be sure to spread the word, so I can getter better data to work with!
 - maybe dont do the two things above just yet, give it a month or two

Test it out and tell me how to improve