        // index.js - Main module to manage publications

        import { fetchPublications, fetchGoogleScholarData } from './api.js';
        import { mergePublicationsCommonFields } from './dataProcessing.js';
        import {
            sortPublicationsByTitle,
            sortPublicationsByYear,
            sortPublicationsByVenue,
            searchInTitle,
            searchInYear,
            searchInVenue,
        } from './utils.js';

        /**
         * Fetch and merge publications for a list of authors.
         * @param {Array} authors - Array of author objects with googleScholarId and dblpAuthorId.
         * @returns {Array} - Merged list of publications for all authors.
         */
        export async function getPublicationsForAuthors(authors) {
            let mergedPublicationsData = [];

            for (const author of authors) {
                const { googleScholarId, dblpAuthorId } = author;

                // Fetch publications from DBLP
                const dblpData = await fetchPublications(dblpAuthorId);
                const dblpPublications = dblpData ? dblpData.r : [];

                // Fetch publications from Google Scholar using SerpAPI
                const googleScholarData = await fetchGoogleScholarData(googleScholarId);

                // Merge DBLP and Google Scholar publications
                const mergedPublications = mergePublicationsCommonFields(dblpPublications, googleScholarData);

                // Add the merged publications to our main list
                mergedPublicationsData = mergedPublicationsData.concat(mergedPublications);
            }

            return mergedPublicationsData;
        }

        /**
         * Example usage of the library's functionalities for a website.
         */
        async function exampleUsage() {
            const authors = [
                {
                    googleScholarId: 'INSERT_GOOGLE_SCHOLAR_ID_1',
                    dblpAuthorId: 'INSERT_DBLP_ID_1',
                },
                {
                    googleScholarId: 'INSERT_GOOGLE_SCHOLAR_ID_2',
                    dblpAuthorId: 'INSERT_DBLP_ID_2',
                },
                // Add more authors as needed
            ];

            try {
                // Fetch and merge publications
                const publications = await getPublicationsForAuthors(authors);

                // Sort by title (ascending)
                const sortedByTitleAsc = sortPublicationsByTitle(publications, true);
                console.log('Sorted by title (ascending):', sortedByTitleAsc);

                // Sort by year (descending)
                const sortedByYearDesc = sortPublicationsByYear(publications, false);
                console.log('Sorted by year (descending):', sortedByYearDesc);

                // Search in titles
                const searchTitleResults = searchInTitle(publications, 'machine learning');
                console.log('Search results for titles including "machine learning":', searchTitleResults);

                // Search by year
                const searchYearResults = searchInYear(publications, 2023);
                console.log('Search results for year 2023:', searchYearResults);

                // Search in venue
                const searchVenueResults = searchInVenue(publications, 'NeurIPS');
                console.log('Search results for venue "NeurIPS":', searchVenueResults);

            } catch (error) {
                console.error('Error fetching or processing publications:', error);
            }
        }

        // Example usage in a website (uncomment to test)
        // exampleUsage();