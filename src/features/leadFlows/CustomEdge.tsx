import { memo } from 'react'
import type { EdgeProps } from 'reactflow'
import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface CustomEdgeData {
  onDelete: () => void
}

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.4,
  })

  const isLocked = data?.isLocked;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke: '#3c587e',
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
                bgcolor: '#fee2e2',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 14, color: '#ef4444' }} />
          </IconButton>
        </div>)}
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)
