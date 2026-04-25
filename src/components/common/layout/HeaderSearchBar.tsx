import { CircularProgress, InputBase, List, ListItem, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { generalSearch } from "../../../generalService";
import type { SearchResults } from "../../../types/common";
import { useDebounce } from "../../hooks/useDebounce";

const Search = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.contrast.light}`,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
    },
    width: '100%',
    display: "flex",
    alignItems: "center",
}));


const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flexGrow: 1,
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 0),
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const SearchWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    marginRight: theme.spacing(2),
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    "&:focus-within .search-options-wrap": {
        display: "block"
    }
}));

const SearchOptions = styled('div')(() => ({
    position: 'absolute',
    width: '100%',
    alignItems: "center",
    display: "none"
}));

export const HeaderSearchBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults | null>(null);

    const { debouncedFunction, loading } = useDebounce(500)

    useEffect(() => {
        if (query.length < 3) return
        debouncedFunction(() => generalSearch(query)
            .then(setResults)
            .catch(() => setResults(null))
        )
    }, [query, debouncedFunction])

    const options = useMemo(() => [
        {
            label: "Leads", id: "search-bar-leads", "aria-controls": "search-bar-leads", length: results?.leads?.length ?? 0
        },
        {
            label: "Campañas", id: "search-bar-campaigns", "aria-controls": "search-bar-campaigns", length: results?.campaigns?.length ?? 0
        },
        {
            label: "Espacios de Trabajo", id: "search-bar-workspaces", "aria-controls": "search-bar-workspaces", length: results?.workspaces?.length ?? 0
        },
        {
            label: "Nomencladores", id: "search-bar-nomenclators", "aria-controls": "search-bar-nomenclators", length: results?.nomenclators?.length ?? 0
        },
        {
            label: "Ítems de Nomenclador", id: "search-bar-nomenclator_items", "aria-controls": "search-bar-nomenclator_items", length: results?.nomenclator_items?.length ?? 0
        },
    ], [results])

    const lengthText = (length: number) => {
        if (length === 0) return "Sin resultados"
        if (length === 1) return "1 resultado"
        return `${length} resultados`
    }

    const totalResults = useMemo(() => {
        if (!results) return 0
        return Object.entries(results).reduce((acc, value) => acc + value[1].length, 0)
    }, [results])

    return (

        <SearchWrapper sx={{ flexGrow: 1 }}>
            <Search className="search-input-wrap">
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase className="search-input"
                    placeholder="Buscar en la página"
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </Search>
            {query.length >= 3 &&
                <SearchOptions className="search-options-wrap">
                    <Paper>
                        <List>
                            {loading &&
                                <ListItem disablePadding >
                                    <ListItemButton>
                                        <ListItemText primary={
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <CircularProgress size="1.5rem" />
                                                <Typography variant="body1">Cargando...</Typography>
                                            </Stack>
                                        } />
                                    </ListItemButton>
                                </ListItem>
                            }
                            {!loading && totalResults > 0 &&
                                options.map((option, idx) => {
                                    return <ListItem disablePadding key={option.id} sx={{ display: option.length > 0 ? "block" : "none" }}>
                                        <ListItemButton component={Link} to={`/search?query=${query}&tab=${idx}`}>
                                            <ListItemText primary={
                                                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                                                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>{`- ${lengthText(option.length)}`}</Typography>
                                                </Stack>
                                            }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                })
                            }
                            {!loading && totalResults === 0 &&
                                <ListItem disablePadding >
                                    <ListItemButton>
                                        <ListItemText primary={"No hay resultados"} />
                                    </ListItemButton>
                                </ListItem>
                            }
                        </List>
                    </Paper>
                </SearchOptions>}
        </SearchWrapper>

    )
}
