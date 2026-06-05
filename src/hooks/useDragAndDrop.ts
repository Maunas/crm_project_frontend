import type { Palette } from "@mui/material/styles"
import { alpha } from "@mui/material/styles"
import React, { useCallback } from "react"

export const useDragAndDrop = <T,>(itemsList: T[], setter: (items: T[]) => void,
    customDragStart?: () => void, customDragOver?: () => void, customDrop?: () => void, customDragEnter?: () => void
) => {

    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOver, setDragOver] = React.useState<number | null>(null)

    const handleDragStart = useCallback((index: number) => {
        setDragIndex(index)
        if (customDragStart) {
            customDragStart()
            return
        }
    }, [customDragStart])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (customDragOver) {
            customDragOver()
            return
        }
    }, [customDragOver])

    const handleDrop = useCallback((index: number, last: boolean = false) => {
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
        if (customDrop) {
            customDrop()
            return
        }
    }, [customDrop, dragIndex, itemsList, setter])

    const handleDragEnter = useCallback((index: number) => {
        setDragOver(index)
        if (customDragEnter) {
            customDragEnter()
            return
        }
    }, [customDragEnter])

    const dragStyles = useCallback((idx: number, palette: Palette, direction: "column" | "row" = "column", noCursor: boolean = false) => {
        let styles: object = {
            cursor: noCursor ? undefined : (dragIndex !== null ? "grabbing" : "grab"),
            backgroundColor: dragIndex === idx ? `${alpha(palette.background.default, .5)}` : "",
            border: dragIndex === idx ? `1px solid ${alpha(palette.contrast.light, .5)}` : "",
        }
        if (direction === "column") {
            styles = {
                ...styles,
                borderTop: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(palette.secondary.main, .6)}` : "",
                borderBottom: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(palette.secondary.main, .6)}` : "",
            }
        } else {
            styles = {
                ...styles,
                borderLeft: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(palette.secondary.main, .6)}` : "",
                borderRight: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(palette.secondary.main, .6)}` : "",
            }
        }
        return styles
    }, [dragIndex, dragOver])

    const dragEvents = useCallback((idx: number, dropLast: boolean = false) => ({
        draggable: true,
        onDragEnter: () => handleDragEnter(idx),
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e),
        onDragStart: () => handleDragStart(idx),
        onDrop: () => handleDrop(idx, dropLast)
    }), [handleDragEnter, handleDragOver, handleDragStart, handleDrop])

    return ({
        dragEvents,
        dragStyles, handleDragStart, handleDragOver, handleDrop, handleDragEnter
    })
}
