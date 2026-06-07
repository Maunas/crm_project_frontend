import { useCallback, useMemo, useState } from "react";

/**
 * Permite manejar la apertura y cierre de un modal, a partir de un id.
 */
export const useModal = () => {
    const [openModalId, setOpenModalId] = useState<string | undefined>(undefined);
    const handleOpen = useCallback((idModal: string) => setOpenModalId(idModal), []);
    const handleClose = useCallback(() => setOpenModalId(undefined), []);

    //Componente para asignar rápidamente a GenericModal
    const modalProps = useMemo(() => ({ openModalId, handleOpen, handleClose })
        , [openModalId, handleOpen, handleClose])

    return ({ openModalId, handleOpen, handleClose, modalProps })
}
