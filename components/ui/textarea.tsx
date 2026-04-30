import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  /**
   * If true, the textarea will automatically adjust its height based on content.
   * @default false
   */
  autoResize?: boolean
  /**
   * Minimum number of rows to show when auto-resizing.
   * @default 1
   */
  minRows?: number
  /**
   * Maximum number of rows to show when auto-resizing.
   * @default 6
   */
  maxRows?: number
}

function Textarea({
  className,
  autoResize = false,
  minRows = 1,
  maxRows = 6,
  ...props
}: TextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const adjustHeight = React.useCallback(() => {
    if (!textareaRef.current || !autoResize) return

    const textarea = textareaRef.current
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate height based on content
    const lineHeight = parseInt(
      window.getComputedStyle(textarea).lineHeight || '20px'
    )
    const paddingTop = parseInt(
      window.getComputedStyle(textarea).paddingTop || '0px'
    )
    const paddingBottom = parseInt(
      window.getComputedStyle(textarea).paddingBottom || '0px'
    )
    
    const contentHeight = textarea.scrollHeight - paddingTop - paddingBottom
    const minHeight = lineHeight * minRows
    const maxHeight = lineHeight * maxRows
    
    let newHeight = contentHeight
    
    if (contentHeight < minHeight) {
      newHeight = minHeight
    } else if (contentHeight > maxHeight && maxRows > 0) {
      newHeight = maxHeight
      textarea.style.overflowY = 'auto'
    } else {
      textarea.style.overflowY = 'hidden'
    }
    
    textarea.style.height = `${newHeight}px`
  }, [autoResize, minRows, maxRows])

  React.useEffect(() => {
    if (!autoResize) return
    adjustHeight()
  }, [autoResize, adjustHeight, props.value, props.defaultValue])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      adjustHeight()
    }
    props.onChange?.(e)
  }

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        !autoResize && "field-sizing-content min-h-16",
        autoResize && "resize-none overflow-hidden",
        className
      )}
      {...props}
      onChange={handleInput}
    />
  )
}

export { Textarea }
