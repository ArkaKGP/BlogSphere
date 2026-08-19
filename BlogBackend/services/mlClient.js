const { pipeline } = require('@xenova/transformers');

// Standard Stopwords for keyword extraction
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't",
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'cannot', 'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't",
  'having', 'he', "he'd", "he'll", "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself',
  'his', 'how', "how's", 'i', "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it',
  "it's", 'its', 'itself', "let's", 'me', 'more', 'most', "mustn't", 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some',
  'such', 'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  "there's", 'these', 'they', "they'd", "they'll", "they're", "they've", 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've",
  'were', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who',
  "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you', "you'd", "you'll",
  "you're", "you've", 'your', 'yours', 'yourself', 'yourselves', 'blog', 'post', 'read', 'story'
]);

let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      try {
        console.log('🤖 Loading ML Embedding Model (Xenova/all-MiniLM-L6-v2)...');
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('✅ ML Embedding Model Loaded Successfully!');
        return pipe;
      } catch (err) {
        console.error('⚠️ ML Model Load Error:', err.message);
        extractorPromise = null;
        throw err;
      }
    })();
  }
  return extractorPromise;
}

/**
 * Generate 384-dimensional vector embedding for text
 */
const getEmbedding = async (text) => {
  if (!text || !text.trim()) return [];
  try {
    const extractor = await getExtractor();
    const output = await extractor(text.trim(), { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('⚠️ ML Embed Error:', error.message);
    return [];
  }
};

/**
 * Helper to strip HTML tags from rich text content
 */
const stripHtml = (html = '') => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Extract top K keyword tags from title and content
 */
const extractTopTags = (title = '', content = '', topK = 3) => {
  const cleanText = stripHtml(content);
  const fullText = `${title} ${title} ${cleanText}`; // Give title 2x weight
  const words = fullText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const filteredWords = words.filter(w => !STOPWORDS.has(w));

  if (filteredWords.length === 0) {
    return ['General', 'Article', 'Blog'];
  }

  const frequencyMap = {};
  filteredWords.forEach(w => {
    frequencyMap[w] = (frequencyMap[w] || 0) + 1;
  });

  const sortedCandidates = Object.keys(frequencyMap).sort(
    (a, b) => frequencyMap[b] - frequencyMap[a]
  );

  const tags = [];
  for (const word of sortedCandidates) {
    const formattedTag = word.charAt(0).toUpperCase() + word.slice(1);
    if (!tags.includes(formattedTag)) {
      tags.push(formattedTag);
    }
    if (tags.length === topK) break;
  }

  while (tags.length < topK) {
    tags.push('Blog');
  }

  return tags;
};

/**
 * Calculate cosine similarity between two 1D float arrays
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
};

/**
 * Generate extractive summary using sentence embeddings
 */
const generateExtractiveSummary = async (title = '', content = '', maxSentences = 2) => {
  const cleanContent = stripHtml(content);
  if (!cleanContent) return title;

  // Split into clean sentences using regex
  const sentences = cleanContent
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length <= maxSentences) {
    return sentences.join(' ');
  }

  try {
    const docText = `${title}. ${cleanContent}`.trim();
    const docEmbedding = await getEmbedding(docText);
    if (!docEmbedding || docEmbedding.length === 0) {
      return sentences.slice(0, maxSentences).join(' ');
    }

    const sentenceScores = [];
    for (let idx = 0; idx < sentences.length; idx++) {
      const sentEmb = await getEmbedding(sentences[idx]);
      const simScore = sentEmb.length > 0 ? cosineSimilarity(docEmbedding, sentEmb) : 0;
      // Slight position bonus for narrative flow
      const positionBonus = ((sentences.length - idx) / sentences.length) * 0.05;
      sentenceScores.push({ score: simScore + positionBonus, index: idx });
    }

    // Sort by score descending and take top N
    sentenceScores.sort((a, b) => b.score - a.score);
    const selectedIndices = sentenceScores
      .slice(0, maxSentences)
      .map(item => item.index)
      .sort((a, b) => a - b);

    return selectedIndices.map(i => sentences[i]).join(' ');
  } catch (error) {
    console.error('⚠️ Extractive Summary Error:', error.message);
    return sentences.slice(0, maxSentences).join(' ');
  }
};

/**
 * Enrich blog post content to get embedding, top tags, and summary
 */
const enrichBlog = async (title = '', content = '') => {
  try {
    const combinedText = `${title}. ${content}`.trim();
    const embedding = await getEmbedding(combinedText);
    const tags = extractTopTags(title, content, 3);
    const summary = await generateExtractiveSummary(title, content, 2);

    return { embedding, tags, summary };
  } catch (error) {
    console.error('⚠️ ML Service Enrich Error:', error.message);
    return {
      embedding: [],
      tags: ['General', 'Blog'],
      summary: content ? content.slice(0, 150) + '...' : title || ''
    };
  }
};

module.exports = {
  getEmbedding,
  enrichBlog
};
