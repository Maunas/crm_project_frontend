import type { ColorTypes } from 'src/types/mui-theme.d';
import CommonButton from './CommonButton';


interface DisableBtnProps {
    active: boolean,
    handleActive: () => void,
    disableColor?: ColorTypes,
    disableText?: string,
    enableColor?: ColorTypes,
    enableText?: string
}

const HandleActiveButton = ({ active, handleActive,
    disableColor = "error", disableText = "Deshabilitar",
    enableColor = "success", enableText = "Habilitar", ...btnProps }: DisableBtnProps) => {
    return active ?
        <CommonButton actionType='DISABLE' handleClick={handleActive} variant="outlined" color={disableColor}
            {...btnProps}>
            {disableText}
        </CommonButton>
        : <CommonButton actionType='ENABLE' handleClick={handleActive} variant="outlined" color={enableColor}
            {...btnProps}>
            {enableText}
        </CommonButton>
}

export default HandleActiveButton