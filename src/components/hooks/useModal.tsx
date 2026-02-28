import { useState } from "react";

export const useModal = () => {
    const [open, setOpen] = useState<boolean | number | string>(false);
    const handleOpen = (idModal: string | number) => setOpen(idModal);
    const handleClose = () => setOpen(false);

    return ({ modalProps: { open, handleOpen, handleClose } })
}
