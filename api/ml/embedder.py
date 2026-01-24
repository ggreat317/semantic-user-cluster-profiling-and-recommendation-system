import math
import logging
import hdbscan
import numpy as np
from typing import List, Set, Dict
from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer
from umap_model import load_umap_model
from datetime import datetime, timezone

DECAY_RATE = 0.11
CLUSTER_SIMILARITY_NEEDED = .75

reducer3 = None
reducer5 = None

UMAP3_PATH = "umap3_model.pkl"
UMAP5_PATH = "umap5_model.pkl"

# for server cold start health checks, works in tandem with /health

@asynccontextmanager
async def lifespan(_app: FastAPI):
    global reducer3, reducer5
    reducer3 = load_umap_model(UMAP3_PATH)
    reducer5 = load_umap_model(UMAP5_PATH)
    yield

print("load up embedder env")

app = FastAPI(lifespan=lifespan)
model = SentenceTransformer("all-MiniLM-L6-v2")
logging.basicConfig(level=logging.INFO)

class Cluster(BaseModel):
    label: int
    centroid: List[float] | None = None
    count: int | None = None
    weight: float | None = None
    lastUpdated: datetime | None = None

class Message(BaseModel):
    label: int
    embedding: List[float]
    time: datetime
    weight: float | None = None

class EmbedRequest(BaseModel):
    texts: List[str]
    clusters: List[Cluster] | None = None

class ClusterRequest(BaseModel):
    messages: List[Message]
    takenLabels: Set[int] | None = None

class ReweighRequest(BaseModel):
    messages: List[Message] | None = None
    clusters: List[Cluster] | None = None


# angle similarity between two points
def cosine_similarity(a, b, bIsAlreadyNormalized = False):
    a = np.array(a)
    b = np.array(b)
    if bIsAlreadyNormalized:
        # this is still correct because np.linalg.norm(b) would return 1 since its already normalized
        # calc 3 knowledge dump lol
        return np.dot(a, b)/ (np.linalg.norm(a))
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# generates clusters from message meta data
def computeClusters(messages: List[Message]):
    now = datetime.now(timezone.utc)
    clusters : Dict[int, Cluster] = {}
    for msg in messages:
        ageInDays = (now - msg.time).total_seconds()/86400
        msg.weight = math.exp( -(DECAY_RATE) * ageInDays)
        if msg.label not in clusters:
            clusters[msg.label] = Cluster(
                label = msg.label,
                centroid = np.zeros(len(msg.embedding), dtype=float),
                count = 0,
                weight = 0.0
            )
        cluster = clusters[msg.label]
        cluster.weight += msg.weight
        cluster.centroid += msg.weight * np.array(msg.embedding)
        cluster.count += 1

    # normalizes clusters ( the weight part is to prevent unnecessary magnitude growth, its still the same angle)
    for cluster in clusters.values():
        cluster.centroid = ((cluster.centroid)/(cluster.weight)).tolist()
        norm = np.linalg.norm(cluster.centroid)
        if norm > 0: 
            cluster.centroid = ((cluster.centroid)/(norm)).tolist()
        
        # adds default values
        cluster.lastUpdated = now
    
    # returns clusters
    return [c.model_dump() for c in clusters.values()]

@app.post("/embed")
def getEmbedding(req: EmbedRequest):
    # embeds texts
    embeddings = model.encode(req.texts)

    # umap transforms embeds
    X = np.array(embeddings, dtype=np.float32)

    # pure visualization embedding
    umap3_coords = reducer3.transform(X)

    # low-dimensionality embedding
    umap5_coords = reducer5.transform(X)

    # assigning embeds to pre-existing clusters if applicable
    labels = []
    impactedClusters = {}
    for embed in embeddings:
        # label = -1 signifies that it has no associated cluster
        label = -1
        bestSim = 0.0

        # finds most similar cluster if applicable
        if req.clusters:
            for cluster in req.clusters:
                sim = cosine_similarity(embed, cluster.centroid, True)
                if sim > bestSim:
                    bestSim = sim
                    label = cluster.label

        # if similarity is less than the neccesary then it doesnt apply
        if bestSim > CLUSTER_SIMILARITY_NEEDED:
            # can use a defaultdict, if you want (same use case)
            impactedClusters[label] = impactedClusters.get(label,0) + 1
        else:
            label = -1

        labels.append(label)

    # returning proper json
    return {
        "embeddings" : embeddings.tolist(),
        "umap3": umap3_coords.tolist(),
        "umap5": umap5_coords.tolist(),
        "labels": labels,
        "impactedClusters" : impactedClusters
    }

@app.post("/cluster")
def getLabels(req: ClusterRequest):

    # scans embeddings
    X = np.array([m.embedding for m in req.messages], dtype=np.float32)
    if(len(X) == 1):
        labels = [-1]
    else:
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size = 2,
            metric = 'euclidean'
            )
        labels = clusterer.fit_predict(X).tolist()

    # remaps labels to global unique labels
    taken = set(req.takenLabels) if req.takenLabels else set()
    labelMap = {}
    for label in set(labels):
        if label == -1:
            continue
        newLabel = label
        while newLabel in taken:
            newLabel += 1
        labelMap[label] = newLabel
        taken.add(newLabel)
    
    # aggregates clusters and applies global labels
    messages = []
    globalLabels = []
    for i, msg in enumerate(req.messages):
        currentLabel = labels[i]
        if currentLabel == -1:
            globalLabels.append(-1)
            continue
        globalLabels.append(labelMap[currentLabel])  
        msg.label = labelMap[currentLabel]
        messages.append(msg)

    clusters = computeClusters(messages)
    # returns proper json
    return {
        "clusters" : clusters,
        "globalLabels": globalLabels,
        "takenLabels": list(taken)
    }

@app.post("/reweigh")
def reweighClusters(req: ReweighRequest):
    clusters: list[Cluster] = []

    now = datetime.now()

    # decaying existing clusters
    if req.clusters:
        for cluster in req.clusters:
            if cluster.lastUpdated is None:
                continue
            ageInDays = (now - cluster.lastUpdated).total_seconds()/86400
            cluster.weight *= (math.exp( -(DECAY_RATE) * ageInDays))
            clusters.append(cluster)

    # computing new clusters from messages
    if req.messages:
        newClusters = computeClusters(req.messages)
        clusters.extend(newClusters)
    
    return {
        "clusters" : [c.model_dump() for c in clusters]
    }

# for health checks and making sure the reducer is properly loaded on server starts

@app.get("/health")
def health():
    if (reducer3 is None or reducer5 is None):
        print("Failed Health Check!")
        return {"status": "loading"}, 503
    print("ML is locked and loaded!")
    print("Server is running on port 8000")
    return {"status": "ok"}, 200

"""""
# TLDR: DO NOT USE, IT IS REDUNDANT

# Old UMAP, uncover if decide to only calculate 3D UMAPS per request, little traffic caused by it
# In my opinion, its better to calc. with the initial embed to prevent repeat requests of it
# Repeat requests can be blocked by fetching if already there, but that complicates it

@app.post("/UMAP")
def getUMAP(eArray: EmbeddedArray):
    print("test UMAP")
    X = np.array(eArray.array, dtype=np.float32)
    umap_coords = reducer.transform(X).tolist()
    print("UMAP pass")
    return (umap_coords)
"""
