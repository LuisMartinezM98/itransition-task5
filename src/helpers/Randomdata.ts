import { faker as fakerEN } from '@faker-js/faker/locale/en';
import { faker as fakerPL } from '@faker-js/faker/locale/pl';

interface GenerateUsersParams {
    region?: string;
    seed?: number;
    errors?: number;
    page?: number;
    pageSize?: number;
}

interface User {
    index: number;
    identifier: string;
    name: string;
    address: string;
    phone: string;
}

const regionFakers: { [key: string]: any } = {
    poland: fakerPL,
    usa: fakerEN,
};

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

export function generateUsers({
    region = 'usa',
    seed = Math.floor(Math.random() * 100000),
    errors = 0,
    page = 1,
    pageSize = 20,
}: GenerateUsersParams): User[] {
    const faker = regionFakers[region.toLowerCase()];

    if (!faker) {
        throw new Error('Región no soportada.');
    }
    faker.seed(seed);

    const users: User[] = [];
    const startIndex = (page - 1) * pageSize + 1;

    for (let i = 0; i < pageSize; i++) {
        let user: User = {
            index: startIndex + i,
            identifier: faker.string.uuid(),
            name: faker.person.fullName(),
            address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
            phone: faker.phone.number(),
        };

        const errorProbability = errors / 10;
        if (Math.random() < errorProbability) {
            user = injectErrors(user, errors);
        }

        users.push(user);
    }

    return users;
}
