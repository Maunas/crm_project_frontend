import { memo } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge, } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import { IconButton, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface CustomEdgeData {
  onDelete: () => void
}

function CustomEdge({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, markerStart, data }: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.4,
  })

  const theme = useTheme()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLocked = (data as any)?.isLocked;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke: theme.palette.contrast.light,
        }}
      />
      <EdgeLabelRenderer>
        {!isLocked && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <IconButton
              size="small"
              onClick={() => data?.onDelete?.()}
              sx={{
                bgcolor: 'white',
                boxShadow: 1,
                width: 24,
                height: 24,
                '&:hover': {
                  bgcolor: `${theme.palette.error.lighter}`,
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 14, color: theme.palette.error.darker }} />
            </IconButton>
          </div>)}
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)
