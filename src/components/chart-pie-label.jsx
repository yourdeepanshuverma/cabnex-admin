import { ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a label";

const chartConfig = {
  yesterday: {
    label: "Yesterday",
    color: "var(--chart-1)",
  },
  lastWeek: {
    label: "Last Week",
    color: "var(--chart-2)",
  },
  lastMonth: {
    label: "Last Month",
    color: "var(--chart-3)",
  },
  last3Months: {
    label: "Last 3 Months",
    color: "var(--chart-4)",
  },
  last6Months: {
    label: "Last 6 Months",
    color: "var(--chart-5)",
  },
};

export function ChartPieLabel({ data }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Bookings Pie Chart</CardTitle>
        <CardDescription>May - October 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="bookings" label nameKey="time" />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Spiked up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground text-center leading-none">
          Showing total bookings for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
