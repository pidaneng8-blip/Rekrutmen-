import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { CandidateResult } from '../types';

// Fix: Create a simple DB service to store and retrieve results.
type DbData = {
    results: CandidateResult[];
};

const adapter = new JSONFile<DbData>('db.json');
const defaultData: DbData = { results: [] };
const db = new Low<DbData>(adapter, defaultData);

export const initDb = async () => {
    await db.read();
    db.data ||= defaultData;
    await db.write();
};

export const addResult = async (result: CandidateResult) => {
    await db.read();
    if (!db.data.results) {
        db.data.results = [];
    }
    db.data.results.push(result);
    await db.write();
    return result;
};

export const getResults = async (): Promise<CandidateResult[]> => {
    await db.read();
    // Ensure results exist and are sorted
    const results = db.data.results || [];
    return results.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
};
