import { KnowledgeArticle, UserVote, KnowledgeSearch, KnowledgeStats, BodhiQuery } from '@/types/knowledge';

const STORAGE_KEYS = {
  ARTICLES: 'arboracle_knowledge_articles',
  VOTES: 'arboracle_knowledge_votes',
  USER_VOTES: 'arboracle_user_votes',
  BODHI_QUERIES: 'arboracle_bodhi_queries'
};

export class KnowledgeService {
  private static generateId(): string {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateConfidenceScore(upvotes: number, downvotes: number): number {
    const total = upvotes + downvotes;
    if (total === 0) return 50; // Neutral confidence for new articles
    
    // Wilson score confidence interval for a Bernoulli parameter
    const p = upvotes / total;
    const z = 1.96; // 95% confidence
    const denominator = 1 + (z * z) / total;
    const centre = p + (z * z) / (2 * total);
    const adjustment = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
    
    return Math.round(((centre - adjustment / denominator) / denominator) * 100);
  }

  private static estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  }

  // Initialize with sample articles
  static initializeSampleData(): void {
    const existing = this.getAllArticles();
    if (existing.length > 0) return; // Don't overwrite existing data

    const sampleArticles: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        title: "Complete Guide to Tree Species Identification",
        content: `# Tree Species Identification: A Comprehensive Guide

## Introduction
Identifying tree species is fundamental to forest management, conservation efforts, and ecological research. This comprehensive guide will walk you through the key characteristics and methods used by professionals.

## Leaf Characteristics
The most reliable method for tree identification is examining leaf characteristics:

### Leaf Shape
- **Ovate**: Egg-shaped, wider at base
- **Lanceolate**: Lance-shaped, narrow and pointed
- **Palmate**: Hand-shaped with lobes radiating from center
- **Compound**: Multiple leaflets on one stem

### Leaf Arrangement
- **Alternate**: Single leaves attached at different points
- **Opposite**: Leaves paired directly across from each other
- **Whorled**: Three or more leaves attached at same point

## Bark Patterns
Bark provides excellent identification clues:
- **Smooth**: Young trees and species like beech
- **Furrowed**: Deep grooves like oak and pine
- **Scaly**: Flaky plates like maple and cherry
- **Peeling**: Strips like birch and sycamore

## Seasonal Considerations
Different seasons offer different identification opportunities:
- **Spring**: New growth patterns and flowering
- **Summer**: Full leaf development and fruit
- **Fall**: Leaf color changes and seed dispersal
- **Winter**: Bark, buds, and overall tree structure

## Field Tools
Essential tools for tree identification:
1. **Field Guide**: Region-specific identification book
2. **Hand Lens**: 10x magnification for detailed examination
3. **Measuring Tape**: For trunk diameter and height
4. **Camera**: Document leaves, bark, and overall form
5. **Notebook**: Record observations and locations

## Common Mistakes
Avoid these identification pitfalls:
- Relying on single characteristics
- Ignoring regional variations
- Misidentifying juvenile vs. mature features
- Overlooking hybrid species

## Digital Tools
Modern technology aids identification:
- **iNaturalist**: Community-based identification
- **PlantNet**: AI-powered plant identification
- **GPS Apps**: Location-specific databases
- **Arboracle Integration**: Track identified species

## Professional Tips
Expert advice for accurate identification:
1. Examine multiple specimens
2. Consider habitat and geography
3. Use multiple identification keys
4. Consult with local experts
5. Document uncertain identifications for review

## Conclusion
Tree identification is both an art and science that improves with practice. Start with common local species and gradually expand your knowledge. Remember that even experts sometimes need additional resources for challenging identifications.`,
        excerpt: "Master the art and science of tree species identification with this comprehensive guide covering leaf characteristics, bark patterns, seasonal considerations, and professional techniques.",
        author: "Dr. Sarah Chen",
        authorAvatar: "🌲",
        tags: ["identification", "field-guide", "leaves", "bark", "methodology"],
        category: "identification",
        upvoteCount: 124,
        downvoteCount: 8,
        confidenceScore: 0,
        viewCount: 2847,
        difficulty: "beginner",
        estimatedReadTime: 0,
        isVerified: true,
        sources: [
          "Forest Service Field Guide to Trees",
          "Peterson Field Guide to Trees and Shrubs",
          "What Tree Is That? by Arbor Day Foundation"
        ]
      },
      {
        title: "Understanding Forest Ecosystem Dynamics",
        content: `# Forest Ecosystem Dynamics: Interconnected Life

## Introduction
Forests are complex ecosystems where countless species interact in intricate webs of relationships. Understanding these dynamics is crucial for effective forest management and conservation.

## Primary Producers
Trees and plants form the foundation:
- **Canopy Layer**: Dominant trees capturing sunlight
- **Understory**: Smaller trees and shrubs
- **Herbaceous Layer**: Grasses, ferns, and wildflowers
- **Forest Floor**: Mosses, lichens, and decomposers

## Energy Flow
Energy moves through the ecosystem:
1. **Solar Energy**: Captured by photosynthesis
2. **Primary Consumers**: Herbivores feeding on plants
3. **Secondary Consumers**: Carnivores and omnivores
4. **Decomposers**: Breaking down organic matter

## Nutrient Cycling
Essential elements cycle through the ecosystem:
- **Carbon Cycle**: CO2 absorption and storage
- **Nitrogen Cycle**: Soil enrichment through fixation
- **Phosphorus Cycle**: Limited resource requiring conservation
- **Water Cycle**: Transpiration and soil moisture

## Succession Patterns
Forests change over time:
### Primary Succession
Starting from bare soil or rock:
1. Pioneer species establish
2. Grasses and shrubs colonize
3. Fast-growing trees dominate
4. Climax community develops

### Secondary Succession
After disturbance events:
1. Existing seed bank germinates
2. Early successional species return
3. Competition shapes community
4. Mature forest re-establishes

## Disturbance Regimes
Natural and human disturbances shape forests:
- **Fire**: Natural regeneration tool
- **Wind**: Creates gaps for new growth
- **Insects**: Population cycles affect tree health
- **Disease**: Pathogens influence species composition
- **Human Activity**: Logging, development, fragmentation

## Biodiversity Hotspots
Areas of high species richness:
- **Edge Effects**: Increased diversity at forest borders
- **Microhabitats**: Specialized niches within forests
- **Old Growth**: Complex structure supports rare species
- **Riparian Zones**: Water-adjacent high-diversity areas

## Climate Interactions
Forests both respond to and influence climate:
- **Carbon Sequestration**: Long-term CO2 storage
- **Albedo Effects**: Surface reflectivity influences temperature
- **Evapotranspiration**: Cooling through water release
- **Wind Patterns**: Forests modify local air circulation

## Management Implications
Understanding dynamics guides management:
1. **Sustainable Harvesting**: Maintaining ecosystem functions
2. **Restoration**: Accelerating natural succession
3. **Conservation**: Protecting critical habitats
4. **Monitoring**: Tracking ecosystem health
5. **Adaptive Management**: Responding to changing conditions

## Future Challenges
Emerging issues in forest dynamics:
- **Climate Change**: Shifting species ranges
- **Invasive Species**: Disrupting native communities
- **Fragmentation**: Isolating forest patches
- **Pollution**: Air and water quality impacts

## Conclusion
Forest ecosystem dynamics represent one of nature's most complex systems. Successful conservation and management require understanding these intricate relationships and processes.`,
        excerpt: "Explore the complex interactions within forest ecosystems, from energy flow and nutrient cycling to succession patterns and biodiversity dynamics.",
        author: "Prof. Michael Rodriguez",
        authorAvatar: "🌿",
        tags: ["ecosystem", "dynamics", "succession", "biodiversity", "management"],
        category: "ecology",
        upvoteCount: 89,
        downvoteCount: 3,
        confidenceScore: 0,
        viewCount: 1654,
        difficulty: "intermediate",
        estimatedReadTime: 0,
        isVerified: true,
        sources: [
          "Forest Ecology: An Introduction",
          "Principles of Forest Ecology",
          "Ecosystem Dynamics and Management"
        ]
      },
      {
        title: "Carbon Sequestration in Urban Forests",
        content: `# Carbon Sequestration in Urban Forests

## Introduction
Urban forests play a crucial role in climate change mitigation through carbon sequestration. Understanding how trees store carbon in urban environments is essential for city planning and environmental policy.

## Mechanisms of Carbon Storage
Trees sequester carbon through several mechanisms:

### Biomass Accumulation
- **Above-ground**: Trunk, branches, leaves
- **Below-ground**: Root systems
- **Annual Growth**: Continuous carbon addition

### Soil Carbon
- **Organic Matter**: Decomposed leaves and roots
- **Root Exudates**: Carbon compounds released by roots
- **Mycorrhizal Networks**: Fungal partnerships enhance storage

## Urban vs. Forest Carbon Storage
Urban trees face unique challenges:
- **Growth Constraints**: Limited soil volume
- **Stress Factors**: Pollution, heat islands, compaction
- **Species Selection**: Adapted varieties may store less carbon
- **Shorter Lifespans**: Urban stressors reduce longevity

## Quantifying Carbon Benefits
Methods for measuring carbon sequestration:

### Tree Inventories
1. **Diameter Measurements**: DBH (Diameter at Breast Height)
2. **Height Assessments**: Total tree height
3. **Species Identification**: Species-specific equations
4. **Condition Ratings**: Health impacts storage capacity

### Calculation Models
- **Allometric Equations**: Biomass from measurements
- **Growth Rates**: Annual carbon accumulation
- **iTree Software**: Urban forestry calculations
- **Life Cycle Analysis**: Long-term carbon balance

## Maximizing Urban Carbon Storage
Strategies for enhancement:

### Species Selection
- **Fast-growing Species**: Rapid carbon accumulation
- **Long-lived Trees**: Extended storage duration
- **Large Canopy Trees**: Maximum biomass potential
- **Native Species**: Better adapted to local conditions

### Planting Design
- **Adequate Spacing**: Prevents competition
- **Soil Volume**: Sufficient root space
- **Diversity**: Reduces disease/pest risks
- **Strategic Placement**: Maximizes growth potential

### Maintenance Practices
- **Proper Pruning**: Maintains tree health
- **Soil Management**: Improves growing conditions
- **Irrigation**: Supports growth in dry periods
- **Pest Management**: Protects carbon investments

## Co-benefits Beyond Carbon
Additional urban forest benefits:
- **Air Quality**: Pollution filtration
- **Energy Savings**: Building cooling/heating
- **Stormwater Management**: Runoff reduction
- **Biodiversity**: Wildlife habitat
- **Human Health**: Physical and mental wellbeing

## Economic Valuation
Monetary value of carbon services:
- **Carbon Credits**: Market value of sequestration
- **Avoided Costs**: Reduced infrastructure needs
- **Health Benefits**: Medical cost reductions
- **Property Values**: Increased real estate values

## Policy Implications
Urban forestry policy considerations:
1. **Tree Ordinances**: Protection and planting requirements
2. **Development Standards**: Tree preservation in planning
3. **Incentive Programs**: Encouraging private tree planting
4. **Budget Allocation**: Funding for urban forestry
5. **Regional Coordination**: Connecting urban forest patches

## Challenges and Solutions
Common obstacles and responses:
- **Limited Space**: Innovative planting techniques
- **Soil Compaction**: Soil improvement strategies
- **Utility Conflicts**: Careful species/location selection
- **Maintenance Costs**: Community engagement programs
- **Climate Change**: Adaptive species selection

## Future Research
Emerging areas of study:
- **Genetic Improvements**: Enhanced carbon storage varieties
- **Soil Amendments**: Biochar and other enhancers
- **Technology Integration**: IoT monitoring systems
- **Climate Modeling**: Predicting future performance

## Conclusion
Urban forests represent a significant opportunity for carbon sequestration in the fight against climate change. With proper planning, species selection, and management, cities can maximize their carbon storage potential while providing numerous co-benefits to residents.`,
        excerpt: "Discover how urban forests contribute to climate change mitigation through carbon sequestration, including measurement methods and optimization strategies.",
        author: "Dr. Lisa Park",
        authorAvatar: "🏙️",
        tags: ["carbon", "urban-forestry", "climate-change", "sequestration", "policy"],
        category: "conservation",
        upvoteCount: 156,
        downvoteCount: 12,
        confidenceScore: 0,
        viewCount: 3241,
        difficulty: "advanced",
        estimatedReadTime: 0,
        isVerified: true,
        sources: [
          "Urban Forest Carbon Storage and Sequestration",
          "Climate Change and Urban Forestry",
          "iTree Design Guide"
        ]
      }
    ];

    const articles: KnowledgeArticle[] = sampleArticles.map(article => ({
      ...article,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimatedReadTime: this.estimateReadTime(article.content),
      confidenceScore: this.calculateConfidenceScore(article.upvoteCount, article.downvoteCount)
    }));

    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }

  // Article Management
  static getAllArticles(): KnowledgeArticle[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading articles:', error);
      return [];
    }
  }

  static getArticleById(id: string): KnowledgeArticle | null {
    const articles = this.getAllArticles();
    return articles.find(article => article.id === id) || null;
  }

  static addArticle(article: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at' | 'viewCount' | 'confidenceScore' | 'estimatedReadTime'>): KnowledgeArticle {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      viewCount: 0,
      estimatedReadTime: this.estimateReadTime(article.content),
      confidenceScore: this.calculateConfidenceScore(article.upvoteCount, article.downvoteCount)
    };

    const articles = this.getAllArticles();
    articles.push(newArticle);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));

    return newArticle;
  }

  static incrementViewCount(articleId: string): void {
    const articles = this.getAllArticles();
    const article = articles.find(a => a.id === articleId);
    if (article) {
      article.viewCount++;
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    }
  }

  // Voting System
  static getUserVotes(userId: string): UserVote[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_VOTES);
      const allVotes: UserVote[] = stored ? JSON.parse(stored) : [];
      return allVotes.filter(vote => vote.userId === userId);
    } catch (error) {
      console.error('Error loading user votes:', error);
      return [];
    }
  }

  static getUserVoteForArticle(userId: string, articleId: string): UserVote | null {
    const userVotes = this.getUserVotes(userId);
    return userVotes.find(vote => vote.articleId === articleId) || null;
  }

  static voteOnArticle(userId: string, articleId: string, voteType: 'upvote' | 'downvote'): boolean {
    try {
      // Get current votes
      const allVotes: UserVote[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_VOTES) || '[]');
      const existingVoteIndex = allVotes.findIndex(v => v.userId === userId && v.articleId === articleId);
      
      // Get articles
      const articles = this.getAllArticles();
      const article = articles.find(a => a.id === articleId);
      if (!article) return false;

      // Handle existing vote
      if (existingVoteIndex >= 0) {
        const existingVote = allVotes[existingVoteIndex];
        
        // Remove old vote counts
        if (existingVote.voteType === 'upvote') {
          article.upvoteCount = Math.max(0, article.upvoteCount - 1);
        } else {
          article.downvoteCount = Math.max(0, article.downvoteCount - 1);
        }

        // If same vote type, remove vote entirely
        if (existingVote.voteType === voteType) {
          allVotes.splice(existingVoteIndex, 1);
        } else {
          // Update to new vote type
          existingVote.voteType = voteType;
          existingVote.timestamp = new Date().toISOString();
          
          // Add new vote counts
          if (voteType === 'upvote') {
            article.upvoteCount++;
          } else {
            article.downvoteCount++;
          }
        }
      } else {
        // New vote
        const newVote: UserVote = {
          userId,
          articleId,
          voteType,
          timestamp: new Date().toISOString()
        };
        allVotes.push(newVote);

        // Add vote counts
        if (voteType === 'upvote') {
          article.upvoteCount++;
        } else {
          article.downvoteCount++;
        }
      }

      // Recalculate confidence score
      article.confidenceScore = this.calculateConfidenceScore(article.upvoteCount, article.downvoteCount);
      article.updated_at = new Date().toISOString();

      // Save both votes and articles
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(allVotes));
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));

      return true;
    } catch (error) {
      console.error('Error voting on article:', error);
      return false;
    }
  }

  // Search and Filtering
  static searchArticles(search: KnowledgeSearch): KnowledgeArticle[] {
    let articles = this.getAllArticles();

    // Text search
    if (search.query) {
      const query = search.query.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (search.category && search.category !== 'all') {
      articles = articles.filter(article => article.category === search.category);
    }

    // Difficulty filter
    if (search.difficulty && search.difficulty !== 'all') {
      articles = articles.filter(article => article.difficulty === search.difficulty);
    }

    // Tag filter
    if (search.tags && search.tags.length > 0) {
      articles = articles.filter(article =>
        search.tags!.some(tag => article.tags.includes(tag))
      );
    }

    // Sorting
    switch (search.sortBy) {
      case 'confidence':
        articles.sort((a, b) => b.confidenceScore - a.confidenceScore);
        break;
      case 'recent':
        articles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        articles.sort((a, b) => b.viewCount - a.viewCount);
        break;
      default: // relevance
        // For now, just sort by confidence as relevance proxy
        articles.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    return articles;
  }

  // Statistics
  static getKnowledgeStats(): KnowledgeStats {
    const articles = this.getAllArticles();
    
    const categoryCount: Record<string, number> = {};
    let totalViews = 0;
    let totalConfidence = 0;
    let expertArticles = 0;

    articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
      totalViews += article.viewCount;
      totalConfidence += article.confidenceScore;
      if (article.isVerified) expertArticles++;
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalArticles: articles.length,
      totalViews,
      averageConfidence: articles.length > 0 ? Math.round(totalConfidence / articles.length) : 0,
      topCategories,
      expertArticles
    };
  }

  // Bodhi AI Integration
  static addBodhiQuery(query: Omit<BodhiQuery, 'id' | 'created_at'>): BodhiQuery {
    const newQuery: BodhiQuery = {
      ...query,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };

    const queries: BodhiQuery[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BODHI_QUERIES) || '[]');
    queries.push(newQuery);
    localStorage.setItem(STORAGE_KEYS.BODHI_QUERIES, JSON.stringify(queries));

    return newQuery;
  }

  static getUserBodhiQueries(userId: string): BodhiQuery[] {
    const queries: BodhiQuery[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BODHI_QUERIES) || '[]');
    return queries.filter(q => q.userId === userId);
  }
}