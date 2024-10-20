import readline from 'readline';
import axios from 'axios';

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
                        rl.question(`Enter DBLP author ID for author ${count + 1}: `, (dblpAuthorId) => {
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

// Function to fetch data from DBLP
async function fetchDblpData(dblpAuthorId) {
    try {
        const response = await axios.get(`https://dblp.org/search/publ/api?q=author:${dblpAuthorId}&format=json`);
        console.log('DBLP API Response:', response.data);
        if (response.data && response.data.result && response.data.result.hits && response.data.result.hits.hit) {
            const data = response.data.result.hits.hit;
            console.log(`DBLP Data for Author ID ${dblpAuthorId}:`, data);
            return data;
        } else {
            console.log(`No data found for DBLP Author ID ${dblpAuthorId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching DBLP data for ${dblpAuthorId}:`, error.response ? error.response.data : error.message);
        return null;
    }
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
        console.log('SerpAPI Request URL:', url);
        console.log('SerpAPI Request Params:', params);
        
        const response = await axios.get(url, { params });
        const data = response.data;
        console.log(`Google Scholar Data for Author ID ${googleScholarId}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching Google Scholar data for ${googleScholarId}:`, 
                      error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        return null;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// Function to fetch data for all authors in the vector
async function fetchAuthorDetails() {
    for (const author of authorIdsVector) {
        const { googleScholarId, dblpAuthorId } = author;

        // Fetch DBLP data
        const dblpData = await fetchDblpData(dblpAuthorId);

        // Fetch Google Scholar data
        const googleScholarData = await fetchGoogleScholarData(googleScholarId);

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
