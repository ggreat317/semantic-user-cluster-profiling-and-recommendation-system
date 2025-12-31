import logging
import hdbscan
import numpy as np
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from umap_model import load_umap_model


print("load up embedder env")


reducer = load_umap_model()

app = FastAPI()
model = SentenceTransformer("all-MiniLM-L6-v2")
logging.basicConfig(level=logging.INFO)


class Message(BaseModel):
    text: str

# Code snippet below is an api for embedding a single message

@app.post("/embed")
def get_embedding(msg: Message):
    logging.info("embedding message")
    embedding = model.encode(msg.text).tolist()
    return (embedding)


# On every cold start, edit of the code here, the reducer may have to be loaded
# and fitted again causing long latency, but every other request is quick.

# Code snippet below is an api for mapping an array of embeddings on a UMAP
# and returning the coordinates of each in an array, likely message embeddings 
# in our case.

class EmbeddedArray(BaseModel):
    array: List[List[float]]

@app.post("/UMAP")
def get_umap(eArray: EmbeddedArray):
    print("test UMAP")
    X = np.array(eArray.array, dtype=np.float32)
    umap_coords = reducer.transform(X).tolist()
    print("UMAP pass")
    return (umap_coords)

@app.post("/labels")
def get_labels(eArray: EmbeddedArray):
    print("test scan")
    X = np.array(eArray.array, dtype=np.float32)
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size = 2,
        metric = 'euclidean'
        )
    print("scan boot up")
    labels = clusterer.fit_predict(X).tolist()
    print("scan pass")
    return (labels)
"""
class EmbeddedLabels(BaseModel):
    array: List[List[float], string]

@app.post("/cluster")
def get_clusters(eArray : EmbeddedLabels):
    ret
"""    


