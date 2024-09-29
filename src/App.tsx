import { useState, useEffect, useCallback } from 'react';
import { generateUsers } from './helpers/Randomdata'; // Asegúrate de que la ruta es correcta

// Define el tipo de cada usuario generado
interface User {
  index: number;
  identifier: string;
  name: string;
  address: string;
  phone: string;
}

function App() {
  // Estado de la aplicación con tipos explícitos
  const [region, setRegion] = useState<string>('usa');
  const [errors, setErrors] = useState<number>(0);
  const [errorInput, setErrorInput] = useState<number>(0);
  const [seed, setSeed] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const pageSize = 20;

  // Función para generar una semilla aleatoria
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 100000);
    setSeed(randomSeed.toString());
  };

  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      // Llamar a la función local
      const generatedUsers = generateUsers({
        region,
        seed: seed ? Number(seed) : Math.floor(Math.random() * 100000),
        errors,
        page,
        pageSize,
      });

      if (generatedUsers.length < pageSize) {
        setHasMore(false);
      }
      setUsers(prevUsers => [...prevUsers, ...generatedUsers]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
    setLoading(false);
  }, [region, seed, errors, page, loading, hasMore]);
  

  // Efecto para resetear usuarios cuando se cambian los parámetros
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    fetchUsers(); // Llama a fetchUsers aquí
  }, [region, seed, errors, fetchUsers]);

  // Handler para scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 &&
        hasMore &&
        !loading
      ) {
        fetchUsers();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchUsers, hasMore, loading]);

  // Handlers para los controles
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

  return (
    <div className=" p-10 text-white">
      <h1 className='text-cyan-600 font-semibold'>Faker users</h1>
      <div className="controls">
        <div className="control-group">
          <label className='text-cyan-600 font-semibold'>Región:</label>
          <select className='bg-gray-500 rounded-lg m-4' value={region} onChange={handleRegionChange}>
            <option value="poland">Polonia</option>
            <option value="usa">EE.UU.</option>
            <option value="georgia">Georgia</option>
            {/* Añade más opciones si es necesario */}
          </select>
        </div>
        <div className="flex  justify-center items-center gap-4  p-2 bg-gradient-to-bl from-gray-600 to-gray-500 rounded-lg">
          <label className='text-cyan-600 font-bold'>Número de errores por registro:</label>
          <input
            type="range"
            min="0"
            max="10"
            value={errors}
            onChange={handleSliderChange}
            className='mx-4'
          />
          <input
            type="number"
            min="0"
            max="1000"
            value={errorInput}
            onChange={handleErrorInputChange}
            className='bg-gray-500 rounded-lg text-center'
          />
        </div>
        <div className="control-group mt-5 text-cyan-600 font-semibold flex gap-8">
          <label className='font-bold text-xl'>Semilla:</label>
          <input
            type="number"
            value={seed}
            onChange={handleSeedChange}
            placeholder="Ingrese una semilla"
            className='bg-gray-600 text-center text-cyan-1002'
          />
          <button onClick={generateRandomSeed}>[Aleatorio]</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Índice</th>
            <th>Identificador Aleatorio</th>
            <th>Nombre Completo</th>
            <th>Dirección</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.identifier}>
              <td>{user.index}</td>
              <td>{user.identifier}</td>
              <td>{user.name}</td>
              <td>{user.address}</td>
              <td>{user.phone}</td>
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
