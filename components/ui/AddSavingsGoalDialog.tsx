import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { fetcher } from '@/app/graphql/fetcher';
import { ADD_SAVINGS_GOAL } from '@/app/graphql/queries';

interface SavingsGoalNode {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  willing_to_add?: number;
  target_date?: string;
  category?: string;
  is_completed: boolean;
  created_at: string;
}

interface AddSavingsGoalDialogProps {
  addToGoal: (goal: SavingsGoalNode) => void;
}

export function AddSavingsGoalDialog({ addToGoal }: AddSavingsGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [willingToAdd, setWillingToAdd] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const variables = {
        name,
        current_amount: amount,
        target_amount: targetAmount,
        willing_to_add: willingToAdd,
        target_date: targetDate,
        category,
        user_id: typeof window !== 'undefined' ? localStorage.getItem('user_id') : '',
        is_completed: false
      };

      const response = await fetcher(
        ADD_SAVINGS_GOAL, 
        variables
      );

      if (!response?.insertIntoSavingsCollection?.records?.[0]) {
        throw new Error('Failed to create goal');
      }

      addToGoal(response.insertIntoSavingsCollection.records[0]);
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setTargetAmount('');
    setWillingToAdd('');
    setTargetDate('');
    setCategory('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Goal Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className='mt-3'
            />
          </div>
          <div>
            <Label>Current Amount (INR)</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              min="0.01" 
              step="0.01" 
              className='mt-3'
            />
          </div>
          <div>
            <Label>Target Amount (INR)</Label>
            <Input 
              type="number" 
              value={targetAmount} 
              onChange={(e) => setTargetAmount(e.target.value)} 
              required 
              min="0.01" 
              step="0.01" 
              className='mt-3'
            />
          </div>
          <div>
            <Label>Willing to Add (INR)</Label>
            <Input 
              type="number" 
              value={willingToAdd} 
              onChange={(e) => setWillingToAdd(e.target.value)} 
              required 
              min="0.01" 
              step="0.01" 
              className='mt-3'
            />
          </div>
          <div>
            <Label>Target Date</Label>
            <Input 
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)} 
              className='mt-3'
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className='mt-3'
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}