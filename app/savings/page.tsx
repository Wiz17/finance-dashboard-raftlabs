"use client";
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddSavingsGoalDialog } from '../../components/ui/AddSavingsGoalDialog';
import { DELETE_SAVINGS_GOAL, GET_SAVINGS_GOAL, UPDATE_SAVINGS_GOAL } from '../graphql/queries';
import { fetcher } from '../graphql/fetcher';
import Link from "next/link";
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


interface SavingsGoalNode {
  id: string;
  user_id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  willing_to_add?: number | string;
  target_date?: string;
  category?: string;
  is_completed: boolean;
  created_at: string;
}

interface SavingsGoalEdge {
  node: SavingsGoalNode;
}



export default function SavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoalEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        if (!userId) {
          throw new Error('User ID not found');
        }

        const variables = {
          user_id: userId
        };

        const response = await fetcher(GET_SAVINGS_GOAL, variables);
        
        if (!response?.savingsCollection?.edges) {
          throw new Error('Invalid response structure');
        }

        setGoals(response.savingsCollection.edges);
      } catch (error) {
        console.error('Error fetching goals:', error instanceof Error ? error.message : 'Unknown error');
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  const addToGoal = (data: SavingsGoalNode) => {
    setGoals(prevGoals => [...prevGoals, { node: data }]);
  };

  const updateToGoal = async (goalId: string, givenAmount: number, givenCurrentAmount: number) => {
    try {
      const newAmount = String(Number(givenAmount) + Number(givenCurrentAmount));
      
      // Optimistic UI update
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.node.id === goalId 
            ? { ...goal, node: { ...goal.node, current_amount: newAmount } } 
            : goal
        )
      );

      const variables = {
        id: goalId,
        amount: newAmount
      };

      await fetcher(UPDATE_SAVINGS_GOAL, variables);
    } catch (error) {
      console.error('Error updating goal:', error instanceof Error ? error.message : 'Unknown error');
      // Revert optimistic update on error
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.node.id === goalId 
            ? { ...goal, node: { ...goal.node, current_amount: givenCurrentAmount } } 
            : goal
        )
      );
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      setLoading(true);
      
      const variables = { id: goalId };
      await fetcher(DELETE_SAVINGS_GOAL, variables);
      
      setGoals(prevGoals => prevGoals.filter(goal => goal.node.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Savings Goals</CardTitle>
          <div>
          <Link href={'/'} className='text-blue-600 underline mr-4'>Dashboard</Link>

          <AddSavingsGoalDialog addToGoal={addToGoal} />
          </div>

        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-4">
            <p>No savings goals yet.</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.node.id} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">{goal.node.name}</h3>
                <span>
                  ₹{goal.node.current_amount.toLocaleString('en-IN')} / ₹{goal.node.target_amount.toLocaleString('en-IN')}
                </span>
              </div>
              <Progress 
                value={Number(goal.node.current_amount) / Number(goal.node.target_amount) * 100} 
                className="h-2 mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{goal.node.category || 'Uncategorized'}</span>
                {goal.node.target_date && (
                  <span>Target: {new Date(goal.node.target_date).toLocaleDateString()}</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateToGoal(goal.node.id, Number(goal.node.willing_to_add) || 100, Number(goal.node.current_amount))}
                >
                  Add ₹{(goal.node.willing_to_add || 100).toLocaleString('en-IN')}
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteGoal(goal.node.id)}
                  className="ml-auto"
                >
                <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
                  
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}