"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ExpenseData {
  category: string
  amount: number
}

interface PieExpenseChartProps {
  data: ExpenseData[]
  title?: string
  description?: string
}

const getCategoryColor = (category: string, index: number) => {
  const colors = [
    "hsl(4, 90%, 58%)",    // Red
    "hsl(207, 90%, 54%)",  // Blue
    "hsl(122, 39%, 49%)",  // Green
    "hsl(36, 100%, 50%)",  // Orange
    "hsl(261, 51%, 51%)",  // Purple
    "hsl(1, 100%, 64%)",   // Pink
    "hsl(190, 90%, 50%)",  // Teal
    "hsl(291, 64%, 42%)",  // Deep Purple
    "hsl(39, 100%, 50%)",  // Gold
    "hsl(162, 73%, 46%)",  // Mint
    "hsl(334, 89%, 52%)",  // Magenta
    "hsl(221, 83%, 53%)",  // Royal Blue
  ];
  return colors[index % colors.length];
};

// Function to aggregate amounts by category
const aggregateByCategory = (data: ExpenseData[]): ExpenseData[] => {
  const categoryMap = new Map<string, number>();

  data.forEach((item) => {
    if (categoryMap.has(item.category)) {
      categoryMap.set(item.category, categoryMap.get(item.category)! + item.amount);
    } else {
      categoryMap.set(item.category, item.amount);
    }
  });

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
};

export default function PieExpenseChart({ 
  data, 
  title = "Expense Breakdown", 
  description = "Your expense distribution by category" 
}: PieExpenseChartProps) {
  // Aggregate data by category
  const aggregatedData = React.useMemo(() => aggregateByCategory(data), [data]);

  const totalExpenses = React.useMemo(() => {
    return aggregatedData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [aggregatedData])

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    return aggregatedData.map((item, index) => ({
      category: item.category,
      amount: item.amount,
      fill: getCategoryColor(item.category, index),
    }))
  }, [aggregatedData])

  // Generate dynamic chart config
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
      },
    }
    
    aggregatedData.forEach((item, index) => {
      config[item.category.toLowerCase()] = {
        label: item.category,
        color: getCategoryColor(item.category, index),
      }
    })
    
    return config
  }, [aggregatedData])

  return (
    <Card className="flex flex-col mt-5">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {aggregatedData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            ₹{totalExpenses.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total {title}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-lg font-medium text-gray-500">No expense data</p>
            <p className="text-sm text-gray-400">
              Add {title} to see the breakdown
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {title} distribution <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing {title} by category
        </div>
      </CardFooter>
    </Card>
  )
}