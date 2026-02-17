import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/layout"!</div>
}
