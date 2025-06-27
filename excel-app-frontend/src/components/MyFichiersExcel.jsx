import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const mockData = [
  { id: 1, name: 'rapport_janvier.xlsx' },
  { id: 2, name: 'ventes_fevrier.xlsx' },
];

const MyFichiersExcel = () => {
  const [fichiers, setFichiers] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Remplacer par appel API réel si besoin
    setFichiers(mockData);
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const next = { id: Date.now(), name: newName.trim() };
    setFichiers([...fichiers, next]);
    setNewName('');
  };

  const handleDelete = (id) => {
    setFichiers(fichiers.filter((f) => f.id !== id));
  };

  const startEdit = (file) => {
    setEditingId(file.id);
    setNewName(file.name);
  };

  const handleUpdate = () => {
    setFichiers(
      fichiers.map((f) =>
        f.id === editingId ? { ...f, name: newName.trim() } : f
      )
    );
    setEditingId(null);
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-xl font-semibold mb-4">Mes Fichiers Excel</h2>
      <div className="flex mb-6 space-x-2">
        <input
          type="text"
          placeholder="Nom du fichier"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        {editingId ? (
          <button
            onClick={handleUpdate}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded"
          >
            <Edit className="h-4 w-4 mr-1" /> Mettre à jour
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
          >
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {fichiers.map((file) => (
          <li
            key={file.id}
            className="flex justify-between items-center border rounded p-3"
          >
            <span>{file.name}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => startEdit(file)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyFichiersExcel;
