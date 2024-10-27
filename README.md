
# script.js Program Overview

The `script.js` program is a Node.js script that allows you to fetch, search, and sort publication data from DBLP and Google Scholar. It supports flexible sorting and searching functionalities and can be customized using command-line arguments.

## Features

1. **Fetch Publications**: Retrieves publications from DBLP using the specified DBLP Author ID (PID) and includes mock data for Google Scholar using the specified Google Scholar ID.
2. **Sorting Options**: Allows sorting the publications by:
   - `title`: Sort alphabetically by the title.
   - `year`: Sort by the publication year.
   - `venue`: Sort alphabetically by the venue (journal or conference).
   - Sorting can be done in ascending (`asc`) or descending (`desc`) order.
3. **Search Functionality**: Allows filtering the publications based on a search term. You can search in:
   - `title`: Filters publications that match the search term in the title.
   - `venue`: Filters publications that match the search term in the venue.
   - `year`: Filters publications that match the search term in the year.

## Usage

### Prerequisites

- Ensure you have Node.js installed.
- Install the required dependencies:
  ```bash
  npm install axios xml2js yargs
  ```

### Running the Script

Run the script by providing the Google Scholar ID and DBLP Author ID along with optional parameters for sorting and searching.

```bash
node script.js --google-scholar-id=<GoogleScholarID> --dblp-author-id=<DblpAuthorID> [options]
```

### Command-Line Options

- `--google-scholar-id` or `-g`: The Google Scholar ID of the author (required).
- `--dblp-author-id` or `-d`: The DBLP Author ID (PID) of the author (required).
- `--sort-by` or `-s`: Sort the publications by `title`, `year`, or `venue`. Default is `year`.
- `--order` or `-o`: Specify the sorting order as `asc` (ascending) or `desc` (descending). Default is `desc`.
- `--search` or `-q`: Provide a search term to filter the publications based on title, venue, or year.

### Examples

1. **Sort by Title in Ascending Order**
   ```bash
   node script.js --google-scholar-id=iHigKrEAAAAJ --dblp-author-id=58/1076-1 --sort-by=title --order=asc
   ```

2. **Search for Publications with "Blockchain" in the Title or Venue**
   ```bash
   node script.js --google-scholar-id=iHigKrEAAAAJ --dblp-author-id=58/1076-1 --search=Blockchain
   ```

3. **Sort by Year and Search for Publications in 2023**
   ```bash
   node script.js --google-scholar-id=iHigKrEAAAAJ --dblp-author-id=58/1076-1 --sort-by=year --search=2023
   ```

4. **Search for "IoT" and Sort by Venue in Descending Order**
   ```bash
   node script.js --google-scholar-id=iHigKrEAAAAJ --dblp-author-id=58/1076-1 --search=IoT --sort-by=venue --order=desc
   ```

## Notes

- The current implementation uses mock data for Google Scholar for demonstration purposes.
- The program supports flexible searching and sorting configurations through command-line arguments.