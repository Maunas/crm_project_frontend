import { alpha, useTheme } from "@mui/material/styles"
import React from "react"

export const useDragAndDrop = <T,>(itemsList: T[], setter: React.Dispatch<React.SetStateAction<T[]>>) => {

    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOver, setDragOver] = React.useState<number | null>(null)

    const theme = useTheme()

    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }
    const handleDrop = (index: number, last: boolean = false) => {
        if (dragIndex == null) return
        const items = [...itemsList]
        const draggedItem = items[dragIndex]
        items.splice(dragIndex, 1)
        if (last) {
            items.push(draggedItem)
        } else {
            items.splice(index, 0, draggedItem)
        }
        setter(items)
        setDragIndex(null)
        setDragOver(null)
    }

    const handleDragEnter = (index: number) => {
        setDragOver(index)
    }

    const dragStyles = (idx: number, direction: "column" | "row" = "column") => {

        let styles: object = {
            cursor: dragIndex !== null ? "grabbing" : "grab",
            backgroundColor: dragIndex === idx ? `${alpha(theme.palette.background.default, .5)}` : "",
            border: dragIndex === idx ? `1px solid ${alpha(theme.palette.contrast.light, .5)}` : "",
        }
        if (direction === "column") {
            styles = {
                ...styles,
                borderTop: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
                borderBottom: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
            }
        } else {
            styles = {
                ...styles,
                borderLeft: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
                borderRight: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
            }
        }
        return styles
    }

    return ({
        dragStyles, handleDragStart, handleDragOver, handleDrop, handleDragEnter
    })
}
