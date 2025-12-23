import {promises as fs} from 'fs';


export async function readDataFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        if(!data) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file from disk: ${error}`);
        throw error;
    }   
}
export async function writeDataToFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing file to disk: ${error}`);
        throw error;
    }
}