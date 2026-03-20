import type { UserData } from "../types/users";

export const mockUsers: UserData[] = [
    {
        email: "admin@gmail.com",
        password: "admin",
        organization_ids: [1,2,3]
    },
    {
        email: "user@gmail.com",
        password: "user",
        organization_ids: [4,5,6]
    },
]