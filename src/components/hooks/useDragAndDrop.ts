import { alpha, useTheme } from "@mui/material/styles"
import React from "react"

export const useDragAndDrop = <T,>(itemsList: T[], setter: (items: T[]) => void,
    customDragStart?: () => void, customDragOver?: () => void, customDrop?: () => void, customDragEnter?: () => void
) => {

    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOver, setDragOver] = React.useState<number | null>(null)

    const theme = useTheme()

    const handleDragStart = (index: number) => {
        if (customDragStart) {
            customDragStart()
            return
        }
        setDragIndex(index)
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (customDragOver) {
            customDragOver()
            return
        }
        e.preventDefault()
    }
    const handleDrop = (index: number, last: boolean = false) => {
        if (customDrop) {
            customDrop()
            return
        }
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
        if (customDragEnter) {
            customDragEnter()
            return
        }
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

    const dragEvents = (idx: number, dropLast: boolean = false) => ({
        draggable: true,
        onDragEnter: () => handleDragEnter(idx),
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e),
        onDragStart: () => handleDragStart(idx),
        onDrop: () => handleDrop(idx, dropLast)
    })

    return ({
        dragEvents,
        dragStyles, handleDragStart, handleDragOver, handleDrop, handleDragEnter
    })
}
