import fetch from 'node-fetch';

/**
 * AI-Powered Review Intelligence Service
 * Provides sentiment analysis, quality detection, and content analysis for movie reviews
 */
class ReviewIntelligenceService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent`;
  }

  /**
   * Analyze review text for sentiment, emotions, themes, and quality
   */
  async analyzeReview(reviewText, rating, userContext = {}) {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(reviewText, rating, userContext);
      
      const response = await fetch(`${this.geminiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: analysisPrompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
        return this.getFallbackAnalysis(reviewText, rating);
      }

      return this.parseAnalysisResponse(analysisText, reviewText, rating);
    } catch (error) {
      console.error('Review analysis error:', error);
      return this.getFallbackAnalysis(reviewText, rating);
    }
  }

  /**
   * Build analysis prompt for Gemini AI
   */
  buildAnalysisPrompt(reviewText, rating, userContext) {
    return `Analyze this movie review and return a JSON response with the following structure:

{
  "sentimentScore": <number between -1 and 1>,
  "confidenceScore": <number between 0 and 1>,
  "emotions": [
    {"emotion": "<joy|anger|sadness|fear|surprise|disgust>", "intensity": <0-1>}
  ],
  "themes": ["<acting|plot|visuals|soundtrack|directing|cinematography|dialogue>"],
  "qualityFlags": {
    "isSpam": <boolean>,
    "isFake": <boolean>,
    "isHelpful": <boolean>,
    "toxicityScore": <number 0-1>
  },
  "language": "<language_code>",
  "readabilityScore": <number 0-100>,
  "helpfulnessScore": <number 0-1>
}

Review Text: "${reviewText}"
Star Rating: ${rating}/5

Analysis Guidelines:
- sentimentScore: -1 (very negative) to 1 (very positive)
- confidenceScore: How confident are you in this analysis?
- emotions: Detect primary emotions and their intensity
- themes: What movie aspects does the review discuss?
- isSpam: Generic text, repeated phrases, or promotional content
- isFake: Suspiciously extreme praise/criticism, fake language patterns
- isHelpful: Does this review provide useful information for other viewers?
- toxicityScore: Level of offensive, hateful, or inappropriate content
- readabilityScore: Flesch reading ease score (0-100)
- helpfulnessScore: Predicted usefulness to other users

Respond with only the JSON object, no additional text.`;
  }

  /**
   * Parse Gemini AI response into structured data
   */
  parseAnalysisResponse(analysisText, reviewText, rating) {
    try {
      // Extract JSON from response (Gemini sometimes adds extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize response
      return {
        sentimentScore: this.clamp(analysis.sentimentScore || 0, -1, 1),
        confidenceScore: this.clamp(analysis.confidenceScore || 0.5, 0, 1),
        emotions: this.validateEmotions(analysis.emotions || []),
        themes: this.validateThemes(analysis.themes || []),
        qualityFlags: {
          isSpam: Boolean(analysis.qualityFlags?.isSpam || false),
          isFake: Boolean(analysis.qualityFlags?.isFake || false),
          isHelpful: Boolean(analysis.qualityFlags?.isHelpful ?? true),
          toxicityScore: this.clamp(analysis.qualityFlags?.toxicityScore || 0, 0, 1)
        },
        language: analysis.language || 'en',
        readabilityScore: this.clamp(analysis.readabilityScore || 50, 0, 100),
        helpfulnessScore: this.clamp(analysis.helpfulnessScore || 0.5, 0, 1)
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return this.getFallbackAnalysis(reviewText, rating);
    }
  }

  /**
   * Generate fallback analysis when AI fails
   */
  getFallbackAnalysis(reviewText, rating) {
    // Simple rule-based fallback
    const wordCount = reviewText.split(/\s+/).length;
    const sentimentScore = (rating - 3) / 2; // Convert 1-5 rating to -1 to 1 sentiment
    
    return {
      sentimentScore,
      confidenceScore: 0.3, // Low confidence for fallback
      emotions: this.detectBasicEmotions(reviewText, rating),
      themes: this.detectBasicThemes(reviewText),
      qualityFlags: {
        isSpam: this.detectSpam(reviewText),
        isFake: false, // Conservative fallback
        isHelpful: wordCount > 10, // Longer reviews are generally more helpful
        toxicityScore: this.detectToxicity(reviewText)
      },
      language: 'en',
      readabilityScore: Math.max(20, Math.min(80, wordCount * 2)), // Rough estimate
      helpfulnessScore: Math.min(1, wordCount / 50) // Based on length
    };
  }

  /**
   * Generate personalized review summary for a user
   */
  async generatePersonalizedSummary(reviews, userPreferences = {}) {
    try {
      if (!reviews || reviews.length === 0) {
        return {
          summary: "No reviews available for this movie yet.",
          highlights: [],
          concerns: [],
          recommendation: "neutral"
        };
      }

      const summaryPrompt = this.buildSummaryPrompt(reviews, userPreferences);
      
      const response = await fetch(`${this.geminiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: summaryPrompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!summaryText) {
        return this.getFallbackSummary(reviews);
      }

      return this.parseSummaryResponse(summaryText);
    } catch (error) {
      console.error('Summary generation error:', error);
      return this.getFallbackSummary(reviews);
    }
  }

  /**
   * Build summary prompt for personalized review analysis
   */
  buildSummaryPrompt(reviews, userPreferences) {
    const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5 - "${r.text}"`).join('\n\n');
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    
    return `Create a personalized movie review summary based on these reviews and user preferences:

REVIEWS (${reviews.length} total, avg rating: ${avgRating}/5):
${reviewTexts}

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

Return a JSON response with this structure:
{
  "summary": "<3-4 sentence personalized summary>",
  "highlights": ["<positive point 1>", "<positive point 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendation": "<strongly_positive|positive|neutral|negative|strongly_negative>",
  "confidenceScore": <0-1>,
  "personalizedInsights": ["<insight based on user preferences>"]
}

Focus on aspects that matter to this user based on their preferences. If they love action movies, highlight action elements. If they care about plot, focus on story elements.

Respond with only the JSON object.`;
  }

  /**
   * Parse summary response from AI
   */
  parseSummaryResponse(summaryText) {
    try {
      const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in summary response');
      }

      const summary = JSON.parse(jsonMatch[0]);
      
      return {
        summary: summary.summary || "Mixed reviews from viewers.",
        highlights: Array.isArray(summary.highlights) ? summary.highlights : [],
        concerns: Array.isArray(summary.concerns) ? summary.concerns : [],
        recommendation: summary.recommendation || "neutral",
        confidenceScore: this.clamp(summary.confidenceScore || 0.5, 0, 1),
        personalizedInsights: Array.isArray(summary.personalizedInsights) ? summary.personalizedInsights : []
      };
    } catch (error) {
      console.error('Failed to parse summary response:', error);
      return this.getFallbackSummary([]);
    }
  }

  /**
   * Utility methods
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  validateEmotions(emotions) {
    const validEmotions = ['joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust'];
    return emotions
      .filter(e => e.emotion && validEmotions.includes(e.emotion))
      .map(e => ({
        emotion: e.emotion,
        intensity: this.clamp(e.intensity || 0, 0, 1)
      }))
      .slice(0, 3); // Limit to top 3 emotions
  }

  validateThemes(themes) {
    const validThemes = ['acting', 'plot', 'visuals', 'soundtrack', 'directing', 'cinematography', 'dialogue'];
    return themes
      .filter(theme => validThemes.includes(theme))
      .slice(0, 5); // Limit to top 5 themes
  }

  detectBasicEmotions(text, rating) {
    const emotions = [];
    const lowerText = text.toLowerCase();
    
    if (rating >= 4) emotions.push({ emotion: 'joy', intensity: 0.7 });
    if (rating <= 2) emotions.push({ emotion: 'anger', intensity: 0.6 });
    if (lowerText.includes('disappoint')) emotions.push({ emotion: 'sadness', intensity: 0.5 });
    if (lowerText.includes('surprise') || lowerText.includes('unexpected')) emotions.push({ emotion: 'surprise', intensity: 0.6 });
    
    return emotions;
  }

  detectBasicThemes(text) {
    const themes = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('act') || lowerText.includes('perform')) themes.push('acting');
    if (lowerText.includes('story') || lowerText.includes('plot')) themes.push('plot');
    if (lowerText.includes('visual') || lowerText.includes('effect')) themes.push('visuals');
    if (lowerText.includes('music') || lowerText.includes('sound')) themes.push('soundtrack');
    if (lowerText.includes('direct')) themes.push('directing');
    
    return themes;
  }

  detectSpam(text) {
    const spamIndicators = [
      text.length < 10,
      /^(good|bad|nice|ok|great)\.?$/i.test(text.trim()),
      text.includes('http') || text.includes('www'),
      /(.)\1{4,}/.test(text) // Repeated characters
    ];
    
    return spamIndicators.filter(Boolean).length >= 2;
  }

  detectToxicity(text) {
    const toxicWords = ['hate', 'stupid', 'worst', 'terrible', 'awful', 'garbage'];
    const toxicCount = toxicWords.filter(word => text.toLowerCase().includes(word)).length;
    return Math.min(1, toxicCount * 0.2);
  }

  getFallbackSummary(reviews) {
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";
      
    return {
      summary: `Based on ${reviews.length} reviews with an average rating of ${avgRating}/5.`,
      highlights: [],
      concerns: [],
      recommendation: "neutral",
      confidenceScore: 0.3,
      personalizedInsights: []
    };
  }
}

export default new ReviewIntelligenceService();
