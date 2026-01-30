import { db } from "../db.js";
import admin from "../middleware/firebaseAdmin.js"

// puts message in mongo for historic
export async function MongoDBUploadMessage(req, messageID, now){
  // attempts to post to mongo
  await db.collection("messages").insertOne({
    _id: messageID,
    ...req.body,
    time: now,
    ownerID: req.user.uid,
    processedForEmbed: false,
    processedForCluster: false
  });

  await db.collection("messageVault").insertOne({
    _id: messageID,
    text: req.body.text,
  });
  
  await db.collection("rooms").updateOne(
    { _id: req.body.room },
    { $set: { lastAccessed: now } }
  );
  console.log("Successfully posted to MongoDB");
}

// puts message in firebase for easy frontend fanout
export async function FirebaseUploadMessage(req, messageID, now){
  // attempting to post to firebase
  await admin.firestore().collection("rooms").doc(req.body.room).collection("messages").doc(`${messageID}`).set({
    ...req.body,
    time: admin.firestore.FieldValue.serverTimestamp(),
    ownerID: req.user.uid
  });

  await admin.firestore().collection("roomVault").doc(req.body.room).set({
    lastAccessed: now
  }, { merge: true })
  console.log("Successfully posted to Firebase");
}

// batches embeddings
export async function embeddingBatch(req, MESSAGE_BATCH_SIZE, EMBEDDED_BATCH_SIZE, now, messagesSinceLastEmbedBatch){

  // checks if enough messages to batch
  
  if(messagesSinceLastEmbedBatch < MESSAGE_BATCH_SIZE && messagesSinceLastEmbedBatch < EMBEDDED_BATCH_SIZE){
    console.log("Not Enough Messages to Batch");
    return { status: "skipped", reason: "batch did not fill" };
  }

  // attempting to batch messages

  const messageBatch = await db.collection("messages").find({
    ownerID: req.user.uid,
    processedForEmbed: false
  }).limit(MESSAGE_BATCH_SIZE).toArray();

  const texts = messageBatch.map(msg => msg.text);

  console.log("Successfully batched messages");

  console.log("Attempting to post embeddings to MongoDB");

  // grabs current clusters to see if any new messages belong in a cluster

  const userClusters = await db.collection("clusters").find(
    { ownerID: req.user.uid },
  ).toArray();

  const embedResponse = await fetch("http://ml:8000/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, clusters: userClusters })
  });
  const embedData = await embedResponse.json();

  // checks if they recieved feedback for every embedding
  // this test should never fail
  if(
    embedData.embeddings.length !== messageBatch.length ||
    embedData.labels.length !== messageBatch.length
  ){
    throw new Error("embeddings return mismatch");
  }

  // properly updates the mongo with the new message metadata
  const messageBatchUpdate = messageBatch.map((msg, i) => ({
    updateOne: {
      filter: { _id: msg._id },
      update: {
        $set: {
          processedForEmbed: true,
          processedForCluster: embedData.labels[i] !== -1,
          "embedding" : embedData.embeddings[i],
          "umap3": embedData.umap3[i],
          "umap5": embedData.umap5[i],
          "label": embedData.labels[i]
        }
      }
    }
  }));
  await db.collection("messages").bulkWrite(messageBatchUpdate);

  console.log("Successfully posted embeddings to MongoDB");

  console.log("Attempting to Reflect Embedding on User")

  await db.collection("users").updateOne(
    { uid: req.user.uid},
    { $set: { messagesSinceLastEmbedBatch: 0 } }
  )

  console.log("Successfully Reflected Embedding on User")

  console.log("Attempting to mark impacted clusters")

  // checks if any clusters got impacted by new messages
  if (!embedData.impactedClusters || Object.keys(embedData.impactedClusters).length === 0){
    console.log("No Clusters to Mark Impacted!")
    return { status: "skipped", reason: "no impacted clusters" };
  }

  // tells the clusters that theyve been impacted and by how much
  const impactedClusters = embedData.impactedClusters

  const impactedClusterSetUpdate = Object.entries(impactedClusters).map(([label,value]) => ({
    updateOne: {
      filter: { ownerID: req.user.uid, label: Number(label) },
      update: {
        $inc: { updatesPending: value || 0}
      }
    }
  }));
  await db.collection("clusters").bulkWrite(impactedClusterSetUpdate);

  console.log("Successfully updated impacted clusters in MongoDB");
  
  updateImpacted(req, EMBEDDED_BATCH_SIZE, now)

  return { status: "complete", reason: "all updates successful" };
}

// runs maintenance
export async function maintenance(req, takenLabels, messagesSinceLastLabelBatch, EMBEDDED_BATCH_SIZE, now, EMEDDING_MULTIPLIER, LABEL_BATCH_MAX_SIZE ){

  console.log("Attempting Regular Maintenance");
  await profileMatch(req);
  
  if( messagesSinceLastLabelBatch < EMBEDDED_BATCH_SIZE ){
    console.log("Not Enough Messages For Maintenance");
    return { status: "skipped", reason: "no clusters to reweigh" };
  }

  await clusterUpdate(req, EMBEDDED_BATCH_SIZE);
  await clusterMake(req, takenLabels, EMBEDDED_BATCH_SIZE, now, EMEDDING_MULTIPLIER, LABEL_BATCH_MAX_SIZE );
  await cleanup(req, LABEL_BATCH_MAX_SIZE, now, EMBEDDED_BATCH_SIZE);

  console.log("Maintenance Performed Successfully")

  console.log("Attempting to Reflect Maintenance on User")

  await db.collection("users").updateOne(
    { uid: req.user.uid},
    { $set: { messagesSinceLastLabelBatch: 0 } }
  )

  console.log("Successfully Reflected Maintenance on User")
}

// processes updates on current clusters
async function clusterUpdate(req, EMBEDDED_BATCH_SIZE){
  console.log("Attempting to fetch clusters");

  const staleClusters = await db.collection("clusters").find(
    { ownerID: req.user.uid, triggered: false, updatesPending: { $eq: 0 }},
  ).toArray()

  const slowClusters = await db.collection("clusters").find(
    { ownerID: req.user.uid, triggered: false, updatesPending: { $gt: 0 }},
    { projection: { label: 1 } }
  ).toArray()

  console.log("Successfully fetched clusters")
  
  console.log("Attempting to handle active clusters")

  await db.collection("clusters").updateMany(
    { ownerID: req.user.uid, triggered: true },
    { $set: { updatesPending: 0, triggered: false } }
  );

  console.log("Successfully handled active clusters")

  console.log("Attempting to reweigh slow and stale clusters")

  if(staleClusters.length === 0 && slowClusters.length === 0){
    console.log("No Clusters to Reweigh!")
    return { status: "skipped", reason: "no clusters to reweigh" };
  }

  const slowClusterLabels = slowClusters.map(c => c.label)
  const messagesByLabel = await db.collection("messages").aggregate([
    { $match : {ownerID : req.user.uid, label: { $in: slowClusterLabels }}},
    { $sort: { time: -1 }},
    { $group: { _id: "$label", messages: { $push: "$$ROOT" } } },
    { $project: { messages: { $slice: ["$messages", (EMBEDDED_BATCH_SIZE/2)] } } }
  ]).toArray()

  const messages = messagesByLabel ? messagesByLabel.flatMap(c => c.messages) : []

  const reweighResponse = await fetch("http://ml:8000/reweigh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, clusters: staleClusters }),
  });
  const reweighedData = await reweighResponse.json()

  const reweighBatchUpdate = reweighedData.clusters.map((cluster) => ({
    updateOne: {
      filter: { ownerID: req.user.uid, label: Number(cluster.label) },
      update: {
        $set: {
          centroid: cluster.centroid,
          count: cluster.count,
          weight: cluster.weight,
          lastUpdated: cluster.lastUpdated,
          updatesPending: 0,
          triggered: false
        }
      }
    }
  }));

  await db.collection("clusters").bulkWrite(reweighBatchUpdate);

  console.log("Successfully reweighed slow and stale clusters")
}

// makes clusters based on unprocessed unclustered embedded "new" messages 
async function clusterMake(req, takenLabels, EMBEDDED_BATCH_SIZE, now, EMEDDING_MULTIPLIER, LABEL_BATCH_MAX_SIZE){
  console.log("Attempting to batch messages");

  let embeddedBatch;

  // if no clusters then it looks at past messages in addition to new messages
  if (!takenLabels || takenLabels.length === 0){
    embeddedBatch = await db.collection("messages").find({
      ownerID: req.user.uid,
      processedForEmbed: true,
      label: -1
    }).sort({ time: -1}).limit(LABEL_BATCH_MAX_SIZE).toArray();
  } else {
    embeddedBatch = await db.collection("messages").find({
      ownerID: req.user.uid,
      processedForEmbed: true,
      processedForCluster: { $ne: true }
    }).sort({ time: -1}).limit(LABEL_BATCH_MAX_SIZE).toArray();
  }

  if (embeddedBatch.length < EMBEDDED_BATCH_SIZE){
    console.log("Not Enough Messages to Batch!");
    return { status: "skipped", reason: "not enough embeddings to batch" };
  }
  console.log("Successfully batched messages");

  console.log("Attempting to make new clusters");

  const clusterResponse = await fetch("http://ml:8000/cluster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: embeddedBatch, takenLabels }),
  });
  const clusterData = await clusterResponse.json();

  console.log("Attempting to post labels to MongoDB");

  await db.collection("users").updateOne(
    { uid: req.user.uid },
    { $set: { takenLabels: clusterData.takenLabels } }
  )

  const ClusterBatchUpdate = embeddedBatch.map((msg, i) => ({
    updateOne: {
      filter: { _id: msg._id },
      update: {
        $set: {
          processedForCluster: true,
          "label" : clusterData.globalLabels[i]
        }
      }
    }
  }));

  await db.collection("messages").bulkWrite(ClusterBatchUpdate);

  console.log("Successfully posted labels to MongoDB");

  console.log("Attempting to post clusters to MongoDB");

  if (clusterData.clusters && clusterData.clusters.length > 0){

    const newClusterUpdate = clusterData.clusters.map(cluster =>({
      insertOne: {
        document: {
          ownerID: req.user.uid,
          label: cluster.label,
          centroid: cluster.centroid,
          count: cluster.count,
          weight: cluster.weight,
          lastUpdated: now,
          updatesPending: 0,
          triggered: false
        }
      }
    }));

    await db.collection("clusters").bulkWrite(newClusterUpdate);

    console.log("Successfully posted clusters to MongoDB");
  }else{
    console.log("No new Clusters to post to MongoDB");
  }

  console.log("Attempting to update user batch max");

  if ( EMBEDDED_BATCH_SIZE < LABEL_BATCH_MAX_SIZE ){
    await db.collection("users").updateOne(
      {uid: req.user.uid},
      {$set: {embeddedBatchLimit : EMBEDDED_BATCH_SIZE * EMEDDING_MULTIPLIER}}
    );
  }

  console.log("Successfully reflected user batch max");
}

// grabs old processed unclustered embedded messages "old" and assigns them to clusters
async function cleanup(req, LABEL_BATCH_SIZE, now, EMBEDDED_BATCH_SIZE){
  console.log("Attempting Cleanup");

  const timeCutOff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const oldMessages = await db.collection("messages").find(
    { ownerID: req.user.uid, processedForCluster: true, label: -1, time: { $gte: timeCutOff} }
  ).sort({ time: -1}).limit(LABEL_BATCH_SIZE).toArray()

  if(!oldMessages || oldMessages.length === 0){
    console.log("Skipped Clean Up : no old messages")
    return;
  }

  const userClusters = await db.collection("clusters").find(
    { ownerID: req.user.uid }
  ).toArray()

  if(!userClusters || userClusters.length === 0){
    console.log("Skipped Clean Up : no clusters")
    return;
  }

  const cleanUpResponse = await fetch("http://ml:8000/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: oldMessages, clusters: userClusters})
  })
  const cleanUpData = await cleanUpResponse.json()

  if (!cleanUpData.impactedClusters || Object.keys(cleanUpData.impactedClusters).length === 0){
    console.log("Clean Up Had No Clusters to Mark Impacted!")
    return { status: "skipped", reason: "no impacted clusters" };
  }

  const impactedClusters = cleanUpData.impactedClusters

  const impactedClusterSetUpdate = Object.entries(impactedClusters).map(([label,value]) => ({
    updateOne: {
      filter: { ownerID: req.user.uid, label: Number(label) },
      update: {
        $inc: { updatesPending: value || 0}
      }
    }
  }));
  await db.collection("clusters").bulkWrite(impactedClusterSetUpdate);

  const cleanUpLabelBatchUpdate = oldMessages.map((msg, i) => ({
    updateOne: {
      filter: { _id: msg._id },
      update: {
        $set: {
          "label" : cleanUpData.labels[i]
        }
      }
    }
  }));

  await db.collection("messages").bulkWrite(cleanUpLabelBatchUpdate);

  updateImpacted(req, EMBEDDED_BATCH_SIZE, now);

  console.log("Successfully Cleaned up");
}

async function updateImpacted(req, EMBEDDED_BATCH_SIZE, now){
  console.log("Attempting to update impacted clusters");
  // checks if a cluster has enough impactes to be sucessfully reweighed
  const clustersNeedingUpdates = await db.collection("clusters").find(
    { ownerID: req.user.uid, updatesPending: { $gte: EMBEDDED_BATCH_SIZE/5 } },
    { projection: { label: 1 } }
  ).toArray();
  
  if (clustersNeedingUpdates.length === 0){
    console.log("No Impacted Clusters to Update");
    return { status: "skipped", reason: "no clusters needing updates" };
  }

  const clusterInNeedLabels = clustersNeedingUpdates.map(c => c.label);
  // grabs recent messages belonging to that cluster
  const messagesByLabel =  await db.collection("messages").aggregate([
    { $match: { ownerID: req.user.uid, label: { $in: clusterInNeedLabels } } },
    { $sort: { time: -1 }},
    { $group: { _id: "$label", messages: { $push: "$$ROOT" } } },
    { $project: { messages: { $slice: ["$messages", (EMBEDDED_BATCH_SIZE)] } } }
  ]).toArray();

  const messages = messagesByLabel.flatMap(c => c.messages);

  const clusterResponse = await fetch("http://ml:8000/reweigh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  const clusterData = await clusterResponse.json();
  
  const clusterBatchUpdate = clusterData.clusters.map((cluster) => ({
    updateOne: {
      filter: { ownerID: req.user.uid, label: Number(cluster.label) },
      update: {
        $set: {
          centroid: cluster.centroid,
          count: cluster.count,
          weight: cluster.weight,
          lastUpdated: now,
          updatesPending: 0,
          triggered: true
        }
      }
    }
  }));
  await db.collection("clusters").bulkWrite(clusterBatchUpdate);

  console.log("Successfully updated impacted clusters");
}

async function profileMatch(req){
  console.log("Attempting to find best match");

  const userClusters = await db.collection("clusters").find({ ownerID: req.user.uid }).toArray();
  const compareClusters = await db.collection("clusters").find({ ownerID: { $ne : req.user.uid } }).toArray();

  if(!userClusters || userClusters.length === 0){
    console.log("Skipped Matching: no user clusters")
    return;
  }

  if(!compareClusters || compareClusters.length === 0){
    console.log("Skipped Matching : no comparable clusters")
    return;
  }

  const profileResponse = await fetch("http://ml:8000/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userClusters, compare: compareClusters }),
  });
  const profileData = await profileResponse.json();

  console.log(profileData.bestMatch)

  await db.collection("users").updateOne(
    { uid : req.user.uid },
    { $set: { bestMatch : profileData.bestMatch } }
  )

  console.log("Found the best match");
}
