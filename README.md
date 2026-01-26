# machine-learning-chat-application
A chat application with front end, back end, and ML properties. 

Meant to create user profiles based on clustered message embeddings and promote user interaction with the most similar users.

Fourth Week of January 2026 Updates

Already completed:
- most of frontend
- embedding messages, labelling clusters, and presenting 3d profile maps
- data wiring to mongo and firebase
- deploying dockerized local and hosting frontend on public firebase 
- centroid aggregation and fun cluster maintenance
- aws lighthouse backend API hosting

Currently working on:
- user to user matching via FAISS
- and a few other nuances

Planning to work on:
- vectorized or hot c functions
- making umap more accurate < --- needs more user messages to train on for visual
- model for user interactions < --- needs more user interactions to train on
- theme change and custom background stickers

The old frontend is under another repo titled "murmur"

To run the latest push locally:
 - get your own mongo URI and firebase server SDK
 - change the frontend api url in /frontend/src/app/components/main/api/token to "http://localhost:5000" 
 - change port stuff at bottom of /api/backend/index.js
 - run "docker compose up --build" in api folder
 - wait for two locked and loaded messages, the ML takes about a minute to load up ( 2 UMAPS )
 - run "npm run dev" in frontend folder
 - go to "localhost:3000" (or whatever port npm run dev finds available)

To use the latest push online:
 - go to "https://murmurs.web.app"
 - tell your friends, and their friends/family, to join you
 - be sure to spread the word, so I can getter better data to work with!

Test it out and message me on how should upgrade it.