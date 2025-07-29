from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

client = QdrantClient(host="localhost", port=6333)

def init_collections():
    for name in ["orders", "products"]:
        client.recreate_collection(
            collection_name=name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )

if __name__ == "__main__":
    init_collections()
