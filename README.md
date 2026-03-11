# Semantic User Profiling and Recommendation System 

# Try It Yourself: https://murmurs.web.app
# TLDR: Bunch of vector math on embeddings and am currently working on a bunch of new cool features and don't have a need to push here, however there has been numerous updates to the live site as of March 11th
# Description
Most Simple. An Overly Optimized Way to Find People to Talk To Online.

Pretty Simple. An online chat application with front end, back end, and ML properties that consitently presents you with the most similar people who talk about the same stuff as you and the same way as you.

Kind Of Simple. An application that creates evolving user cluster profiles based on batch ingested message embeddings then promotes user interaction with similar users.

Little Less Simple. A user profiling and recommendation system that can capture theoretically infinite virtual personas, comprised of unique cluster profiles, to be made and matched based on batch ingested embeddings, time-decayed evolving clusters, aggregated cluster profiles, low-dimensionality projections, "de-embbeded" centroids, and cluster-to-cluster similarity, and integrated though a fully deployed user messaging application, backed by authentication and utilizes three databases (historic, fan-out, and "update"), in order to promote user interaction with people whose cluster profiles most resemble eachothers, e.g. they talk about similar stuff and talk in similar ways.

Even Less Simple. Email me and I can break down how everything works and why it works that way ( ggreat317@gmail.com ).

Least Simple. Read through all code, research all buzzwords used in this read me, and research all libraries used, then email me ( listed above :P ).

# First Week of Feburary 2026 Updates

Already completed (not in chronological order):
- many bug fixes
- most of react frontend hosted on firebase and mobile capability
- pipelined embeddings, cluster creation, low dimensionality proj., and "translated" topic labels/sims
- data wiring/schemas in mongo, firebase firestore, and firebase RTDB
- deploying dockerized central expressjs api's and ml pipelines on fast api and hosting frontend on public firebase 
- time-decayed centroid aggregation (like weighing the importance of clusters), cluster maintenance (since clusters evolve), and "ramp up" batch ingestion pipelines 
- aws lighthouse provided server to host backend n API's and https via Route 53 and nginx for remote usage
- cluster to cluster similarity via FAISS (basically regaular similarity loop, but they filter out the ones that have no chance) and cluster scoring aggregation
- "reversing" embedding cluster centroids for genre names, sim scores, flagging clusters for better UI abstraction, this replaces the basic cluster names ({Cluster 0, Cluster 1, ...., Cluster n}) (optimized this quite a bit lol)
- some other stuff I likely forgot

Currently working on (prioritized and will likely be done by 2/14. I remove things as I finish them or add things if multiple steps are needed):
- making cluster-cluster comparison less naive
- changing umap to pca

Planning to work on (not prioritized but wanted done by 3/1):
- vectorized or hot c functions (optimizes python scripts)
- custom background stickers (allows for cool looking setups)
- theme change (thinking of changing the entire theme, but i like the potential of a default environment, for customizing it to your liking)
- ci/cd pipeline (currently manually going into server and pushing updates since its in prod mode and not dev mode, so its easier)
- finding more bugs (the eternal strive to removing weaknesses)
- adding cool stuff (the eternal strive to implement strengths)

Hope To Work On:
- model for user-user interactions < --- needs user interactions for train

# Remote Usage
To use the latest push online:
 - go to "https://murmurs.web.app"
 - tell your friends, and their friends/family, to join you
 - be sure to spread the word, so I can getter better data to work with!
 - maybe dont do the two things above just yet, give it a month or two

# Author Note
Test it out and tell me how to improve it.
The old frontend is under another repo titled "murmur", if you want to see progress. (Its not much since most the progress has been backend, so it only lacks the most important features)
Usually busy with other stuff, you could probably tell from how frequent this is updated (started in July 2025 for reference), but this is a project I like working on in my free time.
Again, email me for more information: ggreat317@gmail.com .
