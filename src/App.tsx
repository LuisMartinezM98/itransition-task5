import { useState, useEffect, useCallback, useRef } from 'react';
import { generateUsers } from './helpers/Randomdata';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface User {
  index: number;
  identifier: string;
  name: string;
  address: string;
  phone: string;
}

function App() {
  const [region, setRegion] = useState<string>('usa');
  const [errors, setErrors] = useState<number>(0);
  const [errorInput, setErrorInput] = useState<number>(0);
  const [seed, setSeed] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const pageRef = useRef<number>(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const pageSize = 100;

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000);
    setSeed(randomSeed.toString());
  };

  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const generatedUsers = generateUsers({
        region,
        seed: seed ? Number(seed) : Math.floor(Math.random() * 100000),
        errors,
        page: pageRef.current,
        pageSize,
      });

      if (generatedUsers.length < pageSize) {
        setHasMore(false);
      }

      setUsers(prevUsers => [...prevUsers, ...generatedUsers]);
      pageRef.current += 1;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  }, [region, seed, errors, hasMore, loading]);

  useEffect(() => {
    setUsers([]);
    pageRef.current = 1;
    setHasMore(true);
    fetchUsers();
  }, [region, seed, errors, fetchUsers]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchUsers();
      }
    });

    const lastUserElement = document.querySelector('.user:last-child');
    if (lastUserElement) {
      observerRef.current.observe(lastUserElement);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [users, fetchUsers, hasMore, loading]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
  };

  const handleErrorsChange = (value: number | string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0 && num <= 1000) {
      setErrors(num > 10 ? 10 : num);
      setErrorInput(num);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setErrors(Number(value));
    setErrorInput(Number(value));
  };

  const handleErrorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setErrorInput(Number(value));
    handleErrorsChange(value);
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(e.target.value);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('User Data', 10, 10);
  
    const tableColumn = ['ID', 'UUID', 'Name', 'Address', 'Phone'];
    const tableRows: any[] = [];
  
    users.forEach(user => {
      const userData = [
        user.index,
        user.identifier,
        user.name,
        user.address,
        user.phone,
      ];
      tableRows.push(userData);
    });
  
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
  
    doc.save('users.pdf');
  };
  

  return (
    <div className="p-10 text-white">
      <h1 className="text-cyan-600 font-semibold">Faker users</h1>
      <div className="controls">
        <div className="control-group">
          <label className="text-cyan-600 font-semibold">Región:</label>
          <select className="bg-gray-500 rounded-lg m-4" value={region} onChange={handleRegionChange}>
            <option value="poland">Polonia</option>
            <option value="usa">EE.UU.</option>
            <option value="georgia">Georgia</option>
          </select>
        </div>
        <div className="flex justify-center items-center gap-4 p-2 bg-gradient-to-bl from-gray-600 to-gray-500 rounded-lg">
          <label className="text-cyan-600 font-bold">Number of errors:</label>
          <input
            type="range"
            min="0"
            max="10"
            value={errors}
            onChange={handleSliderChange}
            className="mx-4"
          />
          <input
            type="number"
            min="0"
            max="1000"
            value={errorInput}
            onChange={handleErrorInputChange}
            className="bg-gray-500 rounded-lg text-center"
          />
        </div>
        <div className="control-group mt-5 text-cyan-600 font-semibold flex gap-8">
          <label className="font-bold text-xl">Seed:</label>
          <input
            type="number"
            value={seed}
            onChange={handleSeedChange}
            placeholder="Seed"
            className="bg-gray-600 text-center text-cyan-1002"
          />
          <button onClick={generateRandomSeed} className="bg-cyan-600 px-2 py-1 text-white rounded-lg">Random</button>
        </div>
        <button onClick={exportToPDF} className="mt-4 bg-cyan-600 px-4 py-2 text-white rounded-lg">
          Export
        </button>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">UUID</th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Address</th>
            <th scope="col" className="px-6 py-3">Cellphone</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.identifier} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 user">
              <td className="px-6 py-4">{user.index}</td>
              <td className="px-6 py-4">{user.identifier}</td>
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.address}</td>
              <td className="px-6 py-4">{user.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p>Cargando más usuarios...</p>}
      {!hasMore && <p>No hay más usuarios para mostrar.</p>}
    </div>
  );
}

export default App;
