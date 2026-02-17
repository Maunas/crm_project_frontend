import { Box, Button, IconButton, InputBase } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
import { useState } from "react";
import { generalSearch } from "../../../generalService";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
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
    color: 'inherit',
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


export const HeaderSearchBar = () => {
    const [query, setQuery] = useState("");

    const handleSubmit = () => {
        generalSearch(query)
        .then(r=>console.log(r))
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }} />
            <Search sx={{ flexGrow: 1 }} >
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query?.length >= 3 &&
                    <Button type="button" aria-label="search" color="white" variant="outlined" 
                    sx={{ paddingBlock: ".3rem" }} onClick={handleSubmit}>
                        Buscar
                    </Button>}
            </Search>
            <Box sx={{ flexGrow: 1 }} />
        </>
    )
}
