import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@appkit/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@appkit/ui";
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  type LucideIcon,
} from "lucide-react";

type TemplateModule = {
  id: number;
  area: string;
  owner: string;
  purpose: string;
  status: string;
  boundary: string;
};

const statusIcons: Record<string, LucideIcon> = {
  Ready: CheckCircle2Icon,
  Scaffolded: CircleDotDashedIcon,
  Placeholder: CircleDashedIcon,
};

export function DataTable({ data }: { data: TemplateModule[] }) {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Template map</CardTitle>
          <CardDescription>
            The dashboard is sample UI for the starter kit. These rows describe the repository areas
            this screen is meant to orient around.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden border-t">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8rem] sm:w-[10rem]">Area</TableHead>
                  <TableHead className="hidden w-[10rem] md:table-cell">Owner</TableHead>
                  <TableHead className="min-w-0">Purpose</TableHead>
                  <TableHead className="w-[7.5rem]">Status</TableHead>
                  <TableHead className="hidden w-[12rem] lg:table-cell">Boundary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const StatusIcon = statusIcons[item.status] ?? CircleDashedIcon;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="min-w-0 font-medium">
                        <div className="truncate" title={item.area}>
                          {item.area}
                        </div>
                      </TableCell>
                      <TableCell className="hidden min-w-0 text-muted-foreground md:table-cell">
                        <div className="truncate" title={item.owner}>
                          {item.owner}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 text-muted-foreground">
                        <div className="truncate" title={item.purpose}>
                          {item.purpose}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          <StatusIcon className="size-3.5" />
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden min-w-0 text-muted-foreground lg:table-cell">
                        <div className="truncate" title={item.boundary}>
                          {item.boundary}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
