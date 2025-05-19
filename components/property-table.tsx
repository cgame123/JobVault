import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface PropertyTableProps {
  properties: Array<{
    name: string
    total: number
    count: number
  }>
}

export function PropertyTable({ properties }: PropertyTableProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader>
        <CardTitle>Property Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Property</TableHead>
              <TableHead className="text-right text-zinc-400">Receipts</TableHead>
              <TableHead className="text-right text-zinc-400">Total Expenses</TableHead>
              <TableHead className="text-right text-zinc-400">Average Per Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell colSpan={4} className="h-24 text-center text-zinc-400">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.name} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-100">{property.name}</TableCell>
                  <TableCell className="text-right text-zinc-100">{property.count}</TableCell>
                  <TableCell className="text-right text-zinc-100">{formatCurrency(property.total)}</TableCell>
                  <TableCell className="text-right text-zinc-100">
                    {formatCurrency(property.count > 0 ? property.total / property.count : 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
