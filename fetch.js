import readline from 'readline';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import stringSimilarity from 'string-similarity';


// Create an interface to read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Global variable to store the vector (array of objects)
let authorIdsVector = [];

// Replace with your actual SerpAPI key
const serpApiKey = '9972e8b6f2847de4227cd23928352530839764d9b2f2249ea8a90aefdddaedb7';

// Function to populate the vector with user input
function initializeAuthorIdsVector() {
    return new Promise((resolve, reject) => {
        rl.question("Enter the size of the vector: ", (size) => {
            size = parseInt(size);
            if (isNaN(size) || size <= 0) {
                console.log("Invalid size. Exiting...");
                rl.close();
                reject("Invalid size");
                return;
            }

            let count = 0;
            function askForIds() {
                if (count < size) {
                    rl.question(`Enter Google Scholar ID for author ${count + 1}: `, (googleScholarId) => {
                        rl.question(`Enter DBLP author ID (PID) for author ${count + 1}: `, (dblpAuthorId) => {
                            // Store the input in the vector
                            authorIdsVector.push({
                                googleScholarId: googleScholarId,
                                dblpAuthorId: dblpAuthorId
                            });
                            count++;
                            askForIds(); // Continue asking for the next author
                        });
                    });
                } else {
                    console.log("Author IDs Vector:", authorIdsVector);
                    rl.close(); // Close the readline interface when done
                    resolve();
                }
            }

            askForIds(); // Start the loop
        });
    });
}

// Function to fetch publications from DBLP using PID
async function fetchPublications(dblpAuthorId) {
    const url = `https://dblp.org/pid/${dblpAuthorId}.xml`; // URL for the PID
    try {
        const response = await axios.get(url);
        const xml = response.data;
        const json = await parseStringPromise(xml, { explicitArray: false });
        return extractPublications(json.dblpperson, dblpAuthorId); // Pass the dblpperson object
    } catch (error) {
        console.error('Error fetching publications:', error);
        return null;
    }
}

// Function to extract only the person's publications
function extractPublications(data, pid) {
    const publications = data.r; // Accessing the publications
    const articles = Array.isArray(publications) ? publications : publications ? [publications] : [];

    // Filter publications where the specified PID is one of the authors
    const myPublications = articles.filter(pub => {
        const authors = [
            ...(Array.isArray(pub.article?.author) ? pub.article.author : [pub.article?.author]),
            ...(Array.isArray(pub.inproceedings?.author) ? pub.inproceedings.author : [pub.inproceedings?.author])
        ].filter(Boolean); // Combine and filter out nulls

        return authors.some(author => author.$?.pid === pid); // Check by PID
    });

    // Map to a simpler object
    return myPublications.map(pub => {
        const publicationType = pub.article || pub.inproceedings;
        const type = pub.article ? 'article' : 'inproceedings'; // Determine type

        return {
            title: publicationType.title || "No Title",
            year: publicationType.year || "No Year",
            journal: publicationType.journal || null,
            booktitle: publicationType.booktitle || null,
            pages: publicationType.pages || null,
            url: publicationType.ee || publicationType.url || null, // Handle the URL properly
            type: type,
        };
    });
}

// Function to fetch data from Google Scholar via SerpAPI
async function fetchGoogleScholarData(googleScholarId) {
    try {
        const url = 'https://serpapi.com/search.json';
        const params = {
            engine: 'google_scholar_author',
            author_id: googleScholarId,
            api_key: serpApiKey
        };
        
        const response = await axios.get(url, { params });
        const data = response.data;
        return data;
    } catch (error) {
        console.error(`Error fetching Google Scholar data for ${googleScholarId}:`, 
                      error.response ? error.response.data : error.message);
        return null;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mergePublications(dblpPublications, googleScholarData) {
    if (!dblpPublications || !googleScholarData || !googleScholarData.articles) {
        return [];
    }

    // Convert Google Scholar data to a similar format as DBLP
    const googleScholarPublications = googleScholarData.articles.map(article => ({
        title: article.title,
        year: article.year,
        journal: article.publication,
        url: article.link,
        type: 'article',
        source: 'google_scholar'
    }));

    // Mark DBLP publications with source
    const markedDblpPubs = dblpPublications.map(pub => ({
        ...pub,
        source: 'dblp'
    }));

    // Initialize merged publications with DBLP data
    let mergedPublications = [...markedDblpPubs];

    // Process each Google Scholar publication
    googleScholarPublications.forEach(scholarPub => {
        // Check if a similar publication exists in DBLP data
        const similarPub = markedDblpPubs.find(dblpPub => {
            const titleSimilarity = stringSimilarity.compareTwoStrings(
                dblpPub.title.toLowerCase(),
                scholarPub.title.toLowerCase()
            );
            // Consider publications similar if titles are 85% similar and years match
            return titleSimilarity > 0.85 && dblpPub.year === scholarPub.year;
        });

        if (similarPub) {
            // Merge information from both sources
            const mergedIndex = mergedPublications.findIndex(pub => pub === similarPub);
            mergedPublications[mergedIndex] = {
                ...similarPub,
                urls: [
                    similarPub.url,
                    scholarPub.url
                ].filter(Boolean)
            };
        } else {
            // Add new publication from Google Scholar
            mergedPublications.push(scholarPub);
        }
    });

    return mergedPublications;
}

// Function to fetch data for all authors in the vector
async function fetchAuthorDetails() {
    for (const author of authorIdsVector) {
        const { googleScholarId, dblpAuthorId } = author;

        // Fetch DBLP data
        const dblpPublications = await fetchPublications(dblpAuthorId);
        
        // Fetch Google Scholar data
        const googleScholarData = await fetchGoogleScholarData(googleScholarId);

        // Merge publications
        const mergedPublications = mergePublications(dblpPublications, googleScholarData);
        
        console.log(`Merged publications for author:`, mergedPublications);
        console.log('------------------------------');
        await delay(1000);
    }
}

// Main function to control the flow
async function main() {
    try {
        await initializeAuthorIdsVector();  // Wait for user input to finish
        await fetchAuthorDetails();  // Fetch details after input is collected
    } catch (error) {
        console.log("Error:", error);
    }
}

// Start the process
main();

// Author IDs Vector: [ { googleScholarId: 'ko7X14wAAAAJ', dblpAuthorId: '366/4067' } ]
