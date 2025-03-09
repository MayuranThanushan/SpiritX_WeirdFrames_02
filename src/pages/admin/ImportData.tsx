import React, { useState } from 'react';
import { importPlayersData } from '../../lib/firebase';
import { PlayerData } from '../../types';
import { Upload } from 'lucide-react';

const ImportData = () => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processCSVData = (csvData: string) => {
    const lines = csvData.trim().split('\n');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const player: PlayerData = {
        name: values[0],
        university: values[1],
        category: values[2],
        totalRuns: parseInt(values[3]),
        ballsFaced: parseInt(values[4]),
        inningsPlayed: parseInt(values[5]),
        wickets: parseInt(values[6]),
        oversBowled: parseInt(values[7]),
        runsConceded: parseInt(values[8])
      };
      return player;
    });
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);
      setSuccess(false);

      const playersData = processCSVData(`Name,University,Category,Total Runs,Balls Faced,Innings Played,Wickets,Overs Bowled,Runs Conceded
Chamika Chandimal,University of the Visual & Performing Arts,Batsman,530,588,10,0,3,21
Dimuth Dhananjaya,University of the Visual & Performing Arts,All-Rounder,250,208,10,8,40,240
[... rest of the data ...]`);

      await importPlayersData(playersData);
      setSuccess(true);
    } catch (err) {
      setError('Failed to import data. Please try again.');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Players Data</h2>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Upload className="w-5 h-5 mr-2" />
            {importing ? 'Importing...' : 'Import Data'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
            Data imported successfully!
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>This will import the provided dataset into the database with the following processing:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Calculate batting strike rate and average</li>
            <li>Calculate bowling strike rate and economy</li>
            <li>Compute player points based on performance</li>
            <li>Determine player value based on points</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportData;