import React, { useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

const MyFichiersExcel = () => {
  const [fichiers, setFichiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetch(`${API_BASE}/api/conversions/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFichiers(data.conversions);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching conversions:', err);
        setLoading(false);
      });
  }, [token]);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (file) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) throw new Error('Authentication token not found.');

      const response = await fetch(
        `${API_BASE}/api/debug/download-excel/${file.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Downloaded file is empty');

      downloadBlob(blob, file.original_filename.replace(/\.[^/.]+$/, '') + '.xlsx');
    } catch (err) {
      console.error('Download error:', err);
      alert(err.message || 'Failed to download file');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversion ?')) {
      return;
    }

    fetch(`${API_BASE}/api/conversions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) setFichiers((prev) => prev.filter((f) => f.id !== id));
        else console.error('Suppression échouée :', res.statusText);
      })
      .catch((err) => console.error('Delete error:', err));
  };

  if (loading) return <p className="text-center mt-6">Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-xl font-semibold mb-4">Mes Conversions</h2>
      {fichiers.length === 0 ? (
        <p>Aucune conversion trouvée.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {fichiers.map((file) => (
              <motion.li
                key={file.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                className="flex justify-between items-center border rounded p-3 overflow-hidden"
              >
                <div>
                  {file.original_filename.replace(/\.[^/.]+$/, '')}
                  {/*<a
                    href={`${API_BASE}/${file.excel_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm"
                  >
                    Aperçu Excel
                  </a>*/}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Download className="h-5 w-5 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default MyFichiersExcel;
