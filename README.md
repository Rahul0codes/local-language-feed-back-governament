# 360° Feedback on Government of India–Related News in Regional Media (AI/ML)

> A multilingual, privacy‑aware pipeline that ingests regional news, extracts insights about Government of India (GoI) entities, and delivers 360‑degree feedback loops for policymakers, departments, and the public.

---

## 🚀 TL;DR

* **Goal:** Build an end‑to‑end system to monitor regional media, detect stories about GoI ministries/schemes/officials, and summarize public sentiment, narratives, and emerging issues—then route insights as actionable feedback to stakeholders.
* **Why it matters:** Policy and service delivery benefit when decision‑makers hear from all directions—media, citizens, and internal teams—especially across India’s many languages.
* **How:** Crawling → Clean/De‑dupe → Multilingual NLP (NER, sentiment, stance, topic, clustering) → Summaries & KPIs → Dashboards & alerts → Feedback capture → Continuous learning.

---

## 🎯 Objectives

1. **Comprehensive Coverage:** Track GoI‑related stories across **regional languages** and sources (print e‑papers, TV transcripts when available, local portals, verified social mentions).
2. **Entity Awareness:** Identify **ministries, departments, schemes (e.g., PM‑KISAN), offices, PSUs, locations, officials**; link to a controlled GoI **knowledge base/ontology**.
3. **Narrative & Sentiment:** Detect **stance** (supportive/critical/neutral), **sentiment**, **topics**, and **emerging themes**.
4. **Actionable Summaries:** Deliver **daily/weekly digests**, **live dashboards**, and **alerting** for anomalies/crises.
5. **True 360° Loop:** Capture **responses/clarifications** from departments and **citizen feedback**, measure **resolution** and **impact over time**.
6. **Privacy, Ethics, Compliance:** Respect Indian data laws, avoid PII leakage, maintain **audit trails** and **model cards**.

---

## 🌐 Multilingual Focus (Indic)

* **Languages (extensible):** Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Urdu, etc.
* **Models (suggested options):**

  * **Tokenization/Embeddings:** MuRIL, IndicBERT, LaBSE, multilingual SBERT.
  * **NER:** Fine‑tuned IndicBERT/MuRIL; Gazetteer‑augmented for GoI entities.
  * **Sentiment/Stance:** Multilingual classifiers with domain fine‑tuning; distant supervision via headlines; human‑in‑the‑loop corrections.
  * **Topic & Clustering:** BERTopic/Top2Vec with multilingual embeddings; online clustering for emerging issues.
  * **Summarization:** mT5/ByT5/Indic‑friendly LLMs; length controls and safety filters.
  * **MT (optional):** Indic↔English translation for cross‑lingual search & summaries.

> Choose models based on compute/security constraints; support CPU‑first fallbacks and quantized variants.

---

## 🧭 System Architecture

```mermaid
flowchart LR
  A[Source Ingestors\n(RSS, sitemaps, crawlers, APIs, TV/Radio transcripts)] --> B[Normalizer\n(clean, boilerplate removal, lang ID, dedupe)]
  B --> C[Classifier\n(GoI relevance, media type)]
  C --> D[Entity Layer\n(NER, entity linking to GoI KB)]
  D --> E[Narrative Layer\n(sentiment, stance, topic, clustering)]
  E --> F[Summarizer\n(abstracts, highlights, quotes)]
  F --> G[Store & Index\n(PostgreSQL + PGVector/Elastic)]
  G --> H[Dashboards & APIs\n(FastAPI, Streamlit/Next.js)]
  H --> I[Alerts\n(email/Teams/Slack/SMS)]
  H --> J[Feedback Capture\n(dept responses, citizen inputs)]
  J --> K[Human‑in‑the‑Loop Label Studio\n(active learning, QA)]
  K --> L[Model Training\n(offline retraining, eval, registry)]
  L --> C
```

---

## 🧩 Key Features

* **Source Ingestion**: Configurable crawlers for regional outlets; RSS/sitemaps; paywall‑respecting integrations; optional YouTube/TV transcript fetchers where permitted.
* **De‑duplication**: Near‑duplicate detection using MinHash/SimHash + embedding cosine similarity.
* **Language Aware**: Automatic language ID, translation for cross‑lingual search, native‑language summaries on demand.
* **GoI‑Aware NER & Linking**: Gazetteers + learned models; canonical IDs for ministries, schemes, officials, PSUs.
* **Narrative Intelligence**: Sentiment, stance, topics, emerging storyline detection; crisis spikes & velocity.
* **Summaries & Explainability**: Bullet summaries with extractive references; highlight key quotes; show evidence snippets.
* **Dashboards**: Geo maps by state/district; timeline trends; outlet‑wise stance heatmaps; entity co‑occurrence.
* **360° Feedback Loop**: Intake forms/APIs for departments to respond; citizen input module; resolution tracking.
* **Governance**: Role‑based access; redaction; audit logs; model cards and drift monitoring.

---

## 🛠️ Tech Stack (suggested)

* **Backend:** Python **FastAPI**, Celery workers, Redis (queues), PostgreSQL (+ **pgvector**) or Elasticsearch/OpenSearch.
* **Pipelines:** Airflow/Prefect or Kafka Streams for near‑realtime.
* **NLP/ML:** PyTorch, Hugging Face Transformers, sentence‑transformers, spaCy, BERTopic, scikit‑learn, PyTorch‑Lightning.
* **UI:** Next.js/React + Tailwind; alt: Streamlit for internal prototypes.
* **Deploy:** Docker Compose → K8s (optional); Prometheus + Grafana; MLflow/Weights & Biases for experiments.

---

## 📦 Repository Structure

```
.
├── apps/
│   ├── api/                # FastAPI app (ingest, search, analytics)
│   ├── web/                # Next.js dashboard
│   └── worker/             # Celery/consumer jobs
├── pipelines/              # Airflow/Prefect DAGs; Kafka consumers
├── nlp/
│   ├── models/             # training scripts, configs
│   ├── gazetteers/         # GoI entities & synonyms
│   ├── components/         # ner.py, sentiment.py, topic.py, summarizer.py
│   └── eval/               # evaluation datasets & notebooks
├── data/
│   ├── samples/            # redacted sample articles
│   └── schema/             # JSON schemas
├── infra/                  # Docker, K8s, Terraform (if any)
├── notebooks/              # exploration & reports
├── tests/                  # unit/integration tests
├── scripts/                # utilities (crawl, backfill, export)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔐 Compliance, Privacy & Ethics

* **Legal:** Respect terms of use for sources; avoid bypassing paywalls; comply with IT Act and relevant policies.
* **Privacy:** Store only required fields; redact PII; encrypt at rest and in transit; configurable retention.
* **Bias & Fairness:** Balanced training/eval sets by language & region; publish **model cards**; manual review for sensitive outputs.
* **Explainability:** Keep evidence snippets/URLs for each summary; show confidence scores.
* **Accessibility:** WCAG‑compliant UI; multilingual content.

---

## 🗂️ Data Model (simplified)

```json
Article {
  id: string,
  url: string,
  outlet: string,
  language: string,
  published_at: datetime,
  location: { state: string, district?: string },
  title: string,
  body: string,
  embeddings: vector,
  dedupe_key: string
}

StoryInsight {
  article_id: string,
  entities: [{ id: string, type: "ministry|scheme|official|psu|place", name: string }],
  sentiment: { label: "pos|neg|neu", score: float },
  stance: { label: "supportive|critical|neutral", score: float },
  topics: [string],
  summary: string,
  evidence: [{ text: string, start: int, end: int }]
}

Feedback {
  id: string,
  entity_id: string,
  source: "department|citizen|editor",
  message: string,
  created_at: datetime,
  resolution_status: "open|in_progress|resolved"
}
```

---

## 🧪 Evaluation

* **NER:** F1 by entity type; exact/partial matches; KB‑linking accuracy.
* **Sentiment/Stance:** Macro‑F1; confusion matrices by language & outlet.
* **Summarization:** ROUGE, BERTScore, human eval for factuality & coverage.
* **Clustering/Topics:** Intrinsic coherence + human interpretability checks.
* **System:** Crawl coverage, de‑dupe rate, latency, alert precision/recall.

---

## ▶️ Quick Start

### Prerequisites

* Python 3.10+
* Docker & Docker Compose
* PostgreSQL 14+ (or run via compose)

### Setup

```bash
# 1) Clone
git clone https://github.com/your-org/360-feedback-regional-media-goi.git
cd 360-feedback-regional-media-goi

# 2) Configure env
cp .env.example .env
# Fill database URLs, model paths, API keys for translation/ASR if used

# 3) Start services
docker compose up -d --build

# 4) Run migrations & seed GoI KB
make migrate
python scripts/seed_goi_kb.py data/seed/goi_entities.csv

# 5) Start workers and web
make worker
make api
make web
```

### Sample Requests

```bash
# Ingest an article (raw HTML or text)
curl -X POST http://localhost:8000/ingest \
  -H 'Content-Type: application/json' \
  -d '{
        "url": "https://example.com/news/kan-news-123",
        "html": "<html>…</html>",
        "language": "kn"
      }'

# Search summaries for a scheme
curl 'http://localhost:8000/search?q=PM-KISAN&lang=en&since=2025-07-01'

# Get daily digest
curl 'http://localhost:8000/digest?date=2025-08-18&lang=en'
```

---

## 🔁 360° Feedback Loop

* **Department Portal:** View mentions, submit clarifications/responses.
* **Citizen Input:** Structured forms; optional verification (OTP/email).
* **Resolution Tracking:** Link department replies to stories; mark resolved; measure **time‑to‑clarification** and **public reaction shift**.
* **Learning:** Approved edits feed back to training data via active learning.

---

## 🧑‍💻 Development

* **Code Style:** `ruff` + `black` + `mypy`.
* **Testing:** `pytest -q`; include fixture data per language.
* **CI/CD:** GitHub Actions for unit tests, container build, vulnerability scan.
* **Observability:** Structured logs (OpenTelemetry), request tracing, model latency metrics.

---

## 🗺️ Roadmap

* [ ] Expand gazetteers for schemes/PSUs & synonyms in 12+ languages
* [ ] Add streaming ASR for TV/radio clips (where licensed)
* [ ] Real‑time crisis detection (spike + stance drift)
* [ ] Fine‑tuned stance model per region/outlet
* [ ] Editor curation UI + human notes
* [ ] Redaction API + PII detector improvements
* [ ] Offline bundles for air‑gapped deployments

---

## 🤝 Contributing

Contributions are welcome! Please open an issue with context (language, outlet, feature). For major changes, discuss via an issue first.

---

## 📜 License

Choose a license that matches your deployment context (e.g., **Apache‑2.0** for permissive use). Update `LICENSE` accordingly.

---

## 🙏 Acknowledgements

Thanks to the open‑source Indic NLP community and public datasets. Replace model/data references with the exact assets you adopt and credit appropriately.

---

## 📧 Contact

Project Maintainer: *Your Name* · *[email@example.com](mailto:email@example.com)*

> *Tip:* Open `issues/` for source suggestions (regional outlets), false positives, or feature requests.
