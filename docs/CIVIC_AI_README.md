# Civic AI Chatbot - RAG Implementation

## 🎯 Overview

A Retrieval-Augmented Generation (RAG) based AI chatbot that helps users understand civic issues through analysis of historical NYC 311 service request data.

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Query                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Embedding Service                              │
│         (sentence-transformers/all-MiniLM-L6-v2)            │
│                  384-dimensional vectors                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Vector Store (FAISS)                           │
│              Similarity Search (L2 Distance)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Retrieve Top K Relevant Documents                   │
│              (Historical 311 Records)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Context + Query → Answer Synthesis                  │
│          (Currently: Pattern Summarization)                  │
│          (Future: LLM Integration)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Natural Language Response                      │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Project Structure

```
backend/civic_ai/
├── __init__.py
├── apps.py
├── models.py                      # (Empty - no database models)
├── admin.py
├── urls.py                        # API endpoints
├── views.py                       # REST API views
├── nyc_data_client.py            # NYC Open Data API client
├── document_processor.py         # Convert records → documents
├── embedding_service.py          # Generate embeddings
├── vector_store.py               # FAISS vector database
├── rag_pipeline.py               # Complete RAG orchestration
└── management/
    └── commands/
        └── ingest_data.py        # CLI for data ingestion

frontend/src/pages/civic-ai/
└── index.jsx                     # React chatbot UI
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
.\.venv\Scripts\Activate.ps1
pip install sentence-transformers faiss-cpu
```

### 2. Ingest Data

```bash
# Fetch and index NYC 311 data
python manage.py ingest_data --days 60 --limit 3000

# Options:
#   --days: Days to look back (default: 90)
#   --limit: Total records to fetch (default: 5000)
#   --batch: Batch size (default: 1000)
```

### 3. Start Backend

```bash
python manage.py runserver
```

### 4. Start Frontend

```bash
cd frontend
npm start
```

### 5. Access Chatbot

Navigate to: **http://localhost:5173/civic-ai**

## 🔌 API Endpoints

### Chat
```http
POST /api/civic-ai/chat/
Content-Type: application/json

{
  "question": "What are the most common noise complaints?"
}

Response:
{
  "answer": "Based on historical NYC 311 service request data...",
  "context": [
    {
      "text": "A noise - street/sidewalk issue was reported...",
      "metadata": { "complaint_type": "Noise", "borough": "Manhattan" },
      "score": 0.234,
      "rank": 1
    }
  ],
  "confidence": 0.95,
  "question": "What are the most common noise complaints?"
}
```

### Ingest Data
```http
POST /api/civic-ai/ingest/
Content-Type: application/json

{
  "days_back": 90,
  "total_limit": 5000,
  "batch_size": 1000
}

Response:
{
  "message": "Data ingestion completed successfully",
  "stats": {
    "total_documents": 5000,
    "dimension": 384,
    "index_type": "flat",
    "index_size": 5000
  }
}
```

### Get Stats
```http
GET /api/civic-ai/stats/

Response:
{
  "total_documents": 3000,
  "dimension": 384,
  "index_type": "flat",
  "index_size": 3000
}
```

## 📊 Data Source

**NYC Open Data - 311 Service Requests**
- **Dataset**: https://data.cityofnewyork.us/resource/erm2-nwe9.json
- **API**: Socrata OData API
- **Status**: Historical data (not real-time)
- **Usage**: Retrieval context only (not for model training)

### Data Fields Used:
- `complaint_type`: Type of issue (Noise, Water, Street, etc.)
- `descriptor`: Detailed description
- `borough`: NYC borough
- `city`: City name
- `location_type`: Type of location
- `agency_name`: Responsible agency
- `agency`: Agency abbreviation
- `resolution_description`: How issue was resolved
- `status`: Current status
- `created_date`: When reported
- `closed_date`: When resolved

## 🧠 RAG Components

### 1. NYC Data Client (`nyc_data_client.py`)

Fetches service requests from NYC Open Data:

```python
client = NYCOpenDataClient(app_token="optional_token")
records = client.fetch_all_batches(
    days_back=90,
    total_limit=5000,
    batch_size=1000
)
```

### 2. Document Processor (`document_processor.py`)

Converts structured records into natural language:

**Input:**
```json
{
  "complaint_type": "Noise - Street/Sidewalk",
  "descriptor": "Loud Music/Party",
  "borough": "Manhattan",
  "agency_name": "New York City Police Department",
  "resolution_description": "The Police Department responded...",
  "created_date": "2024-01-15T10:00:00.000",
  "closed_date": "2024-01-15T14:30:00.000",
  "status": "Closed"
}
```

**Output:**
```
A noise - street/sidewalk issue was reported: loud music/party. The issue occurred in Manhattan. The New York City Police Department (NYPD) was responsible for handling this case. Resolution: The Police Department responded to the complaint and took appropriate action. The issue was resolved on the same day. Final status: Closed.
```

### 3. Embedding Service (`embedding_service.py`)

Generates 384-dimensional embeddings:

```python
embedder = EmbeddingService('all-MiniLM-L6-v2')
embeddings = embedder.embed([
    "Text document 1",
    "Text document 2"
])
# Shape: (2, 384)
```

### 4. Vector Store (`vector_store.py`)

FAISS-based similarity search:

```python
store = VectorStore(dimension=384, index_type='flat')
store.add(embeddings, texts, metadatas)
results, meta, scores = store.search(query_embedding, k=5)
```

### 5. RAG Pipeline (`rag_pipeline.py`)

Complete orchestration:

```python
pipeline = RAGPipeline(
    socrata_token="optional",
    embedding_model='all-MiniLM-L6-v2',
    vector_store_path='civic_ai/vector_store'
)

# Ingest data
pipeline.ingest_data(days_back=90, total_limit=5000)

# Query
result = pipeline.query("What are common noise complaints?", k=5)
```

## 🎨 Frontend Features

- **Modern UI**: Gradient design with Tailwind CSS
- **Real-time Chat**: WebSocket-like experience
- **Example Questions**: Quick-start prompts
- **Database Stats**: Live knowledge base metrics
- **Confidence Scores**: Transparency in responses
- **Mobile Responsive**: Works on all screen sizes

## ⚙️ Configuration

### Django Settings (`server/settings.py`)

```python
# NYC Open Data API Token (optional, for higher rate limits)
SOCRATA_APP_TOKEN = os.environ.get('SOCRATA_APP_TOKEN', None)

# Embedding model
EMBEDDING_MODEL = 'all-MiniLM-L6-v2'

# Vector store path
VECTOR_STORE_PATH = os.path.join(BASE_DIR, 'civic_ai', 'vector_store')
```

### Environment Variables

```bash
# Optional: Set API token for higher rate limits
export SOCRATA_APP_TOKEN="your_token_here"
```

## 🔧 Customization

### Change Embedding Model

```python
# In settings.py
EMBEDDING_MODEL = 'all-mpnet-base-v2'  # Higher quality, slower
# or
EMBEDDING_MODEL = 'paraphrase-MiniLM-L3-v2'  # Faster, lower quality
```

### Use IVF Index for Large Datasets

```python
# In rag_pipeline.py initialization
pipeline = RAGPipeline(
    index_type='ivf'  # Better for >100k documents
)
```

### Integrate LLM for Better Answers

Replace `_synthesize_answer()` in `rag_pipeline.py`:

```python
def _synthesize_answer(self, question: str, context: List[Dict]) -> str:
    import openai
    
    context_text = "\n\n".join([c['text'] for c in context])
    
    prompt = f"""Based on the following NYC 311 historical data, answer the question.

Context:
{context_text}

Question: {question}

Provide a clear, data-driven answer:"""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a civic analytics assistant..."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content
```

## 📈 Performance

### Current Stats (3000 documents):
- **Index Size**: 3000 documents
- **Embedding Dimension**: 384D
- **Query Time**: ~50ms
- **Storage**: ~5MB

### Scalability:
- **Flat Index**: Good for <50k documents
- **IVF Index**: Recommended for >50k documents
- **Memory Usage**: ~4 bytes per dimension per document

## 🚨 Important Notes

### Data Usage Rules:
1. ✅ Data is historical (not real-time)
2. ✅ Used for retrieval context only
3. ✅ NOT used for model training
4. ❌ Do NOT claim real-time monitoring
5. ❌ Do NOT provide legal/enforcement advice
6. ❌ Do NOT claim data represents Nepal directly

### Nepal Context:
- Explain as **logical comparisons** only
- Example: "NYC data shows X pattern, which might inform understanding of similar urban issues in Kathmandu"
- Never claim: "This is Kathmandu data"

## 🔮 Future Enhancements

- [ ] Integrate OpenAI/Claude for better synthesis
- [ ] Add conversation memory
- [ ] Implement streaming responses
- [ ] Add data visualization
- [ ] Export analysis reports
- [ ] Multi-city data sources
- [ ] Fine-tuned embeddings
- [ ] Hybrid search (keyword + semantic)

## 🐛 Troubleshooting

### Issue: No documents after ingestion
```bash
# Check if data was fetched
python manage.py ingest_data --days 30 --limit 100
# Look for "Retrieved X records" in output
```

### Issue: Import errors
```bash
# Reinstall dependencies
pip install --force-reinstall sentence-transformers faiss-cpu
```

### Issue: CORS errors in frontend
```python
# In settings.py, add:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

## 📝 License

This project is part of e-Speak platform.

---

Built with ❤️ using Django, React, FAISS, and sentence-transformers
