export interface NameSearchResult {
  name: string;
  id: number;
}

export class NameSearcher {
  private nameArray: string[] = [];

  constructor(nameStrings: string[]) {
    this.nameArray = nameStrings;
  }

  search(query: string, maxResults: number = 10): { results: NameSearchResult[]; hasMore: boolean } {
    if (!query || query.trim().length === 0) {
      return { results: [], hasMore: false };
    }

    const lowerQuery = query.toLowerCase();
    const results: NameSearchResult[] = [];

    for (let i = 0; i < this.nameArray.length; i++) {
      const name = this.nameArray[i];
      if (name.toLowerCase().includes(lowerQuery)) {
        results.push({ name, id: i });
        
        if (results.length > maxResults) {
          return { results: results.slice(0, maxResults), hasMore: true };
        }
      }
    }

    return { results, hasMore: false };
  }

  getNameById(id: number): string | undefined {
    return this.nameArray[id];
  }
}