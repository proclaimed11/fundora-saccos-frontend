import type { ComponentType, ReactNode } from "react"
import type { LucideProps } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type SectionCardProps = {
  icon?: ComponentType<LucideProps>
  title: string
  children: ReactNode
  headerAction?: ReactNode
  className?: string
  contentClassName?: string
}

const SectionCard = ({
  icon: Icon,
  title,
  children,
  headerAction,
  className,
  contentClassName,
}: SectionCardProps) => {
  return (
    <Card className={className}>
      <CardContent className={cn("flex flex-col gap-4", contentClassName)}>
        <div className="flex flex-col">
          <div className="-mx-(--card-spacing) -mt-(--card-spacing) flex h-9 items-center justify-between gap-2 rounded-tl-xl border-l-4 border-l-primary px-3">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="size-5 text-muted-foreground/60" strokeWidth={1.0} />}
              <h3 className="text-base font-semibold">{title}</h3>
            </div>
            {headerAction}
          </div>

          <Separator className="-mx-(--card-spacing) mt-0 w-auto bg-border/50" />
        </div>

        {children}
      </CardContent>
    </Card>
  )
}

export default SectionCard