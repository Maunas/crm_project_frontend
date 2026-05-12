import { useCallback, useMemo, useState } from "react";

export const useModal = () => {
    const [open, setOpen] = useState<boolean | number | string>(false);
    const handleOpen = useCallback((idModal: string | number) => setOpen(idModal), []);
    const handleClose = useCallback(() => setOpen(false), []);

    //Componente para asignar rápidamente a GenericModal
    const modalProps = useMemo(() => ({ open, handleOpen, handleClose })
        , [open, handleOpen, handleClose])

    return ({ open, handleOpen, handleClose, modalProps })
}
