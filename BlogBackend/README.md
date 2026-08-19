# BlogSphere — Backend API & ML Service

Express.js, MongoDB, & Native Machine Learning REST API backend service for **BlogSphere**.

## Features
* **JWT Authentication**: User registration with `bcrypt` password hashing and JWT token issuance.
* **Native Machine Learning Core (`@xenova/transformers`)**:
  * **384-dimensional Vector Embeddings**: In-process model execution using `Xenova/all-MiniLM-L6-v2`.
  * **Semantic AI Search**: Cosine similarity vector matching across articles.
  * **Personalized Recommendations**: User preference vector matching based on liking history.
  * **AI Tag & Outline Extractor**: Stopword removal, term frequency auto-tagging, and sentence embedding summaries.
* **Blog Operations API**: Public feed, user-specific blogs, create, edit, delete, single-like per user toggle (`likedBy`), and comment submission.
* **Nodemailer Integration**: Handles `/api/contact` form submissions and dispatches luxury dark/gold HTML emails via Google SMTP.
* **Real-time Notifications**: In-app alerts when users interact with blog posts.

---

## Tech Stack
* **Node.js** & **Express.js** (v5)
* **MongoDB** with **Mongoose** (v8)
* **`@xenova/transformers`** & **`onnxruntime-node`** (Native ML Engine)
* **JWT** (`jsonwebtoken`) & **Bcrypt**
* **Nodemailer**
* **CORS** & **Dotenv**

---

## Environment Configuration (`.env`)
```env
PORT=5000
MONG_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogdb?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key
EMAIL_FROM=blogspherehelpdesk@gmail.com
EMAIL_PASS=your_google_app_password
```

---

## Key API Routes

### Auth (`/api/auth`)
* `POST /register`: Register user
* `POST /login`: Log in user
* `GET /totalusers`: Get total user count

### Blogs (`/api/blogs`)
* `GET /`: Get public blogs
* `GET /search/semantic?query=...`: Semantic AI vector search
* `GET /recommendations/for-you`: Get personalized content feed for logged-in user
* `GET /:id`: Get single blog
* `GET /username/:username`: Get blogs by username
* `POST /`: Create new blog (with automatic ML enrichment)
* `PATCH /:id`: Update blog
* `PATCH /:id/like`: Toggle like / unlike (enforces 1 like per user)
* `PATCH /:id/comment`: Add comment to blog
* `PATCH /:id/collaborators`: Add collaborator
* `DELETE /:id`: Delete blog

### Mail & Contact (`/api`)
* `POST /contact`: Send HTML email from contact form

---

## Running Locally
```bash
npm install
npm run dev
```