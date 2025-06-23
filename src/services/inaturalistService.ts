import axios from 'axios';
import { iNaturalistObservation, iNaturalistSearchParams } from '@/types';
import { TaxonomicHierarchy } from '@/types/tree';

const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';

export class iNaturalistService {
  static async searchObservations(params: iNaturalistSearchParams): Promise<iNaturalistObservation[]> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/observations`, {
        params: {
          ...params,
          iconic_taxa: 'Plantae', // Focus on plants for tree identification
          order: 'desc',
          order_by: 'created_at'
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching iNaturalist observations:', error);
      return [];
    }
  }

  static async getObservationById(id: number): Promise<iNaturalistObservation | null> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/observations/${id}`);
      return response.data.results?.[0] || null;
    } catch (error) {
      console.error('Error fetching iNaturalist observation:', error);
      return null;
    }
  }

  static async searchSpecies(query: string, filterTrees: boolean = false): Promise<any[]> {
    try {
      const params: any = {
        q: query,
        rank: 'species,genus,subspecies,variety',
        iconic_taxa: 'Plantae',
        per_page: 30
      };

      // Add tree-specific filtering to API call
      if (filterTrees) {
        // Focus on woody plant families and tree-like growth forms
        params.taxon_name = query;
        // Add high-level taxonomic filtering for major tree groups
        // Note: iNaturalist doesn't have direct "growth_form" filtering, 
        // so we rely on family-level and post-processing filtering
        params.order_by = 'observations_count'; // Prioritize well-documented species
        params.order = 'desc';
      }

      const response = await axios.get(`${INATURALIST_API_BASE}/taxa`, {
        params
      });

      let results = response.data.results || [];

      // Post-process filtering for trees if requested
      if (filterTrees) {
        results = results.filter((taxon: any) => {
          // Filter based on common tree indicators
          const name = (taxon.name || '').toLowerCase();
          const commonName = (taxon.preferred_common_name || '').toLowerCase();
          const ancestryString = (taxon.ancestry || '').toLowerCase();
          
          // Comprehensive tree family names (scientific families known to contain trees)
          const treeFamilies = [
            // Major tree families
            'fagaceae',      // Oaks, beeches, chestnuts
            'pinaceae',      // Pines, firs, spruces, hemlocks
            'cupressaceae',  // Cypresses, junipers, redwoods
            'rosaceae',      // Cherries, apples, hawthorns
            'salicaceae',    // Willows, poplars, aspens
            'betulaceae',    // Birches, alders, hazels
            'juglandaceae',  // Walnuts, hickories, pecans
            'oleaceae',      // Ashes, olives, lilacs
            'aceraceae',     // Maples (now part of Sapindaceae)
            'sapindaceae',   // Maples, horse chestnuts, buckeyes
            'magnoliaceae',  // Magnolias, tulip trees
            'lauraceae',     // Laurels, sassafras, spicebush
            'moraceae',      // Mulberries, figs
            'ulmaceae',      // Elms, zelkovas
            'tiliaceae',     // Lindens, basswoods
            'platanaceae',   // Sycamores, plane trees
            'hamamelidaceae', // Witch hazels, sweet gums
            'cornaceae',     // Dogwoods, tupelos
            'aquifoliaceae', // Hollies
            'anacardiaceae', // Sumacs, pistachios
            'rutaceae',      // Citrus trees
            'meliaceae',     // Mahoganies, cedars
            'bignoniaceae',  // Catalpas, jacarandas
            'fabaceae',      // Locusts, acacias, mimosas
            'leguminosae',   // Alternative name for Fabaceae
            'hippocastanaceae', // Horse chestnuts (now in Sapindaceae)
            'ginkgoaceae',   // Ginkgo
            'taxaceae',      // Yews
            'araucariaceae', // Monkey puzzles, Norfolk pines
            'podocarpaceae', // Podocarps
            'cycadaceae',    // Cycads
            'arecaceae',     // Palms
            'palmae',        // Alternative name for Arecaceae
            'myrtaceae',     // Eucalyptus, tea trees
            'proteaceae',    // Grevilleas, banksias
            'nothofagaceae', // Southern beeches
            'dipterocarpaceae', // Dipterocarps
            'malvaceae',     // Baobabs, kapoks (includes Bombacaceae)
            'bombacaceae',   // Baobabs, kapoks (now in Malvaceae)
            'sterculiaceae', // Cacao family (now mostly in Malvaceae)
            'elaeagnaceae',  // Russian olives
            'caprifoliaceae', // Elders, viburnums
            'adoxaceae',     // Elders (some moved from Caprifoliaceae)
            'altingiaceae',  // Sweet gums (separated from Hamamelidaceae)
            'cercidiphyllaceae', // Katsura trees
            'euphorbiaceae', // Spurge family (some tree species)
            'simaroubaceae', // Tree of heaven family
            'burseraceae',   // Frankincense trees
            'anacardiaceae', // Cashew family
            'combretaceae',  // Terminalia family
            'lythraceae',    // Crape myrtles
            'melastomataceae', // Some tropical trees
            'rubiaceae',     // Coffee family (some trees)
            'apocynaceae',   // Dogbane family (some trees)
            'araliaceae',    // Ivy family (some trees)
            'nyssaceae',     // Tupelo family
            'davidiaceae',   // Dove trees
            'eucommiaceae',  // Hardy rubber trees
            'styracaceae',   // Styrax family
            'ebenaceae',     // Ebony family
            'sapotaceae',    // Sapodilla family
            'theaceae',      // Tea family (some trees)
            'ericaceae',     // Heath family (some tree species like madrones)
            'primulaceae',   // Some tree species
            'tamaricaceae',  // Tamarisk family
            'casuarinaceae', // She-oaks
            'vitaceae',      // Some climbing trees
            'cannabaceae',   // Hackberries, hops (some trees)
            'urticaceae',    // Nettle family (some trees)
            'celastraceae',  // Staff tree family
            'rhamnaceae',    // Buckthorn family
            'thymelaeaceae', // Mezereum family
            'elaeocarpaceae', // Some tropical trees
            'cunoniaceae',   // Some southern hemisphere trees
            'escalloniaceae', // Some trees and shrubs
            'grossulariaceae', // Some tree-like species
            'pentaphylacaceae', // Some Asian trees
            'actinidiaceae', // Kiwi family (some trees)
            'clethraceae',   // White alder family
            'cyrillaceae',   // Cyrilla family
            'diapensiaceae', // Some shrubs/small trees
            'fouquieriaceae', // Ocotillo family
            'garryaceae',    // Silk tassel family
            'griseliniaceae', // Some trees
            'halorrhagaceae', // Some aquatic trees
            'icacinaceae',   // Some tropical trees
            'iteaceae',      // Sweetspire family
            'staphyleaceae', // Bladdernut family
            'trochodendraceae', // Wheel trees
            'winteraceae',   // Winter's bark family
            'xyridaceae',    // Yellow-eyed grass (some tree-like)
          ];

          // Comprehensive tree genera and common indicators
          const treeIndicators = [
            // Common tree names
            'tree', 'oak', 'maple', 'pine', 'elm', 'birch', 'cedar', 'fir',
            'spruce', 'poplar', 'willow', 'ash', 'cherry', 'apple', 'walnut',
            'beech', 'hickory', 'basswood', 'linden', 'sycamore', 'magnolia',
            'tulip', 'dogwood', 'redbud', 'catalpa', 'locust', 'cottonwood',
            'juniper', 'hemlock', 'chestnut', 'ginkgo', 'cypress', 'redwood',
            'sequoia', 'eucalyptus', 'palm', 'bamboo', 'acacia', 'alder',
            'aspen', 'balsam', 'buttonwood', 'cork', 'hazel', 'hawthorn',
            'ironwood', 'laurel', 'mahogany', 'mulberry', 'persimmon', 'plane',
            'sweetgum', 'tamarack', 'tupelo', 'yellowwood', 'yew', 'arborvitae',
            // Scientific genera commonly trees
            'quercus', 'acer', 'pinus', 'picea', 'abies', 'tsuga', 'larix',
            'pseudotsuga', 'sequoia', 'sequoiadendron', 'taxodium', 'thuja',
            'chamaecyparis', 'juniperus', 'cupressus', 'cedrus', 'tilia',
            'fagus', 'castanea', 'carya', 'juglans', 'fraxinus', 'ulmus',
            'platanus', 'liquidambar', 'liriodendron', 'magnolia', 'prunus',
            'malus', 'pyrus', 'crataegus', 'sorbus', 'salix', 'populus',
            'betula', 'alnus', 'corylus', 'ostrya', 'carpinus', 'cornus',
            'nyssa', 'catalpa', 'robinia', 'gleditsia', 'gymnocladus',
            'cladrastis', 'sophora', 'maclura', 'morus', 'ficus', 'celtis',
            'zelkova', 'planera', 'diospyros', 'paulownia', 'ginkgo',
            'metasequoia', 'cunninghamia', 'cryptomeria', 'sciadopitys',
            'taxus', 'cephalotaxus', 'torreya', 'podocarpus', 'araucaria',
            'agathis', 'wollemia', 'eucalyptus', 'melaleuca', 'callistemon',
            'grevillea', 'banksia', 'hakea', 'casuarina', 'allocasuarina',
            'nothofagus', 'phoenix', 'washingtonia', 'sabal', 'livistona',
            'trachycarpus', 'chamaerops', 'rhapis', 'cycas', 'zamia',
            'ceratozamia', 'dioon', 'encephalartos', 'macrozamia', 'stangeria',
            'bowenia', 'lepidozamia', 'chigua', 'microcycas'
          ];

          // Check if it's likely a tree based on name or ancestry
          const hasTreeIndicator = treeIndicators.some(indicator => 
            name.includes(indicator) || commonName.includes(indicator)
          );

          // Check if it belongs to a tree family
          const hasTreeFamily = treeFamilies.some(family => 
            ancestryString.includes(family) || name.includes(family)
          );

          // Check rank - prefer species and genus level for trees
          const appropriateRank = ['species', 'genus', 'subspecies', 'variety', 'form'].includes(taxon.rank?.toLowerCase());

          // Additional filtering - exclude obvious non-trees but be more specific
          const excludeTerms = [
            'herb', 'forb', 'annual', 'perennial herb', 'herbaceous',
            'vine', 'liana', 'climber', 'climbing',
            'fern', 'pteridophyte', 'moss', 'bryophyte', 'lichen', 'algae',
            'fungus', 'mushroom', 'toadstool',
            'grass', 'sedge', 'rush', 'graminoid',
            'succulent', 'cactus', 'cacti',
            'aquatic', 'floating', 'submerged'
          ];
          
          // More nuanced exclusion - only exclude if explicitly mentioned as non-tree
          const isExcluded = excludeTerms.some(term => {
            const termRegex = new RegExp(`\\b${term}\\b`, 'i');
            return termRegex.test(name) || termRegex.test(commonName);
          });

          // Additional checks for shrubs - only exclude small shrubs, not large woody plants
          const shrubExclusions = [
            'dwarf', 'prostrate', 'low-growing', 'ground cover', 'groundcover',
            'mat-forming', 'cushion', 'compact'
          ];
          
          const isSmallShrub = shrubExclusions.some(term => {
            const termRegex = new RegExp(`\\b${term}\\b`, 'i');
            return termRegex.test(name) || termRegex.test(commonName);
          }) && (name.includes('shrub') || commonName.includes('shrub'));

          // Include if it has tree indicators or belongs to tree families, 
          // has appropriate rank, and is not explicitly excluded
          return (hasTreeIndicator || hasTreeFamily) && appropriateRank && !isExcluded && !isSmallShrub;
        });
      }

      return results;
    } catch (error) {
      console.error('Error searching species:', error);
      return [];
    }
  }

  static async getNearbyObservations(
    lat: number, 
    lng: number, 
    radius: number = 10
  ): Promise<iNaturalistObservation[]> {
    return this.searchObservations({
      lat,
      lng,
      radius,
      per_page: 50,
      quality_grade: 'research'
    });
  }

  static buildObservationUrl(observation: iNaturalistObservation): string {
    return `https://www.inaturalist.org/observations/${observation.id}`;
  }

  static getPhotoUrl(photo: any, size: 'square' | 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      square: 's',
      small: 'm', 
      medium: 'l',
      large: 'xl'
    };
    
    return photo.url.replace('/square/', `/${sizeMap[size]}/`);
  }

  static async getDetailedTaxonInfo(taxonId: number): Promise<any> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}`);
      const taxon = response.data.results?.[0];
      
      if (taxon) {
        // Get additional photos for this taxon
        const photosResponse = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}/photos`);
        const photos = photosResponse.data.results || [];
        
        return {
          ...taxon,
          enhanced_photos: photos.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            attribution: photo.attribution,
            license: photo.license_code,
            size_variants: {
              square: this.getPhotoUrl(photo, 'square'),
              small: this.getPhotoUrl(photo, 'small'),
              medium: this.getPhotoUrl(photo, 'medium'),
              large: this.getPhotoUrl(photo, 'large')
            }
          })),
          description: taxon.wikipedia_summary || taxon.description,
          distribution_info: taxon.establishment_means || 'Unknown',
          conservation_status: taxon.conservation_status?.status_name || 'Not Evaluated'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching detailed taxon info:', error);
      return null;
    }
  }

  static async searchTreeSpecies(query: string): Promise<any[]> {
    return this.searchSpecies(query, true);
  }

  static async searchEcosystemSpecies(query: string): Promise<any[]> {
    return this.searchSpecies(query, false);
  }

  /**
   * Parse full taxonomic hierarchy from iNaturalist taxon data
   */
  static parseTaxonomicHierarchy(taxon: any): TaxonomicHierarchy {
    const taxonomy: TaxonomicHierarchy = {};
    
    if (!taxon) return taxonomy;

    // Set the current taxon's rank and name
    if (taxon.rank && taxon.name) {
      const rank = taxon.rank.toLowerCase();
      const name = taxon.name;
      
      switch (rank) {
        case 'kingdom':
          taxonomy.kingdom = name;
          break;
        case 'phylum':
          taxonomy.phylum = name;
          break;
        case 'class':
          taxonomy.class = name;
          break;
        case 'order':
          taxonomy.order = name;
          break;
        case 'family':
          taxonomy.family = name;
          break;
        case 'genus':
          taxonomy.genus = name;
          break;
        case 'species':
          taxonomy.species = name;
          break;
        case 'subkingdom':
          taxonomy.subkingdom = name;
          break;
        case 'subphylum':
          taxonomy.subphylum = name;
          break;
        case 'subclass':
          taxonomy.subclass = name;
          break;
        case 'suborder':
          taxonomy.suborder = name;
          break;
        case 'subfamily':
          taxonomy.subfamily = name;
          break;
        case 'subgenus':
          taxonomy.subgenus = name;
          break;
        case 'subspecies':
          taxonomy.subspecies = name;
          break;
        case 'variety':
          taxonomy.variety = name;
          break;
        case 'form':
          taxonomy.form = name;
          break;
      }
    }

    // Parse ancestors for complete hierarchy
    if (taxon.ancestors && Array.isArray(taxon.ancestors)) {
      taxon.ancestors.forEach((ancestor: any) => {
        if (ancestor.rank && ancestor.name) {
          const rank = ancestor.rank.toLowerCase();
          const name = ancestor.name;
          
          switch (rank) {
            case 'kingdom':
              taxonomy.kingdom = name;
              break;
            case 'phylum':
              taxonomy.phylum = name;
              break;
            case 'class':
              taxonomy.class = name;
              break;
            case 'order':
              taxonomy.order = name;
              break;
            case 'family':
              taxonomy.family = name;
              break;
            case 'genus':
              taxonomy.genus = name;
              break;
            case 'species':
              taxonomy.species = name;
              break;
            case 'subkingdom':
              taxonomy.subkingdom = name;
              break;
            case 'subphylum':
              taxonomy.subphylum = name;
              break;
            case 'subclass':
              taxonomy.subclass = name;
              break;
            case 'suborder':
              taxonomy.suborder = name;
              break;
            case 'subfamily':
              taxonomy.subfamily = name;
              break;
            case 'subgenus':
              taxonomy.subgenus = name;
              break;
          }
        }
      });
    }

    return taxonomy;
  }

  /**
   * Get detailed taxon information including full taxonomic hierarchy
   */
  static async getDetailedTaxonWithHierarchy(taxonId: number): Promise<any> {
    try {
      const response = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}`);
      const taxon = response.data.results?.[0];
      
      if (taxon) {
        // Get additional photos for this taxon
        const photosResponse = await axios.get(`${INATURALIST_API_BASE}/taxa/${taxonId}/photos`);
        const photos = photosResponse.data.results || [];
        
        return {
          ...taxon,
          taxonomy: this.parseTaxonomicHierarchy(taxon),
          enhanced_photos: photos.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            attribution: photo.attribution,
            license: photo.license_code,
            size_variants: {
              square: this.getPhotoUrl(photo, 'square'),
              small: this.getPhotoUrl(photo, 'small'),
              medium: this.getPhotoUrl(photo, 'medium'),
              large: this.getPhotoUrl(photo, 'large')
            }
          })),
          description: taxon.wikipedia_summary || taxon.description,
          distribution_info: taxon.establishment_means || 'Unknown',
          conservation_status: taxon.conservation_status?.status_name || 'Not Evaluated'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching detailed taxon info with hierarchy:', error);
      return null;
    }
  }
}