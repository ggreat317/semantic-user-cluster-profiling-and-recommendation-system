# Semantic User Cluster Profiling and Recommendation System https://murmurs.web.app

# Description
Most Simple. An Overly Optimized Way to Find People to Talk To Online.

Pretty Simple. An online chat application with front end, back end, and ML properties that consitently presents you people who talk about the same things.

Kind Of Simple. An application that creates evolving user cluster profiles based on clustered message embeddings and promotes user interaction with similar cluster profiles.

Little Less Simple. A user profiling and recommendation system based on batch ingested embeddings, time-decayed evolving clusters, aggregated cluster profiles, low-dimensionality projections, "de-embbeded" centroids, and cluster-to-cluster similarity, integrated though a fully deployed user messaging application, backed by authentication and utilizes three databases (historic, fan-out, and "update"), in order to promote user interaction with people whose cluster profiles most resemble eachothers, e.g. they talk about the same stuff.

Even Less Simple. Email me and I can break down how everything works and why it works that way ( ggreat317@gmail.com ).

Least Simple. Read through all code, research all buzzwords used in this read me, and research all libraries used, then email me ( listed above ).

# First Week of Feburary 2026 Updates

Already completed:
- many bug fixes
- most of react frontend hosted on firebase
- pipelined embeddings, cluster creation, and low dimensionality proj.
- data wiring/schemas in mongo, firebase firestore, and firebase RTDB
- deploying dockerized central expressjs api's and ml pipelines on fast api and hosting frontend on public firebase 
- time-decayed centroid aggregation (like weighing the importance of clusters), cluster maintenance (since clusters evolve), and "ramp up" batch ingestion pipelines 
- aws lighthouse provided server to host backend n API's and https via Route 53 and nginx for remote usage
- cluster to cluster similarity via FAISS (basically regaular similarity loop, but they filter out the ones that have no chance) and cluster scoring aggregation
- "reversing" embedding cluster centroids for genre names, sim scores, flagging clusters for better UI abstraction, this replaces the basic cluster names ({Cluster 0, Cluster 1, ...., Cluster n})
- some other stuff I likely forgot

Currently working on (prioritized and will likely be done by 2/14, I add things as I finish them):
- finding foundational bugs
- normalizing user cluster time-weights
- getting more user messages in messageVault for better low-dimensional proj.

Planning to work on (not prioritized but wanted done by 3/1):
- mult-line messages/inputs and better UI
- vectorized or hot c functions (optimizes python scripts)
- custom background stickers (allows for cool looking setups)
- theme change (thinking of changing the entire theme, but i like the potential of a default environment, for customizing it to your liking)
- ci/cd pipeline (currently manually going into server and pushing updates since its in prod mode and not dev mode, so its easier)
- finding more bugs (the eternal strive to removing weaknesses)
- adding cool stuff (the eternal strive to implement strengths)

Hope To Work On:
- model for user interactions < --- needs user interactions to train on

# Remote Usage
To use the latest push online:
 - go to "https://murmurs.web.app"
 - tell your friends, and their friends/family, to join you
 - be sure to spread the word, so I can getter better data to work with!
 - maybe dont do the two things above just yet, give it a month or two

# Local Usage
 To run the latest push locally:
 - clone the repo
 - get your own mongo URI and firebase server SDK
 - change the frontend api url in /frontend/src/app/components/main/api/token to "http://localhost:5000" 
 - change port stuff at bottom of /api/backend/index.js
 - run "docker compose up --build" in /api directory
 - wait for two locked and loaded messages, the ML takes about a minute to load up
 - run "npm run dev" in /frontend directory
 - go to "localhost:3000" (or whatever port npm run dev finds available)
- email me if any difficulties ggreat317@gmail.com

# Author Note
Test it out and tell me how to improve it.
The old frontend is under another repo titled "murmur", if you want to see progress. (Its not much since most the progress has been backend, so it only lacks the most important features)
Usually busy with other stuff, you could probably tell from how frequent this is updated (started in July 2025 for reference), but this is a project I like working on in my free time.
Again, email me for more information: ggreat317@gmail.com .
