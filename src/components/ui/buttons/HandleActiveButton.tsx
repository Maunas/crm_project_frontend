import CommonButton from './CommonButton';
import type { ColorTypes } from 'src/types/mui-theme.d';

interface DisableBtnProps {
    active: boolean,
    handleActive: () => void,
    disableColor?: ColorTypes,
    disableText?: string,
    enableColor?: ColorTypes,
    enableText?: string
}

/**
 * Botón que ajusta su contenido entre "Habilitar" y "Deshabilitar" según el estado habilitado o deshabilitado de una entidad.
 * @example
 * <HandleActiveButton active={entity.active}
 *  handleActive={()=>toggleActive(entity)}
 * />
 */
const HandleActiveButton = ({ active, handleActive,
    disableColor = "error", disableText = "Deshabilitar",
    enableColor = "success", enableText = "Habilitar", ...btnProps }: DisableBtnProps) => {
    return (
        <CommonButton actionType={active ? "DISABLE" : "ENABLE"}
            onClick={handleActive} variant="outlined"
            color={active ? disableColor : enableColor} {...btnProps}>
            {active ? disableText : enableText}
        </CommonButton>
    )
}

export default HandleActiveButton