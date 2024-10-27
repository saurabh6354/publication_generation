// dataProcessing.js - Module to process and merge publication data

/**
 * Extracts publications related to a specific author.
 * @param {Object} data - The publication data.
 * @param {string} pid - The author's unique identifier.
 * @returns {Array} - List of publications related to the author.
 */
function extractPublications(data, pid) {
    if (!data || !data.r) return [];

    const publications = data.r;
    const articles = Array.isArray(publications) ? publications : publications ? [publications] : [];

    const myPublications = articles.filter(pub => {
        const authors = [
            ...(Array.isArray(pub.article?.author) ? pub.article.author : [pub.article?.author]),
            ...(Array.isArray(pub.inproceedings?.author) ? pub.inproceedings.author : [pub.inproceedings?.author])
        ].filter(Boolean);

        return authors.some(author => author.$?.pid === pid);
    });

    return myPublications.map(pub => {
        const publicationType = pub.article || pub.inproceedings;
        const type = pub.article ? 'article' : 'inproceedings';

        let url;
        if (typeof publicationType.ee === 'string') {
            url = publicationType.ee;
        } else if (typeof publicationType.ee === 'object' && !Array.isArray(publicationType.ee)) {
            url = publicationType.ee._ || publicationType.ee;
        } else if (Array.isArray(publicationType.ee)) {
            url = publicationType.ee[0];
        } else {
            url = publicationType.url || null;
        }

        return {
            title: publicationType.title || "No Title",
            year: publicationType.year || null,
            journal: publicationType.journal || null,
            booktitle: publicationType.booktitle || null,
            pages: publicationType.pages || null,
            url: url,
            type: type,
        };
    });
}

/**
 * Merges DBLP and Google Scholar publications based on common fields.
 * @param {Array} dblpPublications - List of DBLP publications.
 * @param {Object} googleScholarData - Data from Google Scholar, containing articles.
 * @returns {Array} - Merged and sorted list of publications.
 */
function mergePublicationsCommonFields(dblpPublications, googleScholarData) {
    const dblpPubs = dblpPublications || [];
    const googlePubs = googleScholarData?.articles || [];

    const normalizeTitle = (title) => {
        return title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getUrls = (urlField) => {
        if (!urlField) return [];
        if (typeof urlField === 'string') return [urlField];
        if (Array.isArray(urlField)) return urlField.filter(url => url);
        return [];
    };

    const mergedPublicationsMap = new Map();

    // First, process the DBLP publications
    dblpPubs.forEach(pub => {
        const normalizedTitle = normalizeTitle(pub.title);
        mergedPublicationsMap.set(normalizedTitle, {
            title: pub.title,
            year: parseInt(pub.year) || null,
            venue: pub.journal || pub.booktitle || '',
            authors: [],  // This can be filled by Google Scholar data later
            urls: getUrls(pub.url)
        });
    });

    // Now, process the Google Scholar publications and merge with DBLP
    googlePubs.forEach(pub => {
        const normalizedTitle = normalizeTitle(pub.title);
        const existingPub = mergedPublicationsMap.get(normalizedTitle);

        if (existingPub) {
            // Merge data if DBLP publication already exists
            if (pub.authors?.length > 0) {
                existingPub.authors = pub.authors;
            }
            if (pub.year) {
                existingPub.year = parseInt(pub.year) || existingPub.year;
            }
            if (pub.publication) {
                existingPub.venue = existingPub.venue || pub.publication;
            }
            // Combine URLs
            const newUrls = getUrls(pub.link);
            existingPub.urls = [...new Set([...existingPub.urls, ...newUrls])];
        } else {
            // Add Google Scholar publication if it doesn't already exist in DBLP
            mergedPublicationsMap.set(normalizedTitle, {
                title: pub.title,
                year: parseInt(pub.year) || null,
                venue: pub.publication || '',
                authors: pub.authors || [],
                urls: getUrls(pub.link)
            });
        }
    });

    // Finally, convert the map to an array and sort by year (descending)
    return Array.from(mergedPublicationsMap.values())
        .sort((a, b) => (b.year || 0) - (a.year || 0));
}

// Export functions for use in other modules
export { extractPublications, mergePublicationsCommonFields };
