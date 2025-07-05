export interface Site {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdAt: string;
  treeCount?: number;
}

export class SiteService {
  private static STORAGE_KEY = 'arboracle_sites';

  static getAllSites(): Site[] {
    try {
      const sitesJson = localStorage.getItem(this.STORAGE_KEY);
      return sitesJson ? JSON.parse(sitesJson) : [];
    } catch (error) {
      console.error('Error loading sites:', error);
      return [];
    }
  }

  static createSite(siteData: Omit<Site, 'id' | 'createdAt'>): Site {
    const site: Site = {
      ...siteData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const sites = this.getAllSites();
    sites.push(site);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sites));
    
    return site;
  }

  static updateSite(siteId: string, updates: Partial<Site>): Site | null {
    const sites = this.getAllSites();
    const siteIndex = sites.findIndex(site => site.id === siteId);
    
    if (siteIndex === -1) return null;
    
    sites[siteIndex] = { ...sites[siteIndex], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sites));
    
    return sites[siteIndex];
  }

  static deleteSite(siteId: string): boolean {
    const sites = this.getAllSites();
    const filteredSites = sites.filter(site => site.id !== siteId);
    
    if (filteredSites.length === sites.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSites));
    return true;
  }

  static getSiteById(siteId: string): Site | null {
    const sites = this.getAllSites();
    return sites.find(site => site.id === siteId) || null;
  }
}