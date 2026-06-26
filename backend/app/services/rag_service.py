import fitz
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

# Initialize ChromaDB client (local persistent)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_or_create_collection(name="pdf_documents")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts all text from a PDF file."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text

async def add_pdf_to_vector_db(file_bytes: bytes, user_id: int, session_id: str):
    """Extracts text from PDF, chunks it, and adds it to ChromaDB."""
    text = extract_text_from_pdf(file_bytes)
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(text)
    
    if not chunks:
        return
        
    documents = []
    metadatas = []
    ids = []
    
    for i, chunk in enumerate(chunks):
        documents.append(chunk)
        metadatas.append({"user_id": user_id, "session_id": session_id})
        ids.append(f"{user_id}_{session_id}_{i}")
        
    # Add chunks to collection
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

async def query_vector_db(query: str, user_id: int, session_id: str, n_results: int = 4) -> str:
    """Queries ChromaDB for relevant chunks based on a query, user_id, and session_id."""
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where={"$and": [{"user_id": user_id}, {"session_id": session_id}]}
    )
    
    if not results['documents'] or not results['documents'][0]:
        return ""
        
    # Join the retrieved chunks into a single string to use as context
    context_chunks = results['documents'][0]
    return "\n\n".join(context_chunks)

async def get_all_pdf_documents(user_id: int, session_id: str, max_chars: int = 30000) -> str:
    """Retrieves all chunks for a session from ChromaDB without semantic query/embeddings."""
    results = collection.get(
        where={"$and": [{"user_id": user_id}, {"session_id": session_id}]}
    )
    documents = results.get("documents", [])
    if not documents:
        return ""
    
    # Sort chunks by their id if they contain index, since IDs are user_id_session_id_i
    def get_chunk_index(doc_id):
        try:
            return int(doc_id.split("_")[-1])
        except Exception:
            return 0
            
    # Zip IDs and documents, sort by ID index, then extract documents
    zipped = list(zip(results.get("ids", []), documents))
    zipped.sort(key=lambda x: get_chunk_index(x[0]))
    
    sorted_docs = [x[1] for x in zipped]
    
    # Join documents and limit to max_chars to prevent exceeding token limits
    context = ""
    for doc in sorted_docs:
        if len(context) + len(doc) > max_chars:
            break
        context += doc + "\n\n"
        
    return context.strip()

