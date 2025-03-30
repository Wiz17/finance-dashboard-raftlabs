"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
} from "../components/ui/tabs";
import PieExpenseChart from "../components/ui/charts/pie";
import TransactionCard from "@/components/ui/transactionCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import { deleteCookie } from "cookies-next";
import { fetcher } from "./graphql/fetcher";
import { GET_CATEGORIES, GET_TRANSACTION_BY_USER_ID } from "./graphql/queries";
import { AddUpdateTransactions } from "@/components/ui/AddUpdateTransactions";

interface TransactionNode {
  id: string;
  amount: string;
  type: "income" | "expense";
  categories?: {
    name: string;
  };
  description: string;
  created_at: string;
  user_id: string;
}

interface Transaction {
  node: TransactionNode;
}

interface PieDataItem {
  category: string;
  amount: number;
}

interface BalanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}
interface ProcessedTransaction {
  category: string;
  amount: number;
}
interface Category{
  id:string,
  name:string,
  type: 'income' | 'expense';

}
interface CategoryNode{
  node : Category
}

const calculateFinancialSummary = (
  transactions: Transaction[]
): BalanceSummary => {
  let totalBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.node.amount);

    if (transaction.node.type === "income") {
      totalIncome += amount;
      totalBalance += amount;
    } else if (transaction.node.type === "expense") {
      totalExpense += amount;
      totalBalance -= amount;
    }
  });

  return {
    totalBalance,
    totalIncome,
    totalExpense,
  };
};
function filterAndProcessTransactions(
  transactions: TransactionNode[] | Transaction[],
  type: 'income' | 'expense'
): ProcessedTransaction[] {
  return transactions
    .filter((edge) => edge.node.type === type)
    .map((edge) => ({
      category: edge.node.categories?.name || 'uncategorized',
      amount: parseFloat(edge.node.amount),
    }));
}
export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [expensePieData, setExpensePieData] = useState<PieDataItem[]>([]);
  const [incomePieData, setIncomePieData] = useState<PieDataItem[]>([]);
  const [categories1, setCategories1] = useState<CategoryNode[]>([]);
  const [filter, setFilter] = useState<{
    type: string;
    category: string;
  }>({
    type: "all",
    category: "all",
  });

  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
      return;
    }

    deleteCookie("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsAuthenticated(true);
        const userId = localStorage.getItem("user_id") || "";

        const variables = {
          user_id: userId,
        };

        console.log(variables)
        const transactions = await fetcher(
          GET_TRANSACTION_BY_USER_ID,
          variables
        );

        setTransactionData(transactions.transactionsCollection.edges);

        const expenseData: PieDataItem[] = filterAndProcessTransactions(transactions.transactionsCollection.edges, 'expense');

        setExpensePieData(expenseData);

        const incomeData: PieDataItem[] = filterAndProcessTransactions(transactions.transactionsCollection.edges, 'income');

        setIncomePieData(incomeData);

        const { totalBalance, totalIncome, totalExpense } =
          calculateFinancialSummary(transactions.transactionsCollection.edges);

        setTotalBalance(totalBalance);
        setTotalIncome(totalIncome);
        setTotalExpense(totalExpense);

        const categories = await fetcher(
          GET_CATEGORIES
        )
        setCategories1(categories.categoriesCollection.edges);
        console.log(categories.categoriesCollection.edges)
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  const handleTransactionDelete=(id:string,type:string,amount:number)=>{
    const updatedTransactions = transactionData.filter((data) => data.node.id !== id);
    if(type==="income"){
      setTotalIncome((prev) => prev - Number(amount));
      setTotalBalance((prev) => prev - Number(amount));
      // setIncomePieData((prev) => prev.filter((item) => item.category !== categories?.name));
      setIncomePieData(filterAndProcessTransactions(updatedTransactions, 'income'))
      
    }else if(type==="expense"){
      setTotalExpense((prev) => prev - Number(amount));
      setTotalBalance((prev) => prev + Number(amount));
      // setExpensePieData((prev) => prev.filter((item) => item.category !== updatedTransactions[0].node.categories?.name));
      setExpensePieData(filterAndProcessTransactions(updatedTransactions, 'expense'))
    }
    
    setTransactionData(updatedTransactions);

    
  }
  const handleTransactionAdd=(type:string, data:any)=>{
      console.log(data);
      if(type==="income"){
        setTotalIncome((prev) => prev + Number(data.amount));
        setTotalBalance((prev) => prev + Number(data.amount));
        setIncomePieData(filterAndProcessTransactions([...transactionData,{ node: data }], 'income'))
      }else if(type==="expense"){
        setTotalExpense((prev) => prev + Number(data.amount));
        setTotalBalance((prev) => prev - Number(data.amount));
        setExpensePieData(filterAndProcessTransactions([...transactionData,{node:data}], 'expense'))
        
      }
      setTransactionData((prev) => [...prev, { node: data }]);
  }

  return (
    <>
      
      <div className=" flex-col flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="ml-auto flex items-center space-x-4"></div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Button><Link href={'/savings'}>Savings</Link></Button>
              {isAuthenticated ? (
                <Button onClick={handleLogout}>Logout</Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Income
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalIncome}</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Expense
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalExpense}</div>
                    <p className="text-xs text-muted-foreground">
                      +180.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Current Balance
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalBalance}</div>
                    <p className="text-xs text-muted-foreground">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <PieExpenseChart
                      data={expensePieData}
                      title="Expenses"
                      description="Your spending by category till now"
                    />
                    <PieExpenseChart
                      data={incomePieData}
                      title="Income"
                      description="Your income by category till now"
                    />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Type Filter */}
                      <div className="flex items-center space-x-2">
                        <label htmlFor="transaction-type" className="text-sm">
                          Type:
                        </label>
                        <select
                          id="transaction-type"
                          className="rounded-md border p-2 text-sm"
                          onChange={(e) =>
                            setFilter({ ...filter, type: e.target.value })
                          }
                        >
                          <option value="all">All</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="transaction-category"
                          className="text-sm"
                        >
                          Category:
                        </label>
                        <select
                          id="transaction-category"
                          className="rounded-md border p-2 text-sm"
                          onChange={(e) =>
                            setFilter({ ...filter, category: e.target.value })
                          }
                        >
                          <option value="all">All</option>
                          {Array.from(
                            new Set(
                              transactionData.map(
                                (t) =>
                                  t.node.categories?.name || "uncategorized"
                              )
                            )
                          ).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <AddUpdateTransactions 
                        handleTransactionAdd={handleTransactionAdd} 
                        categories={categories1}
                        // handleTransactionAdd={}
                      />
                    

                    </div>

                  </CardHeader>
                  <CardContent>
                    {transactionData.length === 0 ? (
                      <div className="py-4 text-center text-gray-500">
                        No transactions found
                      </div>
                    ) : (
                      (() => {
                        const filteredTransactions = transactionData.filter(
                          (data) => {
                            // Type filter
                            if (
                              filter.type !== "all" &&
                              data.node.type !== filter.type
                            ) {
                              return false;
                            }
                            // Category filter
                            if (
                              filter.category !== "all" &&
                              (data.node.categories?.name ||
                                "uncategorized") !== filter.category
                            ) {
                              return false;
                            }
                            return true;
                          }
                        );

                        if (filteredTransactions.length === 0) {
                          return (
                            <div className="py-4 text-center text-gray-500">
                              No transactions match your filters
                            </div>
                          );
                        }

                        return filteredTransactions.map((data) => (
                          <TransactionCard
                            key={data.node.id}
                            id={data.node.id}
                            category={
                              data.node.categories?.name || "uncategorized"
                            }
                            description={data.node.description}
                            transactionType={data.node.type}
                            amount={parseFloat(data.node.amount)}
                            handleTransactionDelete={handleTransactionDelete}
                          />
                        ));
                      })()
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
