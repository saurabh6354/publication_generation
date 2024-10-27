// utils.js - Utility functions for sorting and searching publications

export function sortPublicationsByTitle(publications, ascending = true) {
    return [...publications].sort((a, b) => 
        ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
}

export function sortPublicationsByYear(publications, ascending = true) {
    return [...publications].sort((a, b) => 
        ascending ? (a.year || 0) - (b.year || 0) : (b.year || 0) - (a.year || 0)
    );
}

export function sortPublicationsByVenue(publications, ascending = true) {
    return [...publications].sort((a, b) => 
        ascending ? (a.venue || '').localeCompare(b.venue || '') : (b.venue || '').localeCompare(a.venue || '')
    );
}

export function searchInTitle(publications, keyword) {
    return publications.filter(pub => 
        pub.title.toLowerCase().includes(keyword.toLowerCase())
    );
}

export function searchInYear(publications, year) {
    return publications.filter(pub => pub.year === parseInt(year));
}

export function searchInVenue(publications, keyword) {
    return publications.filter(pub => 
        (pub.venue || '').toLowerCase().includes(keyword.toLowerCase())
    );
}