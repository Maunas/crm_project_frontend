import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { generalSearch } from '../../generalService'
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, Typography } from '@mui/material'
import { GenericContainer } from './layout/GenericContainer';
import type { Lead } from '../../types/leads';
import type { Campaign, Workspace } from '../../types/campaigns';
import type { Nomenclator, NomenclatorItem } from '../../types/nomenclators';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

interface SearchResults {
    leads: Lead[],
    campaigns: Campaign[],
    workspaces: Workspace[],
    nomenclators: Nomenclator[],
    nomenclator_items: NomenclatorItem[],
}

interface SearchResultsTabs<Item> {
    label: string,
    id: string,
    "aria-controls": string,
    length: number,
    list: Item[],
    getPrimaryText: (item: Item) => string,
    getSecondaryText?: (item: Item) => string,
    getDetailsLink: (item: Item) => string,

}
export const SearchResultsList = () => {

    const [results, setResults] = useState<SearchResults | null>(null)
    const [searchParams] = useSearchParams()

    const query = useMemo(() => {
        const queryParam = searchParams.get("query")
        return queryParam ? queryParam : null
    }, [searchParams])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!query) return setResults(null)
        generalSearch(query).then(setResults)
    }, [query])

    const totalResults = useMemo(() => {
        if (!results) return 0
        return Object.entries(results).reduce((acc, value) => acc + value[1].length, 0)
    }, [results])

    const [openTab, setOpenTab] = useState<number>(0)

    const handleChange = (_: React.SyntheticEvent, idx: number) => {
        setOpenTab(idx);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tabs: SearchResultsTabs<any>[] = [
        {
            label: "Leads", id: "search-leads", "aria-controls": "search-tab-leads", length: results?.leads?.length ?? 0, list: results?.leads ?? [],
            getPrimaryText: (item: Lead) => `${item.field_values[0].value} ${item.field_values[1].value}`, getDetailsLink: (item: Lead) => `/leads/${item.id}`
        },
        {
            label: "Campañas", id: "search-campaigns", "aria-controls": "search-tab-campaigns", length: results?.campaigns?.length ?? 0, list: results?.campaigns ?? [],
            getPrimaryText: (item: Campaign) => item.name!, getSecondaryText: (item: Campaign) => item.description ?? "", getDetailsLink: (item: Campaign) => `/campaigns/${item.id}`
        },
        {
            label: "Espacios de Trabajo", id: "search-workspaces", "aria-controls": "search-tab-workspaces", length: results?.workspaces?.length ?? 0, list: results?.workspaces ?? [],
            getPrimaryText: (item: Workspace) => item.name!, getSecondaryText: (item: Workspace) => item.description ?? "", getDetailsLink: (item: Workspace) => `/campaigns?selected=${item.id}`
        },
        {
            label: "Nomencladores", id: "search-nomenclators", "aria-controls": "search-tab-nomenclators", length: results?.nomenclators?.length ?? 0, list: results?.nomenclators ?? [],
            getPrimaryText: (item: Nomenclator) => item.name!, getDetailsLink: (item: Nomenclator) => `/nomenclators?selected=${item.id}`
        },
        {
            label: "Ítems de Nomenclador", id: "search-nomenclator_items", "aria-controls": "search-tab-nomenclator_items", length: results?.nomenclator_items?.length ?? 0,
            list: results?.nomenclator_items ?? [], getPrimaryText: (item: NomenclatorItem) => `${item.code} - ${item.value}`, getDetailsLink: (item: NomenclatorItem) => `/nomenclators/${item.nomenclator_id}?selected=${item.id}`
        },
    ]

    return (
        <GenericContainer maxWidth="xl">
            <Typography variant="h1" color="initial">Resultado de la Búsqueda: "{query}"</Typography>
            {totalResults > 0 ?
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={openTab} onChange={handleChange} aria-label="basic tabs example">
                            {tabs.map(tab => {
                                return (<Tab id={tab.id} aria-controls={tab["aria-controls"]} key={`tab-${tab.id}`}
                                    label={
                                        <>
                                            <Typography variant="body1" fontWeight={600}>{tab.label}</Typography>
                                            <Typography variant="body2" fontStyle="italic">{tab.length} Resultados</Typography>
                                        </>
                                    }
                                />)
                            })}
                        </Tabs>
                    </Box>
                    {tabs.map((tab, idx) => {
                        return (<CustomTabPanel value={openTab} index={idx} key={`content-${tab.id}`}>
                            <SearchList list={tab.list} listId={tab.id}
                                getPrimaryText={tab.getPrimaryText} getSecondaryText={tab.getSecondaryText} getDetailsLink={tab.getDetailsLink} />
                        </CustomTabPanel>)
                    })
                    }
                </Box>
                :
                <Typography variant="h3" color="initial" textAlign="center">No se han encontrado resultados para la búsqueda.</Typography>
            }
        </GenericContainer>
    )
}

interface SearchListProps<Item> {
    list: Item[],
    listId: string,
    getPrimaryText: (item: Item) => string,
    getSecondaryText?: (item: Item) => string,
    getDetailsLink: (item: Item) => string,
}

const SearchList = <Item,>({ list, listId, getPrimaryText, getSecondaryText, getDetailsLink }: SearchListProps<Item>) => {
    if (list.length === 0) return (
        <Typography variant="h3" color="initial" textAlign="center">No se han encontrado resultados para la búsqueda.</Typography>
    )
    return (
        <List>
            {list.map((item, idx) =>
                <ListItem key={`${listId}-${idx}`} disablePadding secondaryAction={
                    <Button aria-label="goto" variant='outlined' size='small' fullWidth endIcon={<OpenInNewIcon />}
                        component={Link} to={getDetailsLink(item)}>
                        <Typography noWrap variant="body2" fontWeight="600">Ir al Detalle</Typography>
                    </Button>
                }
                    sx={{
                        "& .MuiListItem-secondaryAction": {
                            width: 0,
                            overflow: 'hidden',
                            transition: "all ease-in-out .15s"
                        },
                        "&:hover .MuiListItem-secondaryAction": {
                            width: "9rem",
                            transition: "all ease-in-out .15s"
                        }
                    }}
                >
                    <ListItemButton component={Link} to={getDetailsLink(item)}>
                        <ListItemText primary={
                            <Typography variant="body1" fontWeight="600">{getPrimaryText(item)}</Typography>
                        }
                            secondary={getSecondaryText ? getSecondaryText(item) : ""}
                        />
                    </ListItemButton>
                </ListItem>
            )}
        </List>
    )
}