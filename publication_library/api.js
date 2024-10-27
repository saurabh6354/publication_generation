// api.js - Module to handle API interactions
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const serpApiKey = '9972e8b6f2847de4227cd23928352530839764d9b2f2249ea8a90aefdddaedb7';

export async function fetchPublications(dblpAuthorId) {
    if (!dblpAuthorId) {
        console.warn('No DBLP Author ID provided. Skipping publication fetch.');
        return null;
    }

    try {
        const response = await axios.get(`https://dblp.org/pid/${dblpAuthorId}.xml`);
        const json = await parseStringPromise(response.data, { explicitArray: false });
        return json.dblpperson;
    } catch (error) {
        console.error('Error fetching publications:', error);
        return null;
    }
}

export async function fetchGoogleScholarData(googleScholarId) {
    if (!googleScholarId) {
        console.warn('No Google Scholar ID provided. Skipping Google Scholar data fetch.');
        return null;
    }

    try {
        const url = 'https://serpapi.com/search.json';
        const params = {
            engine: 'google_scholar_author',
            author_id: googleScholarId,
            api_key: serpApiKey
        };

        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching Google Scholar data:`, error.message);
        return null;
    }
}