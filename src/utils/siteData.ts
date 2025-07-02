import siteData from '../data/songs.json';

// Type for a genre (reuse from storage)
import type { Genre } from './storage';

// Type for the root site data
interface SiteData {
  site: {
    header: {
      logo: string;
    };
    genres: Genre[];
  };
}

const data: SiteData = siteData as SiteData;

export default data;
