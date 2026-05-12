import { createContext } from "react";
import type { UserContextItems } from "src/stores/UserProvider";

export const UserContext = createContext<UserContextItems>({} as UserContextItems)