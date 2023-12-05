interface User {
  name: string;
  id: number;
  phone: number;
}

export async function getUsers() {
    const res = await fetch("https://jsonplaceholder.typicode.com/users")
    const users: User[] = await res.json()

    return users;
}