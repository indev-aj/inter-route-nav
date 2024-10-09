import * as fs from 'fs';

class Helper {
    static saveToJsonFile = (title, data) => {
        let jsonString;
        try {
            jsonString = JSON.stringify(data, this.#getCircularReplacer(), 2); // Pretty print with 2 spaces indentation
        } catch (error) {
            console.error('Error stringifying json: ', error);
            return;
        }

        // Write the stringified graph to a file
        const fileName = title + '.json';
        fs.writeFile('output/' + fileName, jsonString, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
    };

    static saveToFile = (title, data) => {
        const filename = 'output/' + title + '.txt';

        // Convert the array (or object) to a string
        const dataString = JSON.stringify(data, null, 2); // Otherwise, convert to JSON string

        fs.writeFile(filename, dataString, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
    }

    static #getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return; // Remove cyclic reference
                }
                seen.add(value);
            }
            return value;
        };
    }
}

export default Helper;