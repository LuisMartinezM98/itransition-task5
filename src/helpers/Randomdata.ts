import { faker } from '@faker-js/faker';

// Define la estructura de los parámetros de entrada
interface GenerateUsersParams {
    region?: string;
    seed?: number;
    errors?: number;
    page?: number;
    pageSize?: number;
}

// Define la estructura del usuario
interface User {
    index: number;
    identifier: string;
    name: string;
    address: string;
    phone: string;
}

// Configuración regional
const regions: { [key: string]: string } = {
    poland: 'pl',
    usa: 'en_US',
    georgia: 'en_GE',
    // Añade más regiones si es necesario
};

// Función para inyectar errores en los datos
function injectErrors(data: User, errorCount: number): User {
    const fields = ['name', 'address', 'phone'];
    for (let i = 0; i < errorCount; i++) {
        const field = fields[Math.floor(Math.random() * fields.length)];
        if (field === 'name') {
            if (data.name.length > 1) {
                const index = Math.floor(Math.random() * data.name.length);
                data.name = data.name.slice(0, index) + data.name.slice(index + 1);
            }
        } else if (field === 'address') {
            if (data.address.length > 1) {
                const index = Math.floor(Math.random() * data.address.length);
                data.address = data.address.slice(0, index) + 'X' + data.address.slice(index + 1);
            }
        } else if (field === 'phone') {
            data.phone += Math.floor(Math.random() * 10).toString();
        }
    }
    return data;
}

// Función para generar usuarios
export function generateUsers({
    region = 'usa',
    seed = Math.floor(Math.random() * 100000),
    errors = 0,
    page = 1,
    pageSize = 20,
}: GenerateUsersParams): User[] {
    if (!regions[region.toLowerCase()]) {
        throw new Error('Región no soportada.');
    }

    // Configurar la semilla para Faker
    faker.seed(seed);

    const users: User[] = [];
    const startIndex = (page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
        let user: User = {
            index: startIndex + i,
            identifier: faker.string.uuid(), // Generar UUID
            name: faker.person.fullName(), // Cambiado a faker.person.fullName()
            address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`, // Cambios en la dirección
            phone: faker.phone.number(), // Mantener el teléfono
        };

        // Determinar si se deben inyectar errores
        const errorProbability = errors / 10;
        if (Math.random() < errorProbability) {
            user = injectErrors(user, errors);
        }

        users.push(user);
    }

    return users;
}
